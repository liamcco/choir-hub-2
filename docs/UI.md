# UI (shadcn/ui)

## Component organization

- Keep base shadcn primitives in `src/components/ui/*`.
- Place feature-specific compositions close to the feature route.
- Only extract to shared components when reused.

## Styling

- Use Tailwind utility classes.
- Prefer existing patterns from nearby components before introducing new structure.

## Existing examples

- Cards/buttons/inputs in auth and resources pages:
  - `src/app/(auth)/login/page.tsx`
  - `src/app/resources/page.tsx`
  - `src/app/resources/create/page.tsx`
