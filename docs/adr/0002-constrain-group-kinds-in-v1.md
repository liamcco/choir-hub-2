# Constrain group kinds in v1

> Amended by [ADR-0015](./0015-model-choirs-and-sections-explicitly.md): Choir and Section are no longer Group kinds. Project is also deferred, leaving Committee and Board as the v1 Group kinds.

For v1, CSK Choir Hub will treat group kinds as a fixed vocabulary rather than a freely user-defined database table: choir, section, committee, board, and project. Group kinds shape behavior and navigation, so constraining them keeps semantics clear while the platform is young; arbitrary categorization can be revisited later if real product needs appear.
