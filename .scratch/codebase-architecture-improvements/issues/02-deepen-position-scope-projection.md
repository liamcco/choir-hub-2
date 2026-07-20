# 02 — Deepen Position Scope projection

**What to build:** Position management, Position Assignment selection, and Organization overview all use one canonical scoped Position projection so shared/single/unscoped state, scope labels, and duplicate Position name cues are tested once.

**Blocked by:** 01 — Deepen Group tree behavior.

**Status:** ready-for-agent

- [ ] Position management uses canonical scoped Position views for scope labels, scope kind, and duplicate-name cues.
- [ ] Position Assignment selection uses the same scoped Position projection for display labels.
- [ ] Organization overview uses the same scoped Position projection for Position scope labels and assignment display.
- [ ] Tests cover single-scope, shared-scope, unscoped, missing-scope, and duplicate-name cases through the projection module interface.
- [ ] Existing Position management, Position Assignment, and Organization overview behavior remains unchanged for users.
