# Domain Model Notes

This document tracks product and data-model concepts during the CSK Choir Hub domain-modeling session. Settled vocabulary belongs in `CONTEXT.md`; hard-to-reverse accepted decisions belong in `docs/adr/`.

## Organizational Reality

- The platform is an internal member portal for one student association, Chalmers Sångkör (CSK); it is not a multi-organization product.
- CSK is the fixed boundary of the platform rather than a Group record.
- CSK is also the name used for the collective choir when singers from the association appear together.
- CSK has three permanent Choirs:
  - Manskören (MK), with T1, T2, B1, and B2 singers.
  - Kammarkören (KK), with S1, S2, A1, A2, T1, T2, B1, and B2 singers.
  - Damkören (DK), with S1, S2, A1, and A2 singers.
- Those twelve choir-specific Sections are the exact permanent, code-controlled Section topology.
- New singers are placed in one of MK, KK, or DK.
- A User has at most one current Home Choir but may have none, including after becoming a former member.
- Home Choir is dated: a transfer ends the previous Choir membership and begins another without discarding history.
- Cross-choir projects and collective appearances do not change a singer's Home Choir.
- The three Choirs usually rehearse separately, but projects, concerts, parties, and other activities may span the whole association.
- Choirs may have internal committees; many committees span the whole association.
- The fixed CSK-wide Group catalog contains the Board, Concert Mastery, Gig Mastery, Party Mastery, Web Mastery, Tour Committee, and Recruitment Committee.
- Each of MK, KK, and DK has a choir-scoped Concert Group, Party Group, and Rodd Group.
- All non-Board bodies in the fixed Group catalog have Group Kind Committee regardless of their displayed naming convention.
- Choirs, Sections, Groups, Positions, and their scopes are fixed reference data with no structural or metadata editing in v1.
- Administrators manage Choir Memberships, Section Placements, Committee memberships, and Position Assignments rather than the reference definitions.
- Each spring's Turnekören is a distinct dated historical Project Ensemble instance, such as Turnekören 2026. Its participants retain their Home Choir and Section Placement.

## Voice and Section Model

The previous model treated a Voice as a current membership in a Group of kind Section and allowed several current Voices. That definition is superseded by the accepted Section and Section Placement language:

- A Section is a permanent, choir-specific body of singers, such as MK T1 or KK T1. Sections with the same musical label in different Choirs are distinct.
- A Section Placement is a User's dated placement in a Section of their Home Choir.
- A User has at most one current Section Placement, may transfer without losing history, and may have no current placement.
- Singing a different part for a project does not create another Section Placement.
- Voice Type is a fixed organization-wide taxonomy, independent of choir-specific Sections.
- MK T1 and KK T1 are distinct Sections that reference the same T1 Voice Type.
- The taxonomy contains the undivided base types S, A, T, and B and numbered refinements such as B1 and B2.
- Every Section references one fine-grained numbered Voice Type; a singer cannot belong to a generic S, A, T, or B Section.
- Voice Capabilities and Voice Offers allow only fine-grained numbered types.
- A singer who can cover both B1 and B2 selects both explicitly rather than selecting B.
- B1 qualifies a singer for an undivided B Part or B Audience but does not imply B2; the equivalent rule applies to the other voice families.
- Treble Voices, also called SA voices, means S1, S2, A1, and A2 across all Choirs and is not derived from a User's gender.
- TB voices means T1, T2, B1, and B2 across all Choirs and is not derived from a User's gender.
- A singer is normally capable of the part associated with their choir-specific placement.
- For a CSK-wide project or gig, a singer may offer to sing other parts; for example, both T2 and B1.
- A Song is the identity of a musical work independently of scoring.
- One Song may have multiple Arrangements, such as SATB and TTBB.
- An Arrangement owns its musical parts and may contain one undivided bass harmony, B, or split it into B1 and B2.
- An Arrangement contains explicit Parts, and each Part references one global Voice Type.
- A singer's current Section Placement supplies their default Voice Type automatically.
- Additional Voice Capabilities record the Voice Types a singer can generally cover outside their usual Section Placement.
- A Voice Offer records which Voice Types a singer is willing to sing for one event; it is distinct from both capability and placement.
- A User's Event Voice defaults from their current Section Placement, is stored separately from their other Voice Offers, and may be reassigned by an event organizer.
- Event Voice is event-level registration and reporting data, not a song-specific Part assignment.
- Event reporting should eventually show the distribution of parts among participating singers.
- Resource access may target a permanent Choir (KK), a choir-specific body (MK T1), or a broader musical classification (any bass harmony or female voices).
- Resource Audience determines content visibility and is distinct from authorization to create, edit, or administer the resource.
- Audience rules reference the relevant domain relationship directly rather than creating synthetic access Groups.
- Current Effective Group Membership, whether explicit or Position-derived, can grant Audience access to a committee, webmaster body, or the Board.
- In v1, Voice Type Audiences derive from current Section Placement; capability-based Audiences are distinct but deferred.

The overloaded uses of `Voice` have been separated into Section Placement, Voice Type, Voice Capability, Voice Offer, and arrangement-specific Part.

The current implementation and admin-management specification conflict with this accepted model: they derive Voice from any current Section membership and deliberately permit multiple simultaneous values. They must be revised after the domain-modeling session.

## Organizational Foundation

