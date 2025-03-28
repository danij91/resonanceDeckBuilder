import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/ko') // 또는 /en
}