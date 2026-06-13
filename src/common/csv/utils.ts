import z from 'zod'

type ParsedUsersCsvUser = {
  email: string
  name: string
}

export type ParsedUsersCsvFailedRow = {
  email: string
  message: string
  name: string
  rowNumber: number
}

export type ParsedUsersCsv = {
  failed: ParsedUsersCsvFailedRow[]
  users: ParsedUsersCsvUser[]
}

type ParsedCsvRow = {
  cells: string[]
  rowNumber: number
}

const emailSchema = z.email()

export function parseUsersCsv(csv: string): ParsedUsersCsv {
  const rows = parseCsvRows(csv)

  if (rows.length === 0) {
    throw new Error('CSV must include a header row.')
  }

  const headers = rows[0].cells.map((header) => header.trim().toLowerCase())
  const nameIndex = headers.indexOf('name')
  const emailIndex = headers.indexOf('email')

  if (nameIndex === -1 || emailIndex === -1) {
    throw new Error('CSV must include name and email columns.')
  }

  const users: ParsedUsersCsvUser[] = []
  const failed: ParsedUsersCsvFailedRow[] = []

  for (const row of rows.slice(1)) {
    const name = row.cells[nameIndex]?.trim() ?? ''
    const email = row.cells[emailIndex]?.trim() ?? ''

    if (!name && !email && row.cells.every((cell) => !cell.trim())) {
      continue
    }

    if (!name) {
      failed.push({
        rowNumber: row.rowNumber,
        name,
        email,
        message: 'Name is required',
      })
      continue
    }

    if (!emailSchema.safeParse(email).success) {
      failed.push({
        rowNumber: row.rowNumber,
        name,
        email,
        message: 'Invalid email address',
      })
      continue
    }

    users.push({ name, email })
  }

  if (!users.length && !failed.length) {
    throw new Error('CSV did not contain any users.')
  }

  return { users, failed }
}

function parseCsvRows(csv: string): ParsedCsvRow[] {
  const rows: ParsedCsvRow[] = []
  let row: string[] = []
  let field = ''
  let isQuoted = false
  let rowNumber = 1
  let currentLineNumber = 1

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]
    const nextCharacter = csv[index + 1]

    if (character === '"' && isQuoted && nextCharacter === '"') {
      field += '"'
      index += 1
      continue
    }

    if (character === '"') {
      isQuoted = !isQuoted
      continue
    }

    if (character === ',' && !isQuoted) {
      row.push(field)
      field = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !isQuoted) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      row.push(field)
      rows.push({ rowNumber, cells: row })
      row = []
      field = ''
      currentLineNumber += 1
      rowNumber = currentLineNumber
      continue
    }

    if ((character === '\n' || character === '\r') && isQuoted) {
      if (character === '\r' && nextCharacter === '\n') {
        field += '\r\n'
        index += 1
      } else {
        field += character
      }

      currentLineNumber += 1
      continue
    }

    field += character
  }

  row.push(field)
  rows.push({ rowNumber, cells: row })

  return rows.filter((csvRow) => csvRow.cells.some((cell) => cell.trim()))
}
