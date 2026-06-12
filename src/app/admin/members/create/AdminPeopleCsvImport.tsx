'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { provisionPeopleMutation } from '@/lib/api-client/@tanstack/react-query.gen'

import { parsePeopleCsv } from '@/common/csv/utils'
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

  async function handleCsvUpload(file: File | undefined) {
    setCsvError(null)

    if (!file) {
      return
    }

    try {
      const rows = parsePeopleCsv(await file.text())

      await provisionMutation.mutateAsync({
        body: {
          people: rows.map((row) => ({
            name: row.name,
            email: row.email,
            role: 'user',
          })),
        },
      })

      await onPeopleChanged()
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
        <ProvisionResult result={provisionMutation.data} />
      </CardContent>
    </Card>
  )
}
