# Changelog

[![Common Changelog](https://common-changelog.org/badge.svg)](https://common-changelog.org)

## [1.0.0-beta.1] - 2026-07-16

### Changed

- Update to Craft 5.10 and PHP 8.4 ([`e842dd4`](https://github.com/jalendport/spark-craft/commit/e842dd44a7e20fa454582d2ed53936397695ccb6))
- Rebuild the frontend buildchain on Vite 8 and Tailwind 4 ([`2d2d54f`](https://github.com/jalendport/spark-craft/commit/2d2d54ffc47100e9c2f11426dd64198680ba5eb1))
- Rebuild the CSS layer for Tailwind 4’s CSS-first config with semantic `brand-*` tokens ([`4456e72`](https://github.com/jalendport/spark-craft/commit/4456e72c402e00a874a7e3e3d261b5cbcd9a4424))

### Added

- Add a default plugin set: CKEditor, SEOMate, Expanded Singles, Empty Coalesce and Typogrify ([`e842dd4`](https://github.com/jalendport/spark-craft/commit/e842dd44a7e20fa454582d2ed53936397695ccb6))
- Add a Twig template skeleton with `_router.twig` section dispatch and a base layout ([`f8bbc2a`](https://github.com/jalendport/spark-craft/commit/f8bbc2a36a28d8f9354d12778da438f038e2537e))
- Add a Vue form UI kit with neutral styling ([`ff6ac1f`](https://github.com/jalendport/spark-craft/commit/ff6ac1f41179dd1cc7304e3cf455c317bc250b61))
- Port the Vue app wiring, composables and JS utilities ([`94ba247`](https://github.com/jalendport/spark-craft/commit/94ba2470535226b10f976f87d0baa99163e07dec))
- Add a lean `SiteModule` skeleton ([`fa828d4`](https://github.com/jalendport/spark-craft/commit/fa828d4b3303b91377f25abaf2e683b1210d8a3a))
- Add Redis and Mailpit services to the Docker stack ([`ba97367`](https://github.com/jalendport/spark-craft/commit/ba97367756e34f0bffde148911038b5a59172e71), [`03ab24a`](https://github.com/jalendport/spark-craft/commit/03ab24a6e4ab5411d4565f59f7b26c4877c19791))
- Replace the single `.env.example` with a per-environment trio ([`3a6094a`](https://github.com/jalendport/spark-craft/commit/3a6094a972278eab2c23c061de4f9186f10a007f))
- Add staging and production deploy workflows ([`a3e24bd`](https://github.com/jalendport/spark-craft/commit/a3e24bd4a71dda788e5e0a3c7608118b94708155))
- Add PHPStan scoped to the site modules ([`d2115ad`](https://github.com/jalendport/spark-craft/commit/d2115ad653fa234546c4b0c2c3fb4fa5a10e8735))

### Removed

- Remove `@vitejs/plugin-legacy` — modern browser targets only ([`2d2d54f`](https://github.com/jalendport/spark-craft/commit/2d2d54ffc47100e9c2f11426dd64198680ba5eb1))
- Remove the PostCSS pipeline and `fluid-tailwind` in favor of Tailwind 4 and `tailwind-clamp` ([`2d2d54f`](https://github.com/jalendport/spark-craft/commit/2d2d54ffc47100e9c2f11426dd64198680ba5eb1))
- Remove the single `.env.example` ([`3a6094a`](https://github.com/jalendport/spark-craft/commit/3a6094a972278eab2c23c061de4f9186f10a007f))

## [1.0.0-alpha.2] - 2024-07-29

### Changed

- Update composer `post-create-project-cmd` script ([`968fe40`](https://github.com/jalendport/spark-craft/commit/968fe404472636d099b9bbfc0df05723b761b4f2))
- Reorganize some folders and files ([`2c8a483`](https://github.com/jalendport/spark-craft/commit/2c8a48375d713e97eff99abb865192cded98acbb), [`b3915ee`](https://github.com/jalendport/spark-craft/commit/b3915ee2307cd797181bf83f93da30f87aa0de4c))
- Bump fluid-tailwind to ^1.0.0 ([`79dfb3f`](https://github.com/jalendport/spark-craft/commit/79dfb3f9a167e7a8e900b3735e05f37b74a3e4da))

### Fixed

- Prevent queue container from crashing if mysql container isn’t ready or Craft isn’t installed ([`968fe40`](https://github.com/jalendport/spark-craft/commit/968fe404472636d099b9bbfc0df05723b761b4f2))

## [1.0.0-alpha.1] - 2024-07-25

_Initial release_

[1.0.0-beta.1]: https://github.com/jalendport/spark-craft/releases/tag/1.0.0-beta.1
[1.0.0-alpha.2]: https://github.com/jalendport/spark-craft/releases/tag/1.0.0-alpha.2
[1.0.0-alpha.1]: https://github.com/jalendport/spark-craft/releases/tag/1.0.0-alpha.1
