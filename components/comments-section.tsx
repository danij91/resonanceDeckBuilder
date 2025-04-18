// ✅ 최적화 적용 완료된 CommentsSection.tsx 전체 코드
"use client"

import { useEffect, useState, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import { Trash2, Clock, Edit2, X, Check, ChevronDown } from "lucide-react"
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  limit,
  startAfter,
  getDocs,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"
import { db } from "../lib/firebase-config"
import { useLanguage } from "../contexts/language-context"

interface Comment {
  id: string
  content: string
  date: string
  userId: string
  lastEdited?: string
}

interface CommentsProps {
  currentLanguage: string
}

function mapToLocale(lang: string): string {
  const localeMap: Record<string, string> = {
    ko: "ko-KR",
    en: "en-US",
    cn: "zh-CN",
    zh: "zh-CN",
    jp: "ja-JP",
    tw: "zh-TW",
  }
  return localeMap[lang] || "en-US"
}

export function CommentsSection({ currentLanguage }: CommentsProps) {
  const { getTranslatedString } = useLanguage()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [lastCommentTime, setLastCommentTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [canComment, setCanComment] = useState<boolean>(true)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState<string>("")

  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const COMMENTS_PER_PAGE = 5
  const locale = mapToLocale(currentLanguage)

  useEffect(() => {
    if (typeof window === "undefined") return
    const existing = localStorage.getItem("anonymousUserId")
    if (existing) setUserId(existing)
    else {
      const newId = uuidv4()
      localStorage.setItem("anonymousUserId", newId)
      setUserId(newId)
    }
    const lastTime = localStorage.getItem("lastCommentTime")
    if (lastTime) setLastCommentTime(Number.parseInt(lastTime, 10))
  }, [])

  useEffect(() => {
    if (editingCommentId) return setCanComment(true)
    if (!lastCommentTime) return setCanComment(true)
    const cooldownPeriod = 60 * 1000
    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - lastCommentTime
      if (elapsed >= cooldownPeriod) return setCanComment(true)
      setRemainingTime(Math.ceil((cooldownPeriod - elapsed) / 1000))
      setCanComment(false)
    }
    updateTimer()
    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [lastCommentTime, editingCommentId])

  useEffect(() => {
    loadComments(true)
  }, [])

  useEffect(() => {
    if (!loadMoreRef.current || loading) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) loadMoreComments()
    }, { threshold: 0.5 })
    observer.observe(loadMoreRef.current)
    observerRef.current = observer
    return () => observer.disconnect()
  }, [loading, hasMore])

  const loadComments = async (isInitialLoad = false) => {
    if (loading || (!hasMore && !isInitialLoad)) return
    setLoading(true)
    try {
      let q
      if (isInitialLoad) {
        q = query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(COMMENTS_PER_PAGE))
      } else {
        if (!lastVisible) return
        q = query(
          collection(db, "comments"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(COMMENTS_PER_PAGE)
        )
      }

      const snapshot = await getDocs(q)
      if (snapshot.empty) return setHasMore(false)
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1]
      setLastVisible(lastVisibleDoc)
      const newComments = snapshot.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          content: d.content,
          date: d.createdAt?.toDate()?.toISOString() ?? "",
          userId: d.userId,
          lastEdited: d.lastEdited?.toDate()?.toISOString(),
        }
      })
      if (isInitialLoad) setComments(newComments)
      else setComments((prev) => [...prev, ...newComments])
      setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE)
    } catch (err) {
      console.error("Error loading comments:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreComments = () => {
    if (!loading && hasMore) loadComments()
  }

  const addComment = async () => {
    if (editingCommentId) {
      if (!editContent.trim()) return
      try {
        const ref = doc(db, "comments", editingCommentId)
        await updateDoc(ref, {
          content: editContent.trim(),
          lastEdited: serverTimestamp(),
        })
        setComments((prev) =>
          prev.map((c) =>
            c.id === editingCommentId
              ? { ...c, content: editContent.trim(), lastEdited: new Date().toISOString() }
              : c
          )
        )
        setEditingCommentId(null)
        setEditContent("")
      } catch (err) {
        console.error("Error updating comment:", err)
      }
      return
    }

    if (!newComment.trim() || !canComment) return
    try {
      await addDoc(collection(db, "comments"), {
        content: newComment.trim(),
        userId,
        createdAt: serverTimestamp(),
      })
      const now = Date.now()
      localStorage.setItem("lastCommentTime", now.toString())
      setLastCommentTime(now)
      setCanComment(false)
      setComments((prev) => [
        {
          id: "local_" + Math.random().toString(36).slice(2),
          content: newComment.trim(),
          userId,
          date: new Date().toISOString(),
        },
        ...prev,
      ])
      setNewComment("")
    } catch (err) {
      console.error("Error adding comment:", err)
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "comments", commentId))
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error("Error deleting comment:", err)
    }
  }

  const formatDate = (s: string) => new Date(s).toLocaleString(locale)
  const formatRemainingTime = (sec: number) => `${sec}${getTranslatedString("seconds") || "s"}`
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
    setNewComment("")
  }
  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditContent("")
  }

  return (
    <section className="w-full py-4 mt-12 border-t border-[rgba(255,255,255,0.1)]">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-semibold mb-4 neon-text">
          {getTranslatedString("comments.title") || "Comments"}
        </h2>

        {/* 댓글 입력 영역 */}
        <div className="flex flex-col mb-6">
          <div className="flex">
            {editingCommentId ? (
              <>
                <textarea
                  className="flex-grow p-3 bg-black/50 border border-amber-500/50 rounded-l-md text-white resize-none"
                  placeholder={getTranslatedString("comments.edit") || "Edit your comment..."}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      addComment()
                    } else if (e.key === "Escape") {
                      e.preventDefault()
                      cancelEditing()
                    }
                  }}
                  rows={2}
                />
                <div className="flex flex-col">
                  <button
                    className="flex-1 px-3 bg-amber-600/80 border border-amber-500 border-l-0 text-white"
                    onClick={addComment}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    className="flex-1 px-3 bg-black/70 border border-amber-500 border-l-0 border-t-0 rounded-tr-md text-white"
                    onClick={cancelEditing}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <textarea
                  className={`flex-grow p-3 bg-black/50 border border-[rgba(255,255,255,0.2)] rounded-l-md text-white resize-none focus:outline-none ${
                    canComment ? "focus:border-[rgba(255,255,255,0.5)]" : "opacity-70"
                  }`}
                  placeholder={
                    canComment
                      ? getTranslatedString("comments.placeholder") || "Add a comment..."
                      : getTranslatedString("comments.wait") || "Please wait before commenting again..."
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && canComment) {
                      e.preventDefault()
                      addComment()
                    }
                  }}
                  rows={2}
                  disabled={!canComment}
                />
                <button
                  className={`px-4 py-2 bg-black/70 border border-[rgba(255,255,255,0.3)] border-l-0 rounded-r-md text-white transition-colors ${
                    canComment
                      ? "hover:bg-black/90 hover:border-[rgba(255,255,255,0.5)]"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={addComment}
                  disabled={!canComment}
                >
                  {getTranslatedString("comments.submit") || "Submit"}
                </button>
              </>
            )}
          </div>
          {!canComment && !editingCommentId && (
            <div className="flex items-center mt-2 text-amber-400 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {getTranslatedString("comments.cooldown") || "You can comment again in"} {formatRemainingTime(remainingTime)}
              </span>
            </div>
          )}
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {getTranslatedString("comments.no_comments") || "No comments yet. Be the first to comment!"}
            </p>
          ) : (
            <>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 bg-black/30 border rounded-md ${
                    editingCommentId === comment.id ? "border-amber-500/50" : "border-[rgba(255,255,255,0.1)]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400 font-mono">
                      {getTranslatedString("comment.anonymous") || "Anonymous"} {comment.userId.slice(-4).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{formatDate(comment.date)}</span>
                      {userId === comment.userId && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditing(comment)}
                            className="text-gray-400 hover:text-amber-400"
                            disabled={editingCommentId !== null}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-white whitespace-pre-wrap break-words">{comment.content}</p>
                  {comment.lastEdited && (
                    <div className="mt-2 text-xs text-gray-500 italic">
                      {getTranslatedString("comments.edited") || "Edited"}: {formatDate(comment.lastEdited)}
                    </div>
                  )}
                </div>
              ))}
              {hasMore && (
                <div ref={loadMoreRef} className="text-center py-4">
                  {loading ? (
                    <div className="inline-block w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    <button
                      onClick={loadMoreComments}
                      className="flex items-center justify-center mx-auto text-gray-400 hover:text-white"
                    >
                      <span className="mr-1">{getTranslatedString("comments.load_more") || "Load more"}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}