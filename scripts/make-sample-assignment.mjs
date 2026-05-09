import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, '../public/assignments')
const out = path.join(dir, 'sample-assignment.pdf')

fs.mkdirSync(dir, { recursive: true })

const doc = new PDFDocument({ margin: 50 })
const stream = fs.createWriteStream(out)
doc.pipe(stream)

doc.fontSize(20).fillColor('#1e293b').text('Oxford LMS — Sample assignment', { align: 'left' })
doc
  .moveDown()
  .fontSize(11)
  .fillColor('#475569')
  .text(
    'This PDF is provided for demonstration. Replace with your answers and upload your completed submission as instructed on the Assignment page.',
  )
doc.moveDown().fontSize(10).fillColor('#94a3b8').text(`Reference: SAMPLE • ${new Date().toISOString().slice(0, 16)}`)

doc.end()

stream.on('finish', () => {
  console.info('Created', path.relative(process.cwd(), out))
})
