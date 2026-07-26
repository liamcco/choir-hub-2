import { describe, expect, test } from 'bun:test'
import { parseUserImportCsv } from './csv'

describe('user import CSV parser', () => {
  test('matches columns by name, ignores extra columns, and parses placement', () => {
    const result = parseUserImportCsv('notes, EMAIL ,section,name\nnew singer,liam@example.com,KKB1,Liam Cotton')

    expect(result.errors).toEqual([])
    expect(result.ignoredHeaders).toEqual(['notes'])
    expect(result.rows[0]).toMatchObject({
      name: 'Liam Cotton',
      email: 'liam@example.com',
      placement: { choirId: 'kk', sectionId: 'kk-b', voice: 'B1', label: 'KKB1' },
    })
  })

  test('allows a blank optional section', () => {
    const result = parseUserImportCsv('name,email,section\nAda Lovelace,ada@example.com,')

    expect(result.errors).toEqual([])
    expect(result.rows[0].placement).toBeNull()
  })

  test('reports row errors and duplicate required headers', () => {
    const result = parseUserImportCsv('name,email,email,section\n,not-an-email,other@example.com,unknown')

    expect(result.errors).toEqual([
      { message: 'The header "email" appears more than once.' },
      { row: 2, message: 'Name is required.' },
      { row: 2, message: 'A valid email address is required.' },
      { row: 2, message: 'Unknown section placement "UNKNOWN".' },
    ])
  })
})
