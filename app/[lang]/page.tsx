// app/[lang]/page.tsx

import DeckBuilder from '../../components/deckBuilder'

interface PageProps {
  params: {
    lang: string
  }
}

export default function Page({ params }: PageProps) {
  const lang = params.lang || 'ko'
  return <DeckBuilder lang={lang} />
}
