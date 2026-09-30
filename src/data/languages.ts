import type { Language, PhraseKind } from '../types'

const p = (text: string, romanization?: string) =>
  romanization ? { text, romanization } : { text }

export const LANGUAGES: Language[] = [
  {
    id: 'english',
    englishName: 'English',
    nativeName: 'English',
    aliases: ['english', 'inglés', 'ingles'],
    phrases: {
      greeting: p('Hey'),
      endearment: p('love'),
      praise: p('Look at you'),
      encouragement: p('Gently now'),
      enjoy: p('Enjoy'),
    },
  },
  {
    id: 'spanish',
    englishName: 'Spanish',
    nativeName: 'español',
    aliases: ['spanish', 'español', 'espanol', 'castellano', 'castilian'],
    phrases: {
      greeting: p('Hola'),
      endearment: p('mi vida'),
      praise: p('Qué bien'),
      encouragement: p('poco a poco'),
      enjoy: p('buen provecho'),
    },
  },
  {
    id: 'persian',
    englishName: 'Persian',
    nativeName: 'فارسی',
    nativeRomanization: 'Farsi',
    aliases: ['persian', 'farsi', 'parsi', 'fārsi', 'فارسی', 'dari', 'دری'],
    phrases: {
      greeting: p('سلام', 'salam'),
      endearment: p('عزیزم', 'azizam'),
      praise: p('آفرین', 'aferin'),
      encouragement: p('یواش یواش', 'yuvash yuvash'),
      enjoy: p('نوش جان', 'nooshe jan'),
    },
  },
  {
    id: 'arabic',
    englishName: 'Arabic',
    nativeName: 'العربية',
    nativeRomanization: 'al-arabiyya',
    aliases: ['arabic', 'العربية', 'عربي', 'arabi'],
    phrases: {
      greeting: p('مرحبا', 'marhaba'),
      endearment: p('يا عمري', 'ya omri'),
      praise: p('ما شاء الله', 'mashallah'),
      encouragement: p('شوي شوي', 'shway shway'),
      enjoy: p('صحتين', 'sahtein'),
    },
  },
  {
    id: 'hindi',
    englishName: 'Hindi',
    nativeName: 'हिन्दी',
    nativeRomanization: 'Hindī',
    aliases: ['hindi', 'हिन्दी', 'हिंदी'],
    phrases: {
      greeting: p('नमस्ते', 'namaste'),
      endearment: p('जान', 'jaan'),
      praise: p('शाबाश', 'shabash'),
      encouragement: p('धीरे-धीरे', 'dheere dheere'),
      enjoy: p('आराम से खाओ', 'aram se khao'),
    },
  },
  {
    id: 'mandarin',
    englishName: 'Mandarin',
    nativeName: '中文',
    nativeRomanization: 'Zhōngwén',
    aliases: ['mandarin', 'chinese', '中文', '普通话', 'putonghua', '汉语', 'mandarin chinese'],
    phrases: {
      greeting: p('你好', 'nǐ hǎo'),
      endearment: p('宝贝', 'bǎobèi'),
      praise: p('真棒', 'zhēn bàng'),
      encouragement: p('慢慢来', 'màn man lái'),
      enjoy: p('慢慢吃', 'màn man chī'),
    },
  },
  {
    id: 'korean',
    englishName: 'Korean',
    nativeName: '한국어',
    nativeRomanization: 'hangugeo',
    aliases: ['korean', '한국어', '한국말', 'hangul'],
    phrases: {
      greeting: p('안녕', 'annyeong'),
      endearment: p('아가', 'aga'),
      praise: p('잘했어', 'jalhaesseo'),
      encouragement: p('천천히', 'cheoncheonhi'),
      enjoy: p('맛있게 먹어', 'masitge meogeo'),
    },
  },
  {
    id: 'french',
    englishName: 'French',
    nativeName: 'français',
    aliases: ['french', 'français', 'francais'],
    phrases: {
      greeting: p('Coucou'),
      endearment: p('mon cœur'),
      praise: p('Bravo'),
      encouragement: p('doucement'),
      enjoy: p('bon appétit'),
    },
  },
  {
    id: 'portuguese',
    englishName: 'Portuguese',
    nativeName: 'português',
    aliases: ['portuguese', 'português', 'portugues', 'brazilian portuguese'],
    phrases: {
      greeting: p('Oi'),
      endearment: p('meu bem'),
      praise: p('Que bom'),
      encouragement: p('devagarinho'),
      enjoy: p('bom apetite'),
    },
  },
  {
    id: 'japanese',
    englishName: 'Japanese',
    nativeName: '日本語',
    nativeRomanization: 'nihongo',
    aliases: ['japanese', '日本語', 'nihongo'],
    phrases: {
      greeting: p('こんにちは', 'konnichiwa'),
      endearment: p('大好き', 'daisuki'),
      praise: p('えらい', 'erai'),
      encouragement: p('ゆっくり', 'yukkuri'),
      enjoy: p('召し上がれ', 'meshiagare'),
    },
  },
  {
    id: 'italian',
    englishName: 'Italian',
    nativeName: 'italiano',
    aliases: ['italian', 'italiano'],
    phrases: {
      greeting: p('Ciao'),
      endearment: p('tesoro'),
      praise: p('Bene così'),
      encouragement: p('piano piano'),
      enjoy: p('buon appetito'),
    },
  },
  {
    id: 'german',
    englishName: 'German',
    nativeName: 'Deutsch',
    aliases: ['german', 'deutsch'],
    phrases: {
      greeting: p('Hallo'),
      endearment: p('Schatz'),
      praise: p('Wunderbar'),
      encouragement: p('ganz ruhig'),
      enjoy: p('guten Appetit'),
    },
  },
  {
    id: 'turkish',
    englishName: 'Turkish',
    nativeName: 'Türkçe',
    aliases: ['turkish', 'türkçe', 'turkce'],
    phrases: {
      greeting: p('Merhaba'),
      endearment: p('canım'),
      praise: p('Aferin'),
      encouragement: p('yavaş yavaş'),
      enjoy: p('afiyet olsun'),
    },
  },
  {
    id: 'urdu',
    englishName: 'Urdu',
    nativeName: 'اردو',
    nativeRomanization: 'Urdu',
    aliases: ['urdu', 'اردو'],
    phrases: {
      greeting: p('سلام', 'salaam'),
      endearment: p('جان', 'jaan'),
      praise: p('شاباش', 'shabash'),
      encouragement: p('آہستہ آہستہ', 'ahista ahista'),
      enjoy: p('مزے سے کھاؤ', 'maze se khao'),
    },
  },
  {
    id: 'vietnamese',
    englishName: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    aliases: ['vietnamese', 'tiếng việt', 'tieng viet'],
    phrases: {
      greeting: p('Chào'),
      endearment: p('cưng'),
      praise: p('Giỏi lắm'),
      encouragement: p('từ từ'),
      enjoy: p('ăn ngon nhé'),
    },
  },
  {
    id: 'tagalog',
    englishName: 'Tagalog',
    nativeName: 'Tagalog',
    aliases: ['tagalog', 'filipino', 'pilipino'],
    phrases: {
      greeting: p('Kumusta'),
      endearment: p('mahal'),
      praise: p('Ang galing'),
      encouragement: p('dahan-dahan'),
      enjoy: p('kain na'),
    },
  },
  {
    id: 'russian',
    englishName: 'Russian',
    nativeName: 'русский',
    nativeRomanization: 'russkiy',
    aliases: ['russian', 'русский', 'russkiy'],
    phrases: {
      greeting: p('Привет', 'privet'),
      endearment: p('солнышко', 'solnyshko'),
      praise: p('Молодец', 'molodets'),
      encouragement: p('тихонько', 'tikhonko'),
      enjoy: p('приятного аппетита', 'priyatnogo appetita'),
    },
  },
  {
    id: 'hebrew',
    englishName: 'Hebrew',
    nativeName: 'עברית',
    nativeRomanization: 'ivrit',
    aliases: ['hebrew', 'עברית', 'ivrit'],
    phrases: {
      greeting: p('שלום', 'shalom'),
      endearment: p('נשמה', 'neshama'),
      praise: p('כל הכבוד', 'kol hakavod'),
      encouragement: p('לאט לאט', 'leat leat'),
      enjoy: p('בתיאבון', "bete'avon"),
    },
  },
  {
    id: 'greek',
    englishName: 'Greek',
    nativeName: 'ελληνικά',
    nativeRomanization: 'elliniká',
    aliases: ['greek', 'ελληνικά', 'ellinika'],
    phrases: {
      greeting: p('Γεια', 'ya'),
      endearment: p('αγάπη μου', 'agapi mou'),
      praise: p('Μπράβο', 'bravo'),
      encouragement: p('σιγά σιγά', 'siga siga'),
      enjoy: p('καλή όρεξη', 'kali orexi'),
    },
  },
  {
    id: 'swahili',
    englishName: 'Swahili',
    nativeName: 'Kiswahili',
    aliases: ['swahili', 'kiswahili'],
    phrases: {
      greeting: p('Habari'),
      endearment: p('kipenzi'),
      praise: p('Vizuri'),
      encouragement: p('polepole'),
      enjoy: p('karibu ule'),
    },
  },
]

