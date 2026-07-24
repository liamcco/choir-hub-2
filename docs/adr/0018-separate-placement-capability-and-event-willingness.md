# Separate placement, capability, and event willingness

CSK Choir Hub will represent a singer's usual Section Placement, lasting Voice Capabilities, and event-specific Voice Offers as distinct facts. The Voice Type of the current Section Placement automatically contributes the singer's default capability, additional Voice Capabilities record other Voice Types they can generally cover, and a Voice Offer records only what they are willing to sing for one event.

Voice Capabilities and Voice Offers use only fine-grained numbered Voice Types. Singers select both refinements when they can cover both rather than selecting an ambiguous base type.

This separation prevents cross-choir flexibility from creating false Section memberships and preserves the difference between “usually sings T1,” “can also sing T2 and B1,” and “offers B1 for this concert.”

For a singing event, the User's Event Voice defaults from their current Section Placement but is stored separately from their other Voice Offers and may be reassigned by an event organizer. Event-level modeling beyond this boundary is deferred until after v1.
