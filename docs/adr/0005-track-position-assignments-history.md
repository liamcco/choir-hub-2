# Track position assignments as history

CSK Choir Hub will model `Position` as a durable office that may be scoped to multiple groups, while `PositionAssignment` records which Member held that position during a dated period. A Position can only have one holder at a time across all of its scoped groups, so holder state belongs in historical assignments rather than current-holder fields on the Position.
