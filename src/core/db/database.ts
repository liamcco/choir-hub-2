/* biome-ignore-all lint/suspicious/noExplicitAny: this compatibility seam translates the legacy query contract to Drizzle. */

import { and, asc, desc, eq, gt, gte, inArray, isNull, lt, lte, or } from 'drizzle-orm'
import { db } from '@/drizzle/db'
import {
  account,
  choir,
  choirMembership,
  group,
  groupMembership,
  passkey,
  position,
  positionAssignment,
  positionScope,
  section,
  sectionPlacement,
  session,
  twoFactor,
  user,
  verification,
} from '@/drizzle/schema'

const tables = {
  user,
  choir,
  section,
  choirMembership,
  sectionPlacement,
  group,
  groupMembership,
  position,
  positionScope,
  positionAssignment,
  session,
  account,
  verification,
  twoFactor,
  passkey,
}
type QueryArgs = { where?: any; select?: any; orderBy?: any; data?: any; include?: any; create?: any; update?: any }
type Row = any
type Model = {
  findMany(args?: QueryArgs): Promise<Row[]>
  findUnique(args: QueryArgs): Promise<Row | null>
  findFirst(args?: QueryArgs): Promise<Row | null>
  create(args: QueryArgs): Promise<Row>
  createMany(args: QueryArgs): Promise<{ count: number }>
  update(args: QueryArgs): Promise<Row>
  delete(args: QueryArgs): Promise<Row>
  deleteMany(args?: QueryArgs): Promise<{ count: number }>
  upsert(args: QueryArgs): Promise<Row>
}

function model(table: any, executor: any = db) {
  return {
    async findMany(args: QueryArgs = {}): Promise<any[]> {
      let query: any = args.select
        ? executor.select(selectColumns(table, args.select)).from(table)
        : executor.select().from(table)
      const condition = buildWhere(table, args.where)
      if (condition) query = query.where(condition)
      for (const ordering of args.orderBy ?? []) {
        for (const [key, direction] of Object.entries(ordering))
          query = query.orderBy(direction === 'desc' ? desc(table[key]) : asc(table[key]))
      }
      return (await query).map(normalizeRow)
    },
    async findUnique(args: QueryArgs): Promise<any> {
      const rows = await this.findMany({ ...args })
      return rows[0] ?? null
    },
    async findFirst(args: QueryArgs = {}): Promise<any> {
      const rows = await this.findMany(args)
      return rows[0] ?? null
    },
    async create(args: QueryArgs): Promise<any> {
      const rows = await executor.insert(table).values(normalizeData(args.data)).returning()
      return normalizeRow(rows[0])
    },
    async createMany(args: QueryArgs) {
      await executor.insert(table).values(args.data.map(normalizeData))
      return { count: args.data.length }
    },
    async update(args: QueryArgs): Promise<any> {
      const rows = await executor
        .update(table)
        .set({ ...normalizeData(args.data), ...(table.updatedAt ? { updatedAt: new Date() } : {}) })
        .where(buildWhere(table, args.where))
        .returning()
      return normalizeRow(rows[0])
    },
    async delete(args: QueryArgs) {
      const rows = await executor.delete(table).where(buildWhere(table, args.where)).returning()
      return normalizeRow(rows[0])
    },
    async deleteMany(args: QueryArgs = {}) {
      const rows = await executor.delete(table).where(buildWhere(table, args.where)).returning({ id: table.id })
      return { count: rows.length }
    },
    async upsert(args: QueryArgs) {
      const insert = executor.insert(table).values(normalizeData(args.create))
      const rows = Object.keys(args.update ?? {}).length
        ? await insert
            .onConflictDoUpdate({ target: conflictTarget(table, args.where), set: normalizeData(args.update) })
            .returning()
        : await insert.onConflictDoNothing({ target: conflictTarget(table, args.where) }).returning()
      return normalizeRow(rows[0])
    },
  }
}

function selectColumns(table: any, selection: Record<string, boolean>) {
  return Object.fromEntries(
    Object.entries(selection)
      .filter(([, value]) => value)
      .map(([key]) => [key, table[key]]),
  )
}

function buildWhere(table: any, where: any): any {
  if (!where) return undefined
  const clauses = Object.entries(where).flatMap(([key, value]: [string, any]) => {
    if (value === undefined) return []
    if (key === 'OR') return [or(...value.map((item: any) => buildWhere(table, item)))]
    if (key === 'AND') return [and(...value.map((item: any) => buildWhere(table, item)))]
    if (!(key in table)) return [buildWhere(table, value)]
    if (value === null) return [isNull(table[key])]
    if (typeof value === 'object' && !(value instanceof Date)) {
      return Object.entries(value).map(([operator, operand]) => {
        if (operator === 'equals') return operand === null ? isNull(table[key]) : eq(table[key], operand)
        if (operator === 'in') return inArray(table[key], operand as any[])
        if (operator === 'gt') return gt(table[key], operand)
        if (operator === 'gte') return gte(table[key], operand)
        if (operator === 'lt') return lt(table[key], operand)
        if (operator === 'lte') return lte(table[key], operand)
        return eq(table[key], operand)
      })
    }
    return [eq(table[key], value)]
  })
  return and(...clauses)
}

function conflictTarget(table: any, where: any) {
  const keys = Object.keys(where ?? {})
  if (keys.length === 1 && keys[0] in table) return table[keys[0]]
  const composite = keys[0]?.split('_')
  if (composite?.length && composite.every((key) => key in table)) return composite.map((key) => table[key])
  return [table.id]
}

function normalizeData(data: any) {
  if (!data) return data
  return {
    ...data,
    ...(data.kind ? { kind: String(data.kind).toLowerCase() } : {}),
    ...(data.status ? { status: String(data.status).toLowerCase() } : {}),
  }
}

function normalizeRow(row: any) {
  if (!row) return row
  return {
    ...row,
    ...(row.kind ? { kind: String(row.kind).toUpperCase() } : {}),
    ...(row.status ? { status: String(row.status).toUpperCase() } : {}),
  }
}

export const database: Record<keyof typeof tables, Model> & {
  $disconnect(): Promise<void>
  $transaction<T>(callback: (transaction: Record<keyof typeof tables, Model>) => Promise<T>): Promise<T>
} = {
  ...Object.fromEntries(Object.entries(tables).map(([name, table]) => [name, model(table)])),
  async $disconnect() {
    // postgres-js owns its pool and closes it when the process exits.
  },
  async $transaction<T>(callback: (transaction: typeof database) => Promise<T>) {
    return db.transaction((transaction) =>
      callback(
        Object.fromEntries(
          Object.entries(tables).map(([name, table]) => [name, model(table, transaction)]),
        ) as unknown as typeof database,
      ),
    )
  },
} as any
export type Database = typeof database
