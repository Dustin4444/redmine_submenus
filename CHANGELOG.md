# Changelog

All notable changes to this project will be documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.3.1] - 2026-05-19

### Added
- Unit tests for `{{subprojects}}` and `{{subpages}}` macros — verifies registration and return values.

## [0.3.0] - 2026-05-12

### Changed
- **Plugin scope reduced**: kanban board and project status management split out into the dedicated `redmine_subfolio` plugin. Submenus now focuses exclusively on navigation dropdowns.
- Improved macro autocomplete and CSS polish for dropdown menus.

### Removed
- Kanban portfolio view (`{{subprojects(view=kanban)}}`).
- Project Status custom field management and drag-and-drop status logic.
- `manage_project_status` permission (moved to `redmine_subfolio`).

## [0.2.0] - 2025-06-05

### Added
- **Kanban portfolio view**: `{{subprojects(view=kanban)}}` macro with drag-and-drop status management.
- Redmine standard authorisation integration for kanban permission control.
- Compatibility fixes for Redmine 4.x through 6.x.
- `{{subprojects}}` and `{{subpages}}` macros with `list`, `table`, and `kanban` view options.
- `depth` and `roles` parameters for table view.

### Fixed
- Menu height issue with A1 theme.
- Wiki links in subprojects macro list view.

## [0.1.0] - 2025-01-13

### Added
- Initial release.
- Dropdown navigation on project titles showing accessible subprojects.
- Dropdown navigation on wiki page titles showing child pages.
- Context-preserving navigation (maintains current Redmine tab).
- Configurable dropdown trigger symbol via plugin settings.
