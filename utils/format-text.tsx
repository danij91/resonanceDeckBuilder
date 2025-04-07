import React from "react"

/**
 * 텍스트 내의 색상 태그와 HTML 태그를 React 요소로 변환합니다.
 * @param text 변환할 텍스트
 * @returns React 요소 배열
 */
export function formatColorText(text: string): React.ReactNode {
  if (!text) return ""

  // 줄바꿈 처리
  const textWithNewlines = text.replace(/\\n/g, "\n")

  // HTML 파싱을 위한 임시 DOM 요소 생성
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = textWithNewlines
    .replace(/<color=#([A-Fa-f0-9]{6})>/g, '<span style="color: #$1">')
    .replace(/<\/color>/g, "</span>")

  // DOM 구조를 React 요소로 변환
  const convertNodeToReact = (node: Node, index: number): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const childElements = Array.from(element.childNodes).map((child, i) => convertNodeToReact(child, i))

      if (element.tagName === "SPAN") {
        return (
          <span key={index} style={{ color: element.style.color }}>
            {childElements}
          </span>
        )
      }

      if (element.tagName === "I") {
        return <i key={index}>{childElements}</i>
      }

      if (element.tagName === "B") {
        return <b key={index}>{childElements}</b>
      }

      return <React.Fragment key={index}>{childElements}</React.Fragment>
    }

    return null
  }

  return Array.from(tempDiv.childNodes).map((node, i) => convertNodeToReact(node, i))
}

