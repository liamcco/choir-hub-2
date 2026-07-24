# CSK Choir Hub

CSK Choir Hub is an internal choir platform for coordinating members, organizational groups, events, attendance, internal information, and future choir operations.

## Language

**CSK**:
Chalmers Sångkör is the single student association served by the platform. CSK is also the name of the collective choir formed when singers from the association appear together.
_Avoid_: Tenant, configurable organization

**Choir**:
One of CSK's three permanent ensembles: Manskören (MK), Kammarkören (KK), or Damkören (DK). New singers are placed in one of these Choirs; the Choirs usually rehearse separately but may take part in joint activities.
_Avoid_: CSK, temporary project ensemble

**Choir Membership**:
A dated record that a User belongs to a permanent Choir. A User has at most one current Choir Membership, but transfers retain the ended memberships as history.
_Avoid_: Group Membership, current-only choir property, project participation

**Home Choir**:
A User's current Choir Membership, if one exists. A former member and any other User without a current Choir Membership has no Home Choir.
_Avoid_: Permanent choir property, project ensemble, event participation

**Group**:
A durable organizational body within CSK, either a committee or the board. A Group is flat rather than nested, has a Group Scope, and has a name unique within that scope.
_Avoid_: CSK, Choir, Section, container, cohort, event list, permission group

**Group Kind**:
A fixed v1 classification for a Group, used when product behavior or navigation needs to distinguish committees from the board.
_Avoid_: User-defined group type, tag

**Group Scope**:
The standing organizational reach of a Group: either all of CSK or exactly one Choir. Groups do not contain other Groups, and Sections do not participate in Group Scope.
_Avoid_: Parent Group, Group hierarchy, Section

**User**:
A person represented in the choir domain and their login identity, managed by Better Auth. Every User is a choir person from creation and has one overall status, regardless of how many Groups they belong to.
_Avoid_: Auth User, Member, account

**Member Status**:
A User's overall relationship to CSK, currently active, passive, or former. Member Status is independent of dated Choir Membership, Section Placement, Group Membership, Position Assignment, login state, and authorization.
_Avoid_: Relationship status, auth role

**Group Membership**:
A dated record that a User belongs to a Committee for a period of time. Group Membership has no separate status; Board Membership is derived separately from Board Position Assignments.
_Avoid_: Board Membership, current-only group link, group membership status

**Effective Group Membership**:
A User's membership in a Group at a point in time, produced by either an explicit Group Membership or an active Position Assignment whose Position is scoped to that Group. Effective membership retains the dates of its source.
_Avoid_: Stored aggregate membership, authorization role

**Board Membership**:
A derived dated relationship held by a User during an assignment to a Board-scoped Position. Board Membership is not stored independently, and its history comes from Position Assignment history.
_Avoid_: Group Membership, manually maintained board roster

**Section**:
A permanent, choir-specific body of singers who share one fine-grained Voice Type, such as MK T1 or KK T1. Sections with the same Voice Type in different Choirs are distinct; a Section never uses an undivided base type such as T or B.
_Avoid_: Organization-wide voice category, musical part, singer capability

**Section Placement**:
A User's dated placement in a Section of their Home Choir. A User has at most one current Section Placement, may transfer without losing history, and does not gain another placement by singing a different part for a project.
_Avoid_: Group Membership, Voice, singing capability, project part assignment

**Voice Type**:
A fixed, organization-wide classification of choral voice, independent of any choir-specific Section. Numbered types are used for singer placement and selections; base types S, A, T, and B are matching categories for undivided musical Parts and Audiences.
_Avoid_: Voice, Section, singer capability, musical part, gender

**Voice Capability**:
A fine-grained Voice Type that a User can generally sing, independent of organizational placement or willingness for a particular event. Users select each capability explicitly: selecting B1 also covers an undivided B Part but does not imply B2.
_Avoid_: Section Placement, Voice Offer, event assignment

