# UI (shadcn/ui)

## Component organization

- Keep base shadcn primitives in `src/components/ui/*`.
- Place feature-specific compositions close to the feature route.
- Only extract to shared components when reused.

## Styling

- Use Tailwind utility classes.
- Page width and outer spacing should be owned by `PageShell` from `src/components/layout/page-shell.tsx`.
- Use `PageHeader` for route titles, descriptions, and page-level actions.
- Do not repeat `mx-auto`, page `max-w-*`, or page `px-*` inside feature components unless the element is intentionally narrower than the route shell.
- Current route widths: `narrow` for auth/simple forms, `content` for profile/detail pages, and `wide` for lists/dashboards.
