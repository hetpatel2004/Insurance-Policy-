export const parseCSVRows = (text, columns) => {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else { inQuotes = false }
      } else { field += c }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field.trim()); field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field.trim()); field = ''
      if (row.some(x => x !== '')) rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field !== '' || row.length) {
    row.push(field.trim())
    if (row.some(x => x !== '')) rows.push(row)
  }
  if (rows.length === 0) return []

  const header = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const colIndex = {}
  columns.forEach((col, i) => {
    const key = col.toLowerCase().replace(/[^a-z0-9]/g, '')
    colIndex[col] = header.indexOf(key) >= 0 ? header.indexOf(key) : i
  })

  return rows.slice(1).map(r => {
    const obj = {}
    columns.forEach(col => { obj[col] = (r[colIndex[col]] || '').trim() })
    return obj
  })
}