- `Choir` and `Section` are first-class domain concepts rather than Group kinds.
- `ChoirMembership` and `SectionPlacement` are dedicated dated relationships rather than generic Group Memberships.
- A User has at most one current Choir Membership and one current Section Placement; either relationship may be absent, and ended relationships remain as history.
- Concurrent current Choir Memberships and Section Placements are intentionally disallowed; transfers may be adjacent or leave a gap.
- Every active Section Placement must be covered by the matching Choir Membership for its Section's Choir.
- `Group` represents durable organizational bodies that are either committees or the board.
- Groups are flat rather than nested.
- Every Group has a Group Scope: either CSK-wide or exactly one Choir.
- Sections are separate concepts and do not participate in Group Scope.
- `Group.name` is unique within Group Scope regardless of Group Kind; the same name may be reused in different Choir scopes.
- `GroupKind` is constrained for v1 rather than user-defined: committee and board.
- `User` is the unified Better Auth identity and choir person; every User has a `MemberStatus`.
- Choir profile and contact fields are deferred until concrete workflows need them.
- `MemberStatus` describes a User's overall choir relationship as active, passive, or former, independent of how many choirs or Groups they belong to.
- `GroupMembership` tracks historical Committee membership with `startsAt` and optional `endsAt`; there is no separate status concept for a Group Membership.
- Effective Group Membership at a point in time is the union of explicit Group Memberships and Position Assignments whose Positions are scoped to that Group.
- Position-derived Group Membership retains the Position Assignment interval, so historical Board and Committee rosters remain answerable.
- `Position` represents a fixed office or role that may have multiple Position Scopes.
- `Position.name` is display text, not a globally unique domain key; distinct scoped Positions may share the same name.
- `PositionScope` references one first-class standing target where a Position has relevance: CSK, a Choir, a Section, or a Group.
- Each Choir has its own Conductor, Master of Concerts, and Master of Gigs Positions.
- Each choir-scoped Master of Concerts is also associated with Concert Mastery, and each choir-scoped Master of Gigs is also associated with Gig Mastery.
- Party Mistress is a distinct vice Master of Parties Position scoped only to Party Mastery, not the Board.
- Master of Parties has both Board and Party Mastery scopes.
- Master of Gigs has Board and Gig Mastery scopes.
- 1st Master of Concerts has Board and Concert Mastery scopes.
- Master of PR is Board-only. PR has no Mastery, and no Position is scoped to Web Mastery.
- The canonical term for a section leadership Position is Voice Parent, not Section Leader.
- MK and DK each have one Voice Parent Position per Section.
- KK has four Voice Parent Positions, scoped respectively to S1+S2, A1+A2, T1+T2, and B1+B2.
- A Voice Parent Assignment requires the holder to have a current Section Placement in at least one scoped Section throughout the Assignment.
- Choir-scoped Master of Concerts and Master of Gigs Assignments require the holder to maintain a matching Choir Membership throughout.
- Conductor Assignments do not require Choir Membership; a Conductor may serve a Choir without singing in it.
- The Tour Committee has its own Treasurer Position.
- `PositionAssignment` tracks historical holders of a Position. A Position can only be held by one User at a time.
- Permanent Choirs, Sections, Groups, and Positions are database-backed reference records with stable identifiers, but their structural topology is defined and synchronized from code rather than edited by ordinary administrators.
- Top-level units do not need a CSK parent record. Whole-organization audiences derive from qualifying Users, and collective appearances derive their singer roster from event participation.
- Membership and assignment writes prevent overlaps. Membership periods must not overlap for the same User and Group, and assignment periods must not overlap for the same Position.
- The current Prisma schema conflicts with this accepted model by representing Choir and Section as `GroupKind` values and both relationships as `GroupMembership`.
- The v1 User collection uses `Name | Home Choir | Section | Status`, with zero or one current Home Choir and Section and no multiplicity warning.

## Deferred Concepts

- Repertoire details beyond the accepted Song → Arrangement → Part boundary are deferred until after v1 organizational modeling.
- Far-future user-created chat or content collections are deferred without deciding whether they are Spaces or organizational Groups.
- Capability-based resource Audiences are deferred; v1 Voice Type Audiences use current Section Placement.
- `Event`: needed later for rehearsals, concerts, meetings, services, and other dated choir activities; modeling beyond the accepted Voice Offer and Event Voice boundaries is deferred until after v1.
- `Attendance`: needed later to record User participation or absence for Events.
- `EventGroup` or equivalent targeting: needed later if Events are aimed at one or more Groups.
- Internal information: needed later for User-facing pages, documents, notices, or knowledge-base content.
- User profile/contact details: deferred until concrete directory, communication, or administration workflows define the fields.
- Audience behavior beyond the accepted v1 Home Choir, Section, Voice Type, Committee, and Board targets is deferred.
- Temporary or derived cohorts: needed later for attendance lists, filters, or operational subsets, but should not be modeled as `Group` unless they become durable organizational units.

## Unresolved Organizational Questions

- How nonstandard, solo, or unison Arrangement Parts should relate to Voice Types.
- Whether Position Assignment needs extra metadata, such as appointment source, notes, or handover date.
- Whether non-overlap invariants should eventually be enforced in PostgreSQL exclusion constraints, service logic, or both.
- Whether future choir-specific profile fields should live directly on User or in a separate supporting model.
