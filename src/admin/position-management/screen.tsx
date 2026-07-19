import { BriefcaseBusinessIcon, LayersIcon } from 'lucide-react'
import { CreatePositionForm, UpdatePositionForm } from '@/admin/position-management/position-form'
import type { PositionManagementPosition, PositionManagementState } from '@/admin/position-management/service'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function PositionManagementScreen({ state }: { state: PositionManagementState }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-normal">Positions</h1>
        <p className="text-muted-foreground text-sm">Display names and Group scopes</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <div className="grid gap-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Create Position</CardTitle>
              <CardDescription>Name, description, and one or more Group scopes</CardDescription>
            </CardHeader>
            <CardContent>
              <CreatePositionForm groups={state.groups} />
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Position Scopes</CardTitle>
              <CardDescription>Shared Positions show multiple scoped Groups on one record</CardDescription>
            </CardHeader>
            <CardContent>
              {state.positions.length ? (
                <PositionScopeTable positions={state.positions} />
              ) : (
                <EmptyState label="No Positions" />
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Edit Positions</CardTitle>
            <CardDescription>
              Duplicate names are separate records unless their scopes are on the same Position
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {state.positions.length ? (
              state.positions.map((positionView) => (
                <section key={positionView.position.id} className="rounded-lg border p-4">
                  <PositionHeading positionView={positionView} />
                  <UpdatePositionForm groups={state.groups} positionView={positionView} />
                </section>
              ))
            ) : (
              <EmptyState label="No Positions" />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function PositionScopeTable({ positions }: { positions: PositionManagementPosition[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Position</TableHead>
          <TableHead>Scopes</TableHead>
          <TableHead>Meaning</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((positionView) => (
          <TableRow key={positionView.position.id}>
            <TableCell>
              <div className="flex min-w-36 flex-col gap-1">
                <span className="font-medium">{positionView.position.name}</span>
                {positionView.position.description ? (
                  <span className="text-muted-foreground text-xs">{positionView.position.description}</span>
                ) : null}
              </div>
            </TableCell>
            <TableCell>{positionView.scopeLabel}</TableCell>
            <TableCell>
              <PositionMeaningBadge positionView={positionView} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function PositionHeading({ positionView }: { positionView: PositionManagementPosition }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <BriefcaseBusinessIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      <span className="font-medium">{positionView.position.name}</span>
      <PositionMeaningBadge positionView={positionView} />
      <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
        <LayersIcon className="size-4" aria-hidden="true" />
        {positionView.scopeLabel}
      </span>
    </div>
  )
}

function PositionMeaningBadge({ positionView }: { positionView: PositionManagementPosition }) {
  return (
    <>
      <ScopeKindBadge scopeKind={positionView.scopeKind} />
      {positionView.duplicateNameCount > 1 ? <Badge variant="outline">Duplicate display name</Badge> : null}
      {positionView.scopeKind !== 'shared' && positionView.duplicateNameCount > 1 ? (
        <Badge variant="outline">Separate same-name Position</Badge>
      ) : null}
    </>
  )
}

function ScopeKindBadge({ scopeKind }: { scopeKind: PositionManagementPosition['scopeKind'] }) {
  if (scopeKind === 'shared') {
    return <Badge variant="secondary">Shared Position</Badge>
  }
  if (scopeKind === 'unscoped') {
    return <Badge variant="destructive">Needs Group scope</Badge>
  }
  return <Badge variant="outline">Single-scope Position</Badge>
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
      {label}
    </div>
  )
}
