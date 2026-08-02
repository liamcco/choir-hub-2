'use client'

import { FileUpIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import type { validateUserImportAction } from './actions'
import { CreateImportedUsersForm, ValidateMemberImportForm } from './member-import-forms'

type ValidationState = Awaited<ReturnType<typeof validateUserImportAction>> | null
type ImportResultData = {
  count: number
  failedEmails: string[]
  failedRows: { row?: number; email: string; message: string; cleanup: 'not-needed' | 'completed' | 'failed' }[]
}

export function MemberImportDialog() {
  const [open, setOpen] = useState(false)
  const [csv, setCsv] = useState('')
  const [validation, setValidation] = useState<ValidationState>(null)
  const [result, setResult] = useState<ImportResultData | null>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setCsv('')
          setValidation(null)
          setResult(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button size="lg" variant="outline">
            <FileUpIcon data-icon="inline-start" />
            Import users
          </Button>
        }
      />
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import users</DialogTitle>
          <DialogDescription>Upload a CSV with name, email, and an optional section placement.</DialogDescription>
        </DialogHeader>
        {result ? (
          <ImportResult result={result} />
        ) : (
          <>
            <ValidateMemberImportForm
              onFileSelected={() => {
                setValidation(null)
                setResult(null)
              }}
              onValidated={(nextValidation, selectedCsv) => {
                setValidation(nextValidation)
                setCsv(selectedCsv)
              }}
            />
            {validation && <ValidationPreview validation={validation} csv={csv} onResult={setResult} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ValidationPreview({
  validation,
  csv,
  onResult,
}: {
  validation: NonNullable<ValidationState>
  csv: string
  onResult: (result: ImportResultData) => void
}) {
  const valid = validation.errors.length === 0
  return (
    <section className="space-y-4 rounded-lg border p-4" aria-live="polite">
      {!valid ? (
        <>
          <h2 className="font-semibold">Import errors</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
            {validation.errors.map((error, index) => (
              <li key={`${error.row ?? 'file'}-${index}`}>
                {error.row ? `Row ${error.row}: ` : ''}
                {error.message}
              </li>
            ))}
          </ul>
          <p className="font-medium">Update the .csv and try again!</p>
        </>
      ) : (
        <>
          <h2 className="font-semibold">Preview {validation.rows.length} users</h2>
          {validation.ignoredHeaders.length > 0 && (
            <p className="text-sm text-muted-foreground">Ignored columns: {validation.ignoredHeaders.join(', ')}</p>
          )}
          <div className="max-h-64 overflow-auto rounded border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Placement</th>
                </tr>
              </thead>
              <tbody>
                {validation.rows.map((row) => (
                  <tr className="border-b last:border-0" key={row.row}>
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.email}</td>
                    <td className="p-2">{row.placement?.label ?? 'No placement'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Users will be active and receive an activation email after creation.
          </p>
          <CreateImportedUsersForm
            csv={csv}
            onComplete={(createState) => {
              if (createState.success) {
                onResult({
                  count: createState.count,
                  failedEmails: createState.failedEmails,
                  failedRows: createState.failedRows,
                })
              }
            }}
          />
        </>
      )}
    </section>
  )
}

function ImportResult({ result }: { result: ImportResultData }) {
  return (
    <section className="space-y-3" aria-live="polite">
      <h2 className="text-lg font-semibold">Users created</h2>
      <p>{result.count} users were created.</p>
      {result.failedRows.length > 0 && (
        <div className="rounded-lg border border-destructive/50 p-3 text-sm">
          <p className="font-medium">{result.failedRows.length} users could not be onboarded.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.failedRows.map((failure) => (
              <li key={`${failure.row ?? failure.email}-${failure.email}`}>
                {failure.row ? `Row ${failure.row}: ` : ''}
                {failure.email}: {failure.message}
                {failure.cleanup === 'failed' && ' Cleanup is required.'}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.failedEmails.length > 0 && (
        <div className="rounded-lg border border-destructive/50 p-3 text-sm">
          <p className="font-medium">{result.failedEmails.length} users did not get their invitation email.</p>
          <p className="mt-1">Open each user’s detail view to resend the invitation.</p>
          <ul className="mt-2 list-disc pl-5">
            {result.failedEmails.map((email) => (
              <li key={email}>{email}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
