# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## Unreleased

### Added

- Added a node healthcheck so `spark up --wait` returns only once Vite is serving

### Changed

- Reworked `spark create` setup as CLI-native copy and rename, so no container runs before `.env` exists
- Threaded the project name through `package.json`, `composer.json` and the installed site's name

### Removed

- Removed the Postgres-only `CRAFT_DB_SCHEMA` setting from the env examples

### Fixed

- Fixed the queue worker hanging forever on its MySQL TLS check

## 1.0.0-beta.2 - 2026-07-16

### Added

- Shipped the staging and production deploy workflows in `composer create-project` dists

### Changed

- Made the deploy workflows inert in the boilerplate repo itself

## 1.0.0-beta.1 - 2026-07-16

### Added

- Added a default plugin set: CKEditor, SEOMate, Expanded Singles, Empty Coalesce and Typogrify
- Added a Twig template skeleton with `_router.twig` section dispatch and a base layout
- Added a Vue form UI kit with neutral styling
- Ported the Vue app wiring, composables and JS utilities
- Added a lean `SiteModule` skeleton
- Added Redis and Mailpit services to the Docker stack
- Replaced the single `.env.example` with a per-environment trio
- Added staging and production deploy workflows
- Added PHPStan scoped to the site modules

### Changed

- Updated to Craft 5.10 and PHP 8.4
- Rebuilt the frontend buildchain on Vite 8 and Tailwind 4
- Rebuilt the CSS layer for Tailwind 4’s CSS-first config with semantic `brand-*` tokens

### Removed

- Removed `@vitejs/plugin-legacy` — modern browser targets only
- Removed the PostCSS pipeline and `fluid-tailwind` in favor of Tailwind 4 and `tailwind-clamp`
- Removed the single `.env.example`

## 1.0.0-alpha.2 - 2024-07-29

### Changed

- Updated the composer `post-create-project-cmd` script
- Reorganized some folders and files
- Bumped fluid-tailwind to ^1.0.0

### Fixed

- Fixed the queue container crashing when the mysql container wasn’t ready or Craft wasn’t installed

## 1.0.0-alpha.1 - 2024-07-25

_Initial release_
