import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // 요청된 경로 가져오기
    const filePath = params.path.join("/")

    // 실제 파일 경로 구성
    const fullPath = path.join(process.cwd(), "public", "db", filePath)

    // 파일 존재 여부 확인
    if (!fs.existsSync(fullPath)) {
      return new NextResponse(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    // 파일 읽기
    const fileContent = fs.readFileSync(fullPath, "utf8")

    // JSON 파싱 시도
    try {
      const jsonData = JSON.parse(fileContent)
      return NextResponse.json(jsonData)
    } catch (e) {
      // JSON이 아닌 경우 텍스트로 반환
      return new NextResponse(fileContent, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }
  } catch (error) {
    console.error("Error reading file:", error)
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}

