# Keep Member Detail relationship creation inline

## Decision

On Member Detail, creating a `Group Membership` or `Position Assignment` opens one draft row inside the corresponding current-relationships list. The draft replaces the empty state when the list has no current records, uses the same bordered-row presentation as saved relationships, and offers `Cancel` and `Confirm` actions in the row. Only one draft may be open per relationship section; successful confirmation closes the draft and server-side validation errors keep it open.

The separate Group Detail and Position Detail workflows retain their existing presentation because they create relationships from the opposite side and have different available context.

## Rationale

The Member Detail user is managing relationships for one User, so a second stacked form separates the action from the list it changes and makes the page visually inconsistent. Keeping the draft in the list makes the pending relationship legible as part of the same collection while preserving the existing server actions, validation, and revalidation behavior.
