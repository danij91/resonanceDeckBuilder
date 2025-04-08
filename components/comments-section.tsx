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
  onSnapshot,
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
    tw: "zh-TW", // 대만어 추가
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

  // 페이지네이션 관련 상태
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [totalComments, setTotalComments] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const COMMENTS_PER_PAGE = 5

  const locale = mapToLocale(currentLanguage)

  // 유저 UUID 생성 또는 불러오기 및 마지막 댓글 시간 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return

    // 유저 ID 불러오기
    const existing = localStorage.getItem("anonymousUserId")
    if (existing) {
      setUserId(existing)
    } else {
      const newId = uuidv4()
      localStorage.setItem("anonymousUserId", newId)
      setUserId(newId)
    }

    // 마지막 댓글 시간 불러오기
    const lastTime = localStorage.getItem("lastCommentTime")
    if (lastTime) {
      setLastCommentTime(Number.parseInt(lastTime, 10))
    }
  }, [])

  // 남은 시간 계산 및 업데이트
  useEffect(() => {
    if (editingCommentId) {
      setCanComment(true)
      return
    }

    if (!lastCommentTime) {
      setCanComment(true)
      setRemainingTime(0)
      return
    }

    const cooldownPeriod = 60 * 1000 // 1분 (밀리초)
    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - lastCommentTime

      if (elapsed >= cooldownPeriod) {
        setCanComment(true)
        setRemainingTime(0)
        return
      }

      const remaining = Math.ceil((cooldownPeriod - elapsed) / 1000)
      setRemainingTime(remaining)
      setCanComment(false)
    }

    updateTimer()
    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [lastCommentTime, editingCommentId])

  // 총 댓글 수 가져오기
  useEffect(() => {
    const q = query(collection(db, "comments"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTotalComments(snapshot.size)
    })

    return () => unsubscribe()
  }, [])

  // 초기 댓글 로드
  useEffect(() => {
    loadComments(true)
  }, [])

  // 무한 스크롤 구현
  useEffect(() => {
    if (!loadMoreRef.current || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreComments()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(loadMoreRef.current)
    observerRef.current = observer

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current)
      }
    }
  }, [loading, hasMore, lastVisible])

  // 댓글 로드 함수
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
          limit(COMMENTS_PER_PAGE),
        )
      }

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setHasMore(false)
        setLoading(false)
        return
      }

      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1]
      setLastVisible(lastVisibleDoc)

      const newComments = snapshot.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          content: d.content,
          date: d.createdAt?.toDate().toISOString() ?? "",
          userId: d.userId,
          lastEdited: d.lastEdited ? d.lastEdited.toDate().toISOString() : undefined,
        } as Comment
      })

      if (isInitialLoad) {
        setComments(newComments)
      } else {
        setComments((prev) => [...prev, ...newComments])
      }

      setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setLoading(false)
    }
  }

  // 추가 댓글 로드
  const loadMoreComments = () => {
    if (!loading && hasMore) {
      loadComments()
    }
  }

  // 댓글 추가
  const addComment = async () => {
    // 수정 모드일 경우: editContent 확인
    if (editingCommentId) {
      if (editContent.trim() === "") return

      try {
        const commentRef = doc(db, "comments", editingCommentId)
        await updateDoc(commentRef, {
          content: editContent.trim(),
          lastEdited: serverTimestamp(),
        })

        setEditingCommentId(null)
        setEditContent("")
        setNewComment("")
        loadComments(true) // 수정 후 리스트 새로고침
      } catch (error) {
        console.error("Error updating comment:", error)
      }

      return
    }

    // 새 댓글 작성일 경우: newComment 확인
    if (newComment.trim() === "" || !canComment) return

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
      setNewComment("")
      loadComments(true)
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  // 댓글 삭제
  const deleteComment = async (commentId: string) => {
    try {
      // 수정 중인 댓글을 삭제하는 경우 수정 모드 종료
      if (editingCommentId === commentId) {
        setEditingCommentId(null)
        setEditContent("")
        setNewComment("")
      }

      await deleteDoc(doc(db, "comments", commentId))

      // 댓글 목록에서 삭제된 댓글 제거
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  // 댓글 수정 시작
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
    setNewComment("")
  }

  // 댓글 수정 취소
  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditContent("")
  }

  // formatDate 함수 수정 - 언어 매개변수 사용
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(locale)
  }

  // 남은 시간 포맷팅
  const formatRemainingTime = (seconds: number) => {
    return `${seconds}${getTranslatedString("seconds") || "s"}`
  }

  return (
    <section className="w-full py-4 mt-12 border-t border-[rgba(255,255,255,0.1)]">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-semibold mb-4 neon-text">
          {getTranslatedString("comments.title") || "Comments"}
          {totalComments > 0 && <span className="ml-2 text-sm">({totalComments})</span>}
        </h2>

        {/* 댓글 입력 폼 */}
        <div className="flex flex-col mb-6">
          <div className="flex">
            {editingCommentId ? (
              // 수정 모드 UI
              <>
                <textarea
                  className="flex-grow p-3 bg-black/50 border border-amber-500/50 rounded-l-md text-white resize-none focus:outline-none focus:border-amber-500"
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
                    className="flex-1 px-3 bg-amber-600/80 border border-amber-500 border-l-0 text-white hover:bg-amber-600 transition-colors"
                    onClick={addComment}
                    title={getTranslatedString("comments.save") || "Save"}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    className="flex-1 px-3 bg-black/70 border border-amber-500 border-l-0 border-t-0 rounded-tr-md text-white hover:bg-black/90 transition-colors"
                    onClick={cancelEditing}
                    title={getTranslatedString("comments.cancel") || "Cancel"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              // 새 댓글 작성 UI
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

          {/* 수정 중 안내 메시지 또는 남은 시간 표시 */}
          {editingCommentId ? (
            <div className="flex items-center mt-2 text-amber-400 text-sm">
              <Edit2 className="w-4 h-4 mr-1" />
              <span>{getTranslatedString("comments.editing") || "Editing comment..."}</span>
            </div>
          ) : (
            !canComment && (
              <div className="flex items-center mt-2 text-amber-400 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>
                  {getTranslatedString("comments.cooldown") || "You can comment again in"}{" "}
                  {formatRemainingTime(remainingTime)}
                </span>
              </div>
            )
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
                      {/* 본인 댓글인 경우에만 수정/삭제 버튼 표시 */}
                      {userId === comment.userId && (
                        <div className="flex gap-1">
                          {/* 수정 버튼 */}
                          <button
                            onClick={() => startEditing(comment)}
                            className="text-gray-400 hover:text-amber-400 transition-colors"
                            aria-label="Edit comment"
                            disabled={editingCommentId !== null}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* 삭제 버튼 */}
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-white whitespace-pre-wrap break-words">{comment.content}</p>

                  {/* 수정됨 표시 */}
                  {comment.lastEdited && (
                    <div className="mt-2 text-xs text-gray-500 italic">
                      {getTranslatedString("comments.edited") || "Edited"}: {formatDate(comment.lastEdited)}
                    </div>
                  )}
                </div>
              ))}

              {/* 더 불러오기 버튼 */}
              {hasMore && (
                <div ref={loadMoreRef} className="text-center py-4">
                  {loading ? (
                    <div className="inline-block w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    <button
                      onClick={loadMoreComments}
                      className="flex items-center justify-center mx-auto text-gray-400 hover:text-white transition-colors"
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
