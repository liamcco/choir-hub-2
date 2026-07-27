# Use a dedicated Placement workspace for organizational standing

Member Status, Choir Membership, and Section Placement remain separate domain relationships, but their administrative work belongs in a dedicated Placement workspace rather than the Users collection. The Users collection remains focused on account and identity administration; Placement is the roster-oriented workflow for finding a User's current organizational location and changing that location or status.

This boundary keeps future Group Membership and Position Assignment workflows out of the Users table while giving administrators one coherent place to maintain organizational standing. Placement uses Choir and Section navigation, status-separated rosters, and User detail overlays so the workflow remains discoverable without making User records a generic relationship editor.