export const LANGUAGE_CHIPS = ['english', 'spanish', 'persian', 'arabic', 'hindi', 'mandarin', 'korean', 'french']

const norm = (value: string) => value.trim().toLowerCase()

function keysOf(language: Language): string[] {
  return [language.englishName, language.nativeName, language.nativeRomanization ?? '', ...language.aliases]
    .map(norm)
    .filter(Boolean)
}

export function resolveLanguage(raw: string):
  | { status: 'empty' }
  | { status: 'match'; language: Language }
  | { status: 'partial' }
  | { status: 'unknown' } {
  const q = norm(raw)
  if (!q) return { status: 'empty' }

  const exact = LANGUAGES.find((language) => keysOf(language).includes(q))
  if (exact) return { status: 'match', language: exact }

  const prefixHits = LANGUAGES.filter((language) => keysOf(language).some((key) => key.startsWith(q)))
  if (q.length >= 3 && prefixHits.length === 1) return { status: 'match', language: prefixHits[0] }
  if (prefixHits.length > 0) return { status: 'partial' }
  return { status: 'unknown' }
}

export function suggestLanguages(raw: string): Language[] {
  const q = norm(raw)
  if (!q) return []
  const resolved = resolveLanguage(raw)
  return LANGUAGES.filter((language) => {
    if (resolved.status === 'match' && resolved.language.id === language.id && keysOf(language).includes(q)) {
      return false
    }
    return keysOf(language).some((key) => key.includes(q))
  }).slice(0, 5)
}

export function getLanguage(id: string | null): Language | null {
  if (!id || id === 'english') return null
  return LANGUAGES.find((language) => language.id === id) ?? null
}

export function chipLanguages(): Language[] {
  return LANGUAGE_CHIPS.map((id) => LANGUAGES.find((language) => language.id === id)).filter(
    (language): language is Language => Boolean(language),
  )
}

export function phraseKindForScore(score: number): PhraseKind {
  return score >= 75 ? 'praise' : 'encouragement'
}
