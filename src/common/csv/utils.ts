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
    const result = parseUsersCsvRow(row, nameIndex, emailIndex)

    if (result.status === 'empty') {
      continue
    }

    if (result.status === 'failed') {
      failed.push(result.row)
      continue
    }

    users.push(result.user)
  }

  if (!users.length && !failed.length) {
    throw new Error('CSV did not contain any users.')
  }

  return { users, failed }
}

function parseUsersCsvRow(
  row: ParsedCsvRow,
  nameIndex: number,
  emailIndex: number,
):
  | { status: 'empty' }
  | { status: 'failed'; row: ParsedUsersCsvFailedRow }
  | { status: 'succeeded'; user: ParsedUsersCsvUser } {
  const name = row.cells[nameIndex]?.trim() ?? ''
  const email = row.cells[emailIndex]?.trim() ?? ''

  if (isBlankCsvRow(row)) {
    return { status: 'empty' }
  }

  if (!name) {
    return { status: 'failed', row: toFailedRow(row, name, email, 'Name is required') }
  }

  if (!emailSchema.safeParse(email).success) {
    return { status: 'failed', row: toFailedRow(row, name, email, 'Invalid email address') }
  }

  return { status: 'succeeded', user: { name, email } }
}

function isBlankCsvRow(row: ParsedCsvRow): boolean {
  return row.cells.every((cell) => !cell.trim())
}

function toFailedRow(
  row: ParsedCsvRow,
  name: string,
  email: string,
  message: string,
): ParsedUsersCsvFailedRow {
  return {
    rowNumber: row.rowNumber,
    name,
    email,
    message,
  }
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

    if (isEscapedQuote(character, nextCharacter, isQuoted)) {
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

    if (isLineBreak(character) && !isQuoted) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      rows.push(toParsedCsvRow(row, field, rowNumber))
      row = []
      field = ''
      currentLineNumber += 1
      rowNumber = currentLineNumber
      continue
    }

    if (isLineBreak(character) && isQuoted) {
      const lineBreak = readLineBreak(character, nextCharacter)
      field += lineBreak.value
      index += lineBreak.consumedExtraCharacter
      currentLineNumber += 1
      continue
    }

    field += character
  }

  rows.push(toParsedCsvRow(row, field, rowNumber))

  return rows.filter((csvRow) => csvRow.cells.some((cell) => cell.trim()))
}

function isEscapedQuote(character: string, nextCharacter: string | undefined, isQuoted: boolean): boolean {
  return character === '"' && isQuoted && nextCharacter === '"'
}

function isLineBreak(character: string): boolean {
  return character === '\n' || character === '\r'
}

function readLineBreak(character: string, nextCharacter: string | undefined) {
  if (character === '\r' && nextCharacter === '\n') {
    return { value: '\r\n', consumedExtraCharacter: 1 }
  }

  return { value: character, consumedExtraCharacter: 0 }
}

function toParsedCsvRow(row: string[], field: string, rowNumber: number): ParsedCsvRow {
  return { rowNumber, cells: [...row, field] }
}
