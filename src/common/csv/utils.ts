import z from 'zod'

export function parsePeopleCsv(csv: string): Array<{ name: string; email: string }> {
  const rows = parseCsvRows(csv)

  if (rows.length < 2) {
    throw new Error('CSV must include a header row and at least one person.')
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase())
  const nameIndex = headers.indexOf('name')
  const emailIndex = headers.indexOf('email')

  if (nameIndex === -1 || emailIndex === -1) {
    throw new Error('CSV must include name and email columns.')
  }

  const people = rows
    .slice(1)
    .map((row) => ({
      name: row[nameIndex]?.trim() ?? '',
      email: row[emailIndex]?.trim() ?? '',
    }))
    .filter((person) => person.name || person.email)

  const invalidPerson = people.find((person) => !person.name || !z.email().safeParse(person.email).success)

  if (invalidPerson) {
    throw new Error(`Invalid CSV row for ${invalidPerson.email || invalidPerson.name || 'unknown person'}.`)
  }

  if (!people.length) {
    throw new Error('CSV did not contain any people.')
  }

  return people
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let isQuoted = false

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
      rows.push(row)
      row = []
      field = ''
      continue
    }

    field += character
  }

  row.push(field)
  rows.push(row)

  return rows.filter((csvRow) => csvRow.some((cell) => cell.trim()))
}
