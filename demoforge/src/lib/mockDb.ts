// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
// localStorage-based mock database — works without Supabase

function genId(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ── Storage helpers ──
function getStore<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function setStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

// ── Auth ──
export interface MockUser { id: string; email: string; password: string }

function getUsers(): MockUser[] { return getStore('df_users') }
function setUsers(u: MockUser[]) { setStore('df_users', u) }

function getCurrentUser(): MockUser | null {
  const id = localStorage.getItem('df_current_user')
  if (!id) return null
  return getUsers().find(u => u.id === id) || null
}

export const mockAuth = {
  getSession: async () => {
    const user = getCurrentUser()
    return { data: { session: user ? { user } : null }, error: null }
  },
  getUser: async () => {
    const user = getCurrentUser()
    return { data: { user }, error: null }
  },
  signUp: async ({ email, password }: { email: string; password: string }) => {
    const users = getUsers()
    if (users.find(u => u.email === email)) {
      return { data: { user: null }, error: { message: 'User already exists' } }
    }
    const user: MockUser = { id: genId(), email, password }
    users.push(user)
    setUsers(users)
    localStorage.setItem('df_current_user', user.id)
    return { data: { user }, error: null }
  },
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    const user = getUsers().find(u => u.email === email && u.password === password)
    if (!user) return { data: { user: null }, error: { message: 'Invalid email or password' } }
    localStorage.setItem('df_current_user', user.id)
    return { data: { user }, error: null }
  },
  signOut: async () => {
    localStorage.removeItem('df_current_user')
    return { error: null }
  },
}

// ── Database (demos + demo_steps) ──
export interface MockDemo {
  id: string; user_id: string; title: string; company_name: string;
  company_logo: string | null; status: string; created_at: string; updated_at: string;
  theme_color?: string;
}
export interface MockStep {
  id: string; demo_id: string; step_order: number; title: string; subtitle: string;
  device_type: string; screen_content: string; screen_bg: string; status_bar_text: string;
  browser_url: string; tab_title: string; api_method: string; api_endpoint: string;
  api_request: string; api_response: string; api_status_code: number; api_response_ms: number;
  created_at: string;
}

function getDemos(): MockDemo[] { return getStore('df_demos') }
function setDemos(d: MockDemo[]) { setStore('df_demos', d) }
function getSteps(): MockStep[] { return getStore('df_steps') }
function setSteps(s: MockStep[]) { setStore('df_steps', s) }

// Fluent query builder that mimics Supabase's API
type FilterFn<T> = (item: T) => boolean

class QueryBuilder<T extends Record<string, any>> {
  private items: T[]
  private setFn: (items: T[]) => void
  private filters: FilterFn<T>[] = []
  private orderKey?: string
  private orderAsc = true
  private insertData?: any
  private updateData?: Partial<T>
  private isDelete = false
  private isUpsert = false
  private isSingle = false

  constructor(items: T[], setFn: (items: T[]) => void) {
    this.items = [...items]
    this.setFn = setFn
  }

  eq(key: string, value: any) {
    this.filters.push(item => (item as any)[key] === value)
    return this
  }

  order(key: string, opts?: { ascending?: boolean }) {
    this.orderKey = key
    this.orderAsc = opts?.ascending ?? true
    return this
  }

  select(_cols?: string) {
    return this
  }

  single() {
    this.isSingle = true
    return this.execute()
  }

  async execute(): Promise<{ data: any; error: any }> {
    // INSERT
    if (this.insertData !== undefined) {
      const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData]
      const newRows = rows.map((r: any) => ({
        id: genId(),
        created_at: new Date().toISOString(),
        ...r,
      }))
      this.items.push(...newRows)
      this.setFn(this.items)
      if (this.isSingle) return { data: newRows[0], error: null }
      return { data: newRows, error: null }
    }

    // UPDATE
    if (this.updateData) {
      this.items = this.items.map(item => {
        if (this.filters.every(f => f(item))) {
          return { ...item, ...this.updateData, updated_at: new Date().toISOString() }
        }
        return item
      })
      this.setFn(this.items)
      return { data: null, error: null }
    }

    // DELETE
    if (this.isDelete) {
      this.items = this.items.filter(item => !this.filters.every(f => f(item)))
      this.setFn(this.items)
      return { data: null, error: null }
    }

