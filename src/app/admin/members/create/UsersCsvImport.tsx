'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { createUsersMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { parseUsersCsv, type ParsedUsersCsvFailedRow } from '@/common/csv/utils'
import { getErrorMessage } from '@/common/errors/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { CreateResult } from './CreateUsersResult'

type UsersCsvImportProps = {
  onUsersChanged: () => Promise<unknown>
}

export function UsersCsvImport({ onUsersChanged }: UsersCsvImportProps) {
  const createMutation = useMutation(createUsersMutation())
  const [csvError, setCsvError] = useState<string | null>(null)
  const [failedRows, setFailedRows] = useState<ParsedUsersCsvFailedRow[]>([])

  async function handleCsvUpload(file: File | undefined) {
    setCsvError(null)
    setFailedRows([])
    createMutation.reset()

    if (!file) {
      return
    }

    try {
      const { users, failed } = parseUsersCsv(await file.text())

      setFailedRows(failed)

      if (users.length > 0) {
        await createMutation.mutateAsync({
          body: {
            users: users.map((user) => ({
              name: user.name,
              email: user.email,
              role: 'user',
            })),
          },
        })

        await onUsersChanged()
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
          <FieldLabel htmlFor="users-csv">CSV file</FieldLabel>
          <Input
            id="users-csv"
            type="file"
            accept=".csv,text/csv"
            disabled={createMutation.isPending}
            onChange={(event) => {
              void handleCsvUpload(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <FieldDescription>Rows with existing emails are skipped.</FieldDescription>
          {csvError ? <FieldError>{csvError}</FieldError> : null}
        </Field>
        <CsvImportFailures failedRows={failedRows} />
        <CreateResult result={createMutation.data} />
      </CardContent>
    </Card>
  )
}

function CsvImportFailures({ failedRows }: { failedRows: ParsedUsersCsvFailedRow[] }) {
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

function formatCsvFailure(failedRow: ParsedUsersCsvFailedRow) {
  if (failedRow.message === 'Invalid email address' && failedRow.email) {
    return `${failedRow.message} (${failedRow.email})`
  }

  return failedRow.message
}
