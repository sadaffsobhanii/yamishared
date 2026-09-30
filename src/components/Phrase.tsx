import type { Language, PhraseKind } from '../types'

export function Phrase({ language, kind }: { language: Language | null; kind: PhraseKind }) {
  if (!language) return null
  const phrase = language.phrases[kind]
  return (
    <span className="phrase">
      {phrase.text}
      {phrase.romanization ? <span className="roman"> ({phrase.romanization})</span> : null}
    </span>
  )
}

export function NativeName({ language }: { language: Language }) {
  return (
    <>
      {language.nativeName}
      {language.nativeRomanization ? <span className="roman"> ({language.nativeRomanization})</span> : null}
    </>
  )
}
