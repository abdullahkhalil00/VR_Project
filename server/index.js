import cors from 'cors'
import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'assignments')

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename(_req, file, cb) {
    const base = path.basename(file.originalname || 'submission.pdf').replace(/[^\w.-]+/g, '_')
    cb(null, `${Date.now()}-${base}`)
  },
})

/** @type {multer.Options['fileFilter']} */
function pdfOnly(_req, file, cb) {
  const name = (file.originalname || '').toLowerCase()
  const isPdfExt = name.endsWith('.pdf')
  const isPdfMime = file.mimetype === 'application/pdf'
  /** Some browsers send empty or generic MIME for local PDFs — still require .pdf extension */
  if (isPdfExt && (isPdfMime || !file.mimetype || file.mimetype === 'application/octet-stream')) return cb(null, true)
  const err = new Error('Only PDF files are accepted.')
  err.code = 'INVALID_FILE_TYPE'
  cb(err)
}

const upload = multer({
  storage,
  fileFilter: pdfOnly,
  limits: { fileSize: 12 * 1024 * 1024 },
})

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

/**
 * Saves PDF uploads from the LMS Assignment page onto this machine under server/uploads/assignments
 */
app.post('/api/assignments/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: 'Missing file or unsupported type — please choose a PDF.',
    })
  }
  const { assignmentId = '', unit = '', subject = '' } = req.body
  const absolutePath = path.resolve(req.file.path)
  console.info('[assignment upload]', assignmentId || subject || unit || 'unknown', absolutePath)

  res.json({
    ok: true,
    fileName: req.file.filename,
    savedToFolder: UPLOAD_DIR,
    absolutePath,
    assignmentId,
    unit,
    subject,
    sizeBytes: req.file.size,
  })
})

app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ ok: false, message: 'File is too large (max ~12 MB).' })
  }
  if (err.message === 'Only PDF files are accepted.') {
    return res.status(400).json({ ok: false, message: err.message })
  }
  console.error(err)
  res.status(500).json({ ok: false, message: 'Upload failed.' })
})

const PORT = Number(process.env.ASSIGNMENT_API_PORT || 8787)

app.listen(PORT, () => {
  console.info(`Assignment upload API listening on http://localhost:${PORT}`)
  console.info(`PDFs are stored in: ${UPLOAD_DIR}`)
})
