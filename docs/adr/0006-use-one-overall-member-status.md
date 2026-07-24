# Use one overall member status

> Amended by [ADR-0015](./0015-model-choirs-and-sections-explicitly.md): a User has at most one current Choir Membership, while Member Status remains independent of dated organizational relationships.

CSK Choir Hub will store one overall `MemberStatus` on each Member, initially active, passive, or former. A Member may belong to one or several choirs and other Groups, but their overall relationship to the choir organization is separate from dated Group Membership history.
