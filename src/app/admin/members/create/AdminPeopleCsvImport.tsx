'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { provisionPeopleMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { parsePeopleCsv, type ParsedPeopleCsvFailedRow } from '@/common/csv/utils'
import { getErrorMessage } from '@/common/errors/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { ProvisionResult } from './ProvisionResult'

type AdminPeopleCsvImportProps = {
  onPeopleChanged: () => Promise<unknown>
}

export function AdminPeopleCsvImport({ onPeopleChanged }: AdminPeopleCsvImportProps) {
  const provisionMutation = useMutation(provisionPeopleMutation())
  const [csvError, setCsvError] = useState<string | null>(null)
  const [failedRows, setFailedRows] = useState<ParsedPeopleCsvFailedRow[]>([])

  async function handleCsvUpload(file: File | undefined) {
    setCsvError(null)
    setFailedRows([])
    provisionMutation.reset()

    if (!file) {
      return
    }

    try {
      const { people, failed } = parsePeopleCsv(await file.text())

      setFailedRows(failed)

      if (people.length > 0) {
        await provisionMutation.mutateAsync({
          body: {
            people: people.map((person) => ({
              name: person.name,
              email: person.email,
              role: 'user',
            })),
          },
        })

        await onPeopleChanged()
      }
    } catch (error) {
      setCsvError(getErrorMessage(error) ?? 'Could not import CSV.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import CSV</CardTitle>
        <CardDescription>Create ordinary users from name and email columns.</CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel htmlFor="people-csv">CSV file</FieldLabel>
          <Input
            id="people-csv"
            type="file"
            accept=".csv,text/csv"
            disabled={provisionMutation.isPending}
            onChange={(event) => {
              void handleCsvUpload(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <FieldDescription>Rows with existing emails are skipped.</FieldDescription>
          {csvError ? <FieldError>{csvError}</FieldError> : null}
        </Field>
        <CsvImportFailures failedRows={failedRows} />
        <ProvisionResult result={provisionMutation.data} />
      </CardContent>
    </Card>
  )
}

function CsvImportFailures({ failedRows }: { failedRows: ParsedPeopleCsvFailedRow[] }) {
  if (!failedRows.length) {
    return null
  }

  return (
    <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-medium text-destructive">The following rows could not be imported:</p>
      <ul className="mt-3 space-y-2 text-sm">
        {failedRows.map((failedRow) => (
          <li key={failedRow.rowNumber}>
            Row {failedRow.rowNumber}: {formatCsvFailure(failedRow)}
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatCsvFailure(failedRow: ParsedPeopleCsvFailedRow) {
  if (failedRow.message === 'Invalid email address' && failedRow.email) {
    return `${failedRow.message} (${failedRow.email})`
  }

  return failedRow.message
}
