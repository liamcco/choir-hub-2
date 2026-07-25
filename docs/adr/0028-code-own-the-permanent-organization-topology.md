# Code-own the permanent organization topology

The imported topology module is the sole source of truth for CSK's Permanent Organization Topology: Choirs, Sections, Groups, Positions, and Position Scopes. These definitions are not stored as ordinary database data because they are fixed organizational structure rather than runtime-managed state; the database remains responsible for variable relationships such as memberships and assignments. The topology tables are removed entirely rather than retained as a synchronized projection. This reverses the database-backed reference-record choice in [ADR-0014](./0014-code-control-the-permanent-organization-topology.md), while retaining its distinction between fixed topology and administrator-managed relationships.

## Considered options

- Keep synchronized topology rows in the database: rejected because it duplicates immutable code data and makes every runtime read depend on persistence that administrators cannot change.
- Make the imported topology authoritative and remove persistent topology records: accepted because it keeps permanent structure local, typed, and directly importable.

## Consequences

- Runtime readers and validators should resolve permanent organization definitions from the topology module.
- The topology module should expose domain-shaped immutable data and focused lookup helpers; seed synchronization and database-shaped topology APIs are removed.
- Public topology values are fully expanded domain entities with final stable identifiers, lifecycle status, and complete structural scopes; compact generation for repeated definitions, if retained, remains private to the topology module.
- The topology module is persistence-free: it imports no Drizzle schema or database client, and the foundation seed/synchronizer is removed. Demo seeding may import topology to generate variable relationship fixtures.
- The public module is named `@/core/topology`, and public symbols follow the topology vocabulary (`topology`, `Topology`, `topologyData`, and `validateTopology`).
- The topology module exports distinct TypeScript ID types for Choirs, Sections, Groups, and Positions, derived from the topology definition. Database columns remain text and untyped external inputs are narrowed through runtime lookup and validation.
- Topology validation runs at module initialization and is also covered by focused tests, so invalid IDs, scopes, lifecycle values, and cross-references fail before the application serves requests.
- Membership and assignment persistence must reference stable topology identifiers without requiring topology rows to exist as database records.
- Catalog identifiers are append-only domain identities: renames preserve the identifier, retirements preserve the definition for historical lookup, and a new concept receives a new identifier rather than reusing an old one.
- Display metadata is current rather than historical: when a Position or Group is renamed, historical relationships display the current topology name for that same stable identity; labels are not snapshotted or versioned.
- Every topology entity may be marked active or retired. Normal operational lists and new relationship forms use active entities only, while direct lookup by stable identifier resolves retired entities for historical reads.
- Default list helpers return active entities; explicit `listRetiredGroups()` and `listRetiredPositions()`-style helpers may expose retired definitions when an administrative or historical workflow needs them.
- Direct lookup by a stable ID resolves active and retired definitions, allowing historical links and detail routes to remain valid; relationship creation and assignment operations still reject retired definitions.
- A structural change that would alter an entity's meaning—such as changing a Position's scopes—retires the old identifier and introduces a new identifier. Existing identifiers therefore remain stable in both identity and structural meaning; only display metadata may change in place.
- Retirement is planned after administrators end all current or scheduled relationships to the entity. Historical relationship rows remain valid and resolvable through the retired topology entry.
- Application services are the supported write boundary for relationship records. They validate referenced topology IDs and reject unknown or retired entities for new relationships; direct SQL writes are outside the integrity guarantee.
- Topology changes are delivered as reviewed and tested code deployments, not reference-data migrations. Database migrations address schema changes only; topology renames, retirements, and new structural identities are code changes.
- Because the system is still in development, the existing schema and migration are rewritten to remove topology tables rather than preserving them through a compatibility migration; development databases are reset as part of the change.
- Foreign-key constraints and SQL joins that currently point at topology tables must be replaced with application validation or another deliberate integrity mechanism.
- The migration and schema redesign must preserve historical relationship identifiers while removing the duplicated topology representation.
