# Use flat organization or Choir Group Scopes

CSK Choir Hub will not model Groups as an arbitrary parent/child hierarchy. Every Group is either CSK-wide or scoped to exactly one Choir; Sections are modeled separately and do not participate in Group Scope.

This flat scope matches the fixed organization: most committees span CSK, while choir-internal committees belong to MK, KK, or DK. It also avoids recreating CSK and Choir as artificial parent Groups after they were established as the application boundary and first-class domain concepts.

Group names are unique within their Group Scope regardless of Group Kind. Different Choir scopes may reuse a natural name, while two Groups in the same Choir—or two CSK-wide Groups—may not; this replaces the sibling-based rule in [ADR-0009](./0009-keep-group-names-unique-among-siblings.md).
