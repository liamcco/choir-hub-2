/** A selectable entity with presentation-ready text, such as `Chair · Board` for an `EntityOption<PositionId>`. */
export type EntityOption<TId extends string = string> = { id: TId; label: string }

/** A lightweight entity reference with its canonical name, such as `Concert Mastery` for a `NamedEntity<GroupId>`. */
export type NamedEntity<TId extends string = string> = { id: TId; name: string }
