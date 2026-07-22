# Address Admin Details with Query Parameters

Admin Group, Member, and Position details will open as modals over their owning collection page and be addressed with that page's `detail` query parameter (for example, `/admin/members?detail=<member-id>`). This preserves direct links and navigable related records without retaining dedicated detail routes, intercepting routes, or parallel routes. Create modals remain local UI state because they do not need a shareable or restorable URL.

When a related record belongs to the same collection, its `detail` value replaces the current one. When it belongs to another collection, navigation moves to that collection with its `detail` value. This deliberately trades URL-free modals for deep linking and predictable browser navigation while keeping route structure simple.
