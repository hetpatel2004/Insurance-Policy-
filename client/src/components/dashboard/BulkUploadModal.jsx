import { useRef, useState } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import { CloudUploadFill, Download, ClipboardData } from 'react-bootstrap-icons'

const BulkUploadModal = ({ show, onHide, title, subtitle, columns, sample, onUpload }) => {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const header = columns.join(',')
  const sampleLine = sample
    .map(v => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v))
    .join(',')

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setText(String(reader.result || ''))
      e.target.value = ''
    }
    reader.readAsText(f)
  }

  const downloadTemplate = () => {
    const blob = new Blob([`${header}\n${sampleLine}\n`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const submit = async () => {
    if (!text.trim()) return
    setBusy(true)
    setResult(null)
    try {
      const res = await onUpload(text)
      setResult(res)
    } catch (err) {
      setResult({ created: 0, updated: 0, skipped: 0, errors: [{ row: 0, error: err.message }] })
    } finally {
      setBusy(false)
    }
  }

  const close = () => {
    setResult(null)
    setText('')
    onHide()
  }

  return (
    <Modal show={show} onHide={close} centered size="lg" contentClassName="glass-card" style={{ color: 'var(--text-primary)' }}>
      <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border)' }}>
        <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {subtitle && <p style={{ color: 'var(--text-muted-2)', fontSize: '0.85rem' }}>{subtitle}</p>}
        <div className="d-flex flex-wrap gap-2 mb-3">
          <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => fileRef.current?.click()} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
            <CloudUploadFill className="me-1" /> Upload CSV
          </Button>
          <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={downloadTemplate} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
            <Download className="me-1" /> Download Template
          </Button>
          <Button size="sm" variant="outline-primary" className="rounded-pill" onClick={() => setText(`${header}\n${sampleLine}\n`)} style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60a5fa' }}>
            <ClipboardData className="me-1" /> Fill Sample
          </Button>
          <input ref={fileRef} type="file" accept=".csv,.txt,text/csv" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <Form.Group>
          <Form.Label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            CSV content — paste or upload. First row must be the column headers.
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={8}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`${header}\n${sampleLine}`}
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem' }}
          />
        </Form.Group>
        {result && (
          <div className="mt-3">
            <Alert variant="info" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', color: 'var(--text-primary)', borderRadius: '12px', marginBottom: '8px' }}>
              Created: {result.created ?? 0} · {result.updated !== undefined ? `Updated: ${result.updated} · ` : ''}Skipped: {result.skipped ?? 0}
            </Alert>
            {result.errors?.length > 0 && (
              <div style={{ maxHeight: '180px', overflowY: 'auto', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
                {result.errors.map((err, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: '#f87171', padding: '6px 12px', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                    Row {err.row}: {err.error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer style={{ borderTop: '1px solid var(--border)' }}>
        <Button variant="outline-light" className="rounded-pill" onClick={close} style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-strong)' }}>Close</Button>
        <Button className="rounded-pill gradient-bg border-0" onClick={submit} disabled={busy || !text.trim()}>
          {busy ? 'Uploading…' : 'Upload'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default BulkUploadModal
