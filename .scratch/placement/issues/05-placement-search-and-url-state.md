# 05 — Add Placement search and URL state

Type: task
Status: ready-for-agent

Make Placement navigation and User detail addressable through query parameters only, using the existing `detail` convention. Search is a combobox that selects a User rather than filtering the current roster.

- [ ] Encode hierarchy selection in query parameters, not path segments.
- [ ] Encode selected User detail with the existing detail parameter convention.
- [ ] Search all non-hidden Placement Users across all hierarchy contexts.
- [ ] Open the selected User detail immediately.
- [ ] Return search-opened detail to All Users when closed.
- [ ] Preserve hierarchy-opened context when closing its detail overlay.
- [ ] Test browser navigation and direct links.
