import { type ChoirId, type SectionId, topology } from '@/core/topology'
import type { FineVoice } from '@/core/types'
import { isEmail } from '@/shared/validation'

export const MAX_IMPORTED_USERS = 50
const REQUIRED_HEADERS = ['name', 'email'] as const

export type ImportedUser = {
  row: number
  name: string
  email: string
  placement: { choirId: ChoirId; sectionId: SectionId; voice: FineVoice; label: string } | null
}

export type ImportError = { row?: number; message: string }

export type CsvImportResult = {
  headers: string[]
  ignoredHeaders: string[]
  rows: ImportedUser[]
  errors: ImportError[]
}

export function parseUserImportCsv(input: string): CsvImportResult {
  const records = parseCsvRecords(input)
  if (records.length === 0)
    return { headers: [], ignoredHeaders: [], rows: [], errors: [{ message: 'The CSV is empty.' }] }

  const rawHeaders = records[0].map((value) => value.trim())
  const normalizedHeaders = rawHeaders.map((value) => value.toLowerCase())
  const errors: ImportError[] = []
  const positions = new Map<string, number>()

  normalizedHeaders.forEach((header, index) => {
    if (!header) errors.push({ message: `Column ${index + 1} has an empty header.` })
    if (positions.has(header)) errors.push({ message: `The header "${rawHeaders[index]}" appears more than once.` })
    else positions.set(header, index)
  })

  for (const header of REQUIRED_HEADERS) {
    if (!positions.has(header)) errors.push({ message: `Required column "${header}" is missing.` })
  }

  const ignoredHeaders = rawHeaders.filter(
    (_, index) =>
      !REQUIRED_HEADERS.includes(normalizedHeaders[index] as never) && normalizedHeaders[index] !== 'section',
  )
  const sectionIndex = positions.get('section')
  const rows: ImportedUser[] = []
  const emails = new Map<string, number>()

  records.slice(1).forEach((record, offset) => {
    const row = offset + 2
    if (record.every((value) => !value.trim())) return
    const name = valueAt(record, positions.get('name')).trim()
    const email = valueAt(record, positions.get('email')).trim().toLowerCase()
    const section = valueAt(record, sectionIndex).trim().toUpperCase()
    const rowErrors: string[] = []
    if (!name) rowErrors.push('Name is required.')
    if (!email || !isEmail(email)) rowErrors.push('A valid email address is required.')
    if (emails.has(email)) rowErrors.push(`Email is duplicated with row ${emails.get(email)}.`)
    else if (email) emails.set(email, row)

    const placement = section ? findPlacement(section) : null
    if (section && !placement) rowErrors.push(`Unknown section placement "${section}".`)
    if (rowErrors.length) errors.push(...rowErrors.map((message) => ({ row, message })))
    rows.push({ row, name, email, placement })
  })

  if (rows.length === 0 && errors.length === 0) errors.push({ message: 'The CSV contains no users.' })
  if (rows.length > MAX_IMPORTED_USERS)
    errors.push({ message: `The CSV contains ${rows.length} users. The maximum is ${MAX_IMPORTED_USERS}.` })
  return { headers: rawHeaders, ignoredHeaders, rows, errors }
}

function findPlacement(value: string) {
  for (const section of topology.sections) {
    const choir = topology.choirs.find((item) => item.id === section.choirId)
    for (const voice of section.allowedVoices) {
      const label = `${choir?.shortName ?? section.choirId}${voice}`.toUpperCase()
      if (label === value) return { choirId: section.choirId, sectionId: section.id, voice: voice as FineVoice, label }
    }
  }
  return null
}

function valueAt(record: string[], index: number | undefined) {
  return index === undefined ? '' : (record[index] ?? '')
}

function parseCsvRecords(input: string) {
  const records: string[][] = []
  let record: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"'
        index += 1
      } else quoted = !quoted
    } else if (character === ',' && !quoted) {
      record.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && input[index + 1] === '\n') index += 1
      record.push(field)
      records.push(record)
      record = []
      field = ''
    } else field += character
  }
  if (field || record.length) {
    record.push(field)
    records.push(record)
  }
  return records
}