**Treble Voices**:
The collective musical category S1, S2, A1, and A2 across all Choirs, used for Audiences that span those Voice Types. It is a musical classification rather than a statement about a User's gender.
_Avoid_: Female voices, women

**TB Voices**:
The collective musical category T1, T2, B1, and B2 across all Choirs, used for Audiences that span those Voice Types. It is a musical classification rather than a statement about a User's gender.
_Avoid_: Male voices, men

**Voice Offer**:
A User's event-specific declaration of the fine-grained Voice Types they are willing to sing. Users offer each type explicitly; an offer expresses current willingness rather than standing capability or the part ultimately assigned.
_Avoid_: Voice Capability, Section Placement, event assignment

**Event Voice**:
The fine-grained Voice Type under which a User is registered for a particular singing event. It defaults from the User's current Section Placement, may be reassigned by an event organizer, and remains distinct from the User's other Voice Offers.
_Avoid_: Section Placement, Voice Capability, Voice Offer, song-specific Part

**Project Ensemble**:
A temporary singing formation assembled for one defined project or period. Each spring's Turnekören is a distinct historical Project Ensemble, such as Turnekören 2026; participation does not change a User's Home Choir or Section Placement.
_Avoid_: Choir, Section, Group, Event

**Audience**:
The domain criteria determining which Users may view a resource. In v1, an Audience may follow Home Choir, current Section Placement or its Voice Type, or current Effective Group Membership rather than creating synthetic access Groups.
_Avoid_: Access Role, Permission Scope, admin permission

**Song**:
The identity of a musical work independently of how it is scored for a particular choir configuration. One Song may have multiple Arrangements.
_Avoid_: Arrangement, score, performance

**Arrangement**:
A specific scored version of a Song, such as SATB or TTBB. An Arrangement owns the musical parts that determine its scoring.
_Avoid_: Song, event-specific singer assignment

**Part**:
An arrangement-specific singable line that references one Voice Type. Parts belong to an Arrangement rather than to a Section or singer.
_Avoid_: Voice, Voice Type, Section, event-specific singer assignment

**Position**:
A fixed choir office or role that may be relevant to one or more organizational scopes and can be held by only one User at a time. Position names are not globally unique; administrators manage who holds a Position rather than the Position definition itself.
_Avoid_: Permission, title, per-group role

**Position Scope**:
The relationship between a Position and one standing target where it has relevance: CSK, a Choir, a Section, or a Group. A Position may have multiple Position Scopes when the same office genuinely spans several targets.
_Avoid_: Position ownership, Group-only scope

**Voice Parent**:
A fixed Position responsible for one or more Sections. The holder must have a current Section Placement in at least one scoped Section throughout the Assignment; KK Voice Parents each span both numbered Sections in one Voice family.
_Avoid_: Section Leader, Voice Group leader

**Position Assignment**:
A dated record that a User held a Position for a period of time. Position Assignment history is kept so the platform can answer who held a position at a past date.
_Avoid_: Current holder field

**Access Role**:
A Better Auth-backed global authorization role assigned to a User by the app's auth system. In v1, Access Roles are intentionally separate from choir Groups, Positions, and Member Status.
_Avoid_: Group, Position, Member Status

**Permission Resource**:
A Better Auth-backed authorization resource name used by the app permission system to protect an application area. Permission Resources may use the same words as choir-domain entities when they protect those areas, but they are not the entities themselves.
_Avoid_: Group, Position, Member Status

**Permission Scope**:
The Better Auth-backed authorization boundary within which an Access Role grants a permission. In v1, Permission Scopes are global; future scoped permissions must remain distinct from choir Groups and Positions unless a later decision explicitly changes that boundary.
_Avoid_: Group, Position Scope

**Audit Event**:
A security-relevant record of an attempted or completed action, retained to support operational investigation and accountability. Audit Events identify the actor when available, the action, and the affected subject by stable identifiers, without recording credentials, secrets, or raw request data.
_Avoid_: Debug log, application error
