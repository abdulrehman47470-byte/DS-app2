import { Fragment, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState, TopBar } from '@/components/ui'
import { FileText } from 'lucide-react'

// Legal text lives in src/content/legal/*.md so it can be updated in one place.
const DOCS = import.meta.glob('/src/content/legal/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const TITLES: Record<string, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  ethics: 'Stogie Ethics',
  indemnification: 'Indemnification',
}

/** Inline: **bold** and [TODO ...]/[Insert ...] placeholders highlighted. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (/^\[(TODO|Insert)/.test(part)) return <span key={i} className="todo">{part}</span>
    return <Fragment key={i}>{part}</Fragment>
  })
}

/** Minimal, XSS-safe markdown: headings, paragraphs, bullet lists. No raw HTML. */
export function Markdown({ source }: { source: string }) {
  const blocks = source.trim().split(/\n{2,}/)
  return (
    <>
      {blocks.map((b, i) => {
        if (b.startsWith('# ')) return <h1 key={i}>{inline(b.slice(2))}</h1>
        if (b.startsWith('## ')) return <h2 key={i}>{inline(b.slice(3))}</h2>
        if (/^- /m.test(b))
          return (
            <ul key={i}>
              {b.split('\n').map((li, j) => <li key={j}>{inline(li.replace(/^- /, ''))}</li>)}
            </ul>
          )
        return <p key={i}>{inline(b)}</p>
      })}
    </>
  )
}

export default function Legal() {
  const { doc = '' } = useParams()
  const src = DOCS[`/src/content/legal/${doc}.md`]
  return (
    <div className="flex flex-1 flex-col">
      <TopBar back title={TITLES[doc] ?? 'Legal'} />
      {src ? (
        <div className="prose-legal px-5 pb-10 pt-2">
          <Markdown source={src} />
        </div>
      ) : (
        <EmptyState icon={FileText} title="Document not found" />
      )}
    </div>
  )
}
