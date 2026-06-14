# Next.js Conventions

## Server vs Client Components

Default to **Server Components**. Move to Client Components when you need browser-only behavior such as:

- hooks like `useState` (or `useEffect`...)
- client-side query/mutation hooks (`useQuery`, `useMutation`)
- interactive form state

Examples in this repo:

- Server page: `src/app/page.tsx`
- Client panel with React Query: `src/app/admin/groups/AdminGroupsPanel.tsx`
- Client form with TanStack Form: `src/app/admin/groups/create/CreateGroupCard.tsx`


## Data loading

- Client side: use generated TanStack Query hooks/options from `src/lib/api-client`.

## Layout/providers

Global providers live in `src/app/providers.tsx` (theme + QueryClient).
