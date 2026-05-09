import { useRef, useState } from 'react'

const SAMPLE_PDF = '/assignments/sample-assignment.pdf'

const ASSIGNMENT_ROWS = [
  {
    id: 'asg-crp-03',
    unit: '03',
    subject: 'CRP',
    issuedDate: '03/02/2023',
    deadline: '03/05/2023',
    status: 'Submitted',
  },
  {
    id: 'asg-prg-01',
    unit: '01',
    subject: 'Programming',
    issuedDate: '03/09/2023',
    deadline: '03/09/2025',
    status: 'Pending',
  },
  {
    id: 'asg-dbs-01',
    unit: '01',
    subject: 'Database',
    issuedDate: '03/02/2024',
    deadline: '03/10/2026',
    status: 'Pending',
  },
]

function sanitizeFileName(subject, unit) {
  const slug = `${subject}-Unit${unit}-brief`.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
  return `${slug || `assignment-unit-${unit}`}.pdf`
}

export default function AssignmentTable() {
  /** @type {React.MutableRefObject<Record<string, HTMLInputElement | null>>} */
  const fileInputs = useRef({})
  const [blurbs, setBlurbs] = useState(() => /** @type {Record<string, string>} */ ({}))

  function setBlurb(id, text) {
    setBlurbs((prev) => ({ ...prev, [id]: text }))
  }

  async function handleFileChosen(row, fileList) {
    const file = fileList?.[0]
    if (!file) return
    const name = file.name.toLowerCase()
    const looksPdf =
      name.endsWith('.pdf') && (!file.type || file.type === 'application/pdf' || file.type === '')
    if (!looksPdf) {
      setBlurb(row.id, 'Please upload a PDF file only.')
      return
    }

    const form = new FormData()
    form.append('file', file)
    form.append('assignmentId', row.id)
    form.append('unit', row.unit)
    form.append('subject', row.subject)

    try {
      const res = await fetch('/api/assignments/upload', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setBlurb(row.id, data.message || `Upload failed (${res.status}).`)
        return
      }
      setBlurb(row.id, `Saved on server: ${data.fileName}`)
    } catch {
      setBlurb(
        row.id,
        'Could not reach the upload API. Use “npm run dev” so the Express server starts on port 8787.',
      )
    }
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Unit</th>
          <th>Subject</th>
          <th>Issues Date</th>
          <th>Deadline</th>
          <th>Status</th>
          <th>Download</th>
          <th>Upload</th>
        </tr>
      </thead>
      <tbody>
        {ASSIGNMENT_ROWS.map((row) => (
          <tr key={row.id}>
            <td>{row.unit}</td>
            <td>{row.subject}</td>
            <td>{row.issuedDate}</td>
            <td>{row.deadline}</td>
            <td>{row.status}</td>
            <td>
              <a
                href={SAMPLE_PDF}
                download={sanitizeFileName(row.subject, row.unit)}
                className="assignment-btn assignment-btn--download"
              >
                Download
              </a>
            </td>
            <td>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="assignment-file-input"
                ref={(el) => {
                  fileInputs.current[row.id] = el
                }}
                aria-label={`Upload PDF for ${row.subject} Unit ${row.unit}`}
                onChange={(ev) => {
                  handleFileChosen(row, ev.target.files)
                  ev.target.value = ''
                }}
              />
              <button
                type="button"
                className="assignment-btn assignment-btn--upload"
                onClick={() => fileInputs.current[row.id]?.click()}
              >
                Upload PDF
              </button>
              {blurbs[row.id] ? (
                <p
                  className={`assignment-feedback ${blurbs[row.id].startsWith('Saved on server') ? 'is-ok' : 'is-error'}`}
                >
                  {blurbs[row.id]}
                </p>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
