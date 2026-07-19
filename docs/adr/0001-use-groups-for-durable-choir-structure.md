# Use groups for durable choir structure

CSK Choir Hub will use `Group` as the single general-purpose model for durable choir organizational units, including the choir, voice sections, committees, board-like bodies, and project groups. We will not model non-member-bearing containers with a separate `isContainer` flag for now; events, attendance lists, permissions, and temporary derived cohorts should be separate concepts that may reference groups instead of being folded into the group hierarchy.
