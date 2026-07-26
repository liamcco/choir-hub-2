# Keep the Admin shell and resource presentations separate

The Admin route owns only persistent resource navigation and shared page framing; Users, Groups, and Positions own their collection loading states and detail/create presentations. This deliberately keeps the admin shell stable for streaming navigation while allowing each resource's table, skeleton, dialog width, and content hierarchy to reflect its different domain shape, instead of forcing them through one universal collection or detail component.

The User collection uses explicit client-side grouping modes after transient search filtering: Name is a flat name sort, Status and Voice render expanded groups, and Home Choir renders nested Choir → Voice groups, all with deterministic domain ordering and name ordering within the innermost group. Voice values are the fine-grained `S1` through `B2` values; base voice values are not valid user placement values.
