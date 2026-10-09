import { Download } from 'lucide-react'
import { ContactButtonRow } from '../components/ContactButtonRow'
import type { LiveDoc } from '../content'
import { getLiveDocAsset, getLiveDocPath } from '../utils/liveDocs'
import { usePageMeta } from '../utils/pageMeta'

export function LiveDocPage({ liveDoc }: { liveDoc: LiveDoc }) {
  const assetUrl = getLiveDocAsset(liveDoc.content)
  const routePath = getLiveDocPath(liveDoc)
  const contentPathParts = liveDoc.content.split('/')
  const filename = contentPathParts[contentPathParts.length - 1] || `${liveDoc.vendor}.pdf`

  usePageMeta({
    title: `${liveDoc.vendor} · Jiazhou Chen`,
    description: `Conference document presented by Jiazhou Chen at ${liveDoc.vendor}.`,
    path: routePath,
    noIndex: true,
  })

  return (
    <div className="page live-doc-page">
      <h1 className="visually-hidden">{liveDoc.vendor} conference document</h1>

      <div className="live-doc-document">
        <section className="live-doc-viewer" aria-label={`${liveDoc.vendor} document viewer`}>
          <iframe
            className="live-doc-frame"
            src={`${assetUrl}#view=FitH`}
            title={`${liveDoc.vendor} PDF`}
          />
          <a
            className="live-doc-download"
            href={assetUrl}
            download={filename}
            aria-label={`Download ${liveDoc.vendor} PDF`}
            title={`Download ${liveDoc.vendor} PDF`}
          >
            <Download aria-hidden="true" />
          </a>
        </section>

        <section className="live-doc-contact" aria-label="Contact Jiazhou Chen">
          <ContactButtonRow />
        </section>
      </div>
    </div>
  )
}