    // UPSERT
    if (this.isUpsert) {
      const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData]
      for (const row of rows) {
        const idx = this.items.findIndex(i => i.id === row.id)
        if (idx >= 0) {
          this.items[idx] = { ...this.items[idx], ...row, updated_at: new Date().toISOString() }
        } else {
          this.items.push({ id: genId(), created_at: new Date().toISOString(), ...row } as T)
        }
      }
      this.setFn(this.items)
      return { data: rows, error: null }
    }

    // SELECT
    let result = this.items.filter(item => this.filters.every(f => f(item)))
    if (this.orderKey) {
      const k = this.orderKey
      result.sort((a, b) => {
        const va = (a as any)[k], vb = (b as any)[k]
        if (va < vb) return this.orderAsc ? -1 : 1
        if (va > vb) return this.orderAsc ? 1 : -1
        return 0
      })
    }
    if (this.isSingle) return { data: result[0] || null, error: result[0] ? null : { message: 'Not found' } }
    return { data: result, error: null }
  }

  // make it thenable so `await` works without calling execute()
  then(resolve: (v: any) => any, reject?: (e: any) => any) {
    return this.execute().then(resolve, reject)
  }
}

class InsertBuilder<T extends Record<string, any>> {
  private items: T[]
  private setFn: (items: T[]) => void
  private data: any
  private isSingle = false

  constructor(items: T[], setFn: (items: T[]) => void, data: any) {
    this.items = [...items]
    this.setFn = setFn
    this.data = data
  }

  select(_cols?: string) { return this }

  single() {
    this.isSingle = true
    return this.execute()
  }

  async execute() {
    const rows = Array.isArray(this.data) ? this.data : [this.data]
    const newRows = rows.map((r: any) => ({
      id: genId(),
      created_at: new Date().toISOString(),
      ...r,
    }))
    this.items.push(...(newRows as T[]))
    this.setFn(this.items)
    if (this.isSingle) return { data: newRows[0], error: null }
    return { data: newRows, error: null }
  }

  then(resolve: (v: any) => any, reject?: (e: any) => any) {
    return this.execute().then(resolve, reject)
  }
}

class UpsertBuilder<T extends Record<string, any>> {
  private items: T[]
  private setFn: (items: T[]) => void
  private data: any

  constructor(items: T[], setFn: (items: T[]) => void, data: any) {
    this.items = [...items]
    this.setFn = setFn
    this.data = data
  }

  async execute() {
    const rows = Array.isArray(this.data) ? this.data : [this.data]
    for (const row of rows) {
      const idx = this.items.findIndex(i => (i as any).id === row.id)
      if (idx >= 0) {
        this.items[idx] = { ...this.items[idx], ...row, updated_at: new Date().toISOString() }
      } else {
        this.items.push({ id: genId(), created_at: new Date().toISOString(), ...row } as T)
      }
    }
    this.setFn(this.items)
    return { data: rows, error: null }
  }

  then(resolve: (v: any) => any, reject?: (e: any) => any) {
    return this.execute().then(resolve, reject)
  }
}

class TableRef<T extends Record<string, any>> {
  private getItems: () => T[]
  private setItems: (items: T[]) => void

  constructor(getItems: () => T[], setItems: (items: T[]) => void) {
    this.getItems = getItems
    this.setItems = setItems
  }

  select(cols?: string) {
    const qb = new QueryBuilder<T>(this.getItems(), this.setItems)
    qb.select(cols)
    return qb
  }

  insert(data: any) {
    return new InsertBuilder<T>(this.getItems(), this.setItems, data)
  }

  update(data: Partial<T>) {
    const qb = new QueryBuilder<T>(this.getItems(), this.setItems)
    ;(qb as any).updateData = data
    return qb
  }

  upsert(data: any) {
    return new UpsertBuilder<T>(this.getItems(), this.setItems, data)
  }

  delete() {
    const qb = new QueryBuilder<T>(this.getItems(), this.setItems)
    ;(qb as any).isDelete = true
    return qb
  }
}

export const mockDb = {
  from: (table: string) => {
    switch (table) {
      case 'demos':
        return new TableRef<MockDemo>(getDemos, setDemos)
      case 'demo_steps':
        return new TableRef<MockStep>(getSteps, setSteps)
      default:
        throw new Error(`Unknown table: ${table}`)
    }
  },
  auth: mockAuth,
}
