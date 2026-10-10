# Changelog

## 1.0.1

### Added

- **Refresh button** — Added a manual refresh button to the search result list header; clicking it clears cache and re-searches the vault.
- **Auto-search hint** — Added "Selecting text triggers background search" hint next to the auto-search option in settings.

### Fixed

- **Hover re-search lag** — Hovering the floating toggle to open the list no longer auto-triggers a full vault search when cached results exist; uses cache instead.
- **Chip click re-search** — Clicking a recent-search chip with cached results no longer redundantly triggers exhaustive search.
- **Ribbon tooltip** — Changed ribbon icon hover tooltip to "Search-Trace".
- **Refresh spin animation** — Added missing `@keyframes spin` CSS for the refresh button loading animation.

## 1.0.0

- Initial release.