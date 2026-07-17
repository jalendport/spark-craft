# Spark - Craft

An opinionated [Craft CMS 5](https://craftcms.com) starter project by [Jalen Davenport](https://jalendport.com). It ships a Dockerized local stack, a modern Vite frontend, and a Twig/Vue template skeleton so a new site starts from a working, conventional baseline instead of a blank slate.

## Stack at a glance

- **Craft CMS 5.10** on **PHP 8.4**
- **Vite 8** with **Vue 3.5** and **Tailwind CSS 4** (CSS-first config)
- **Docker** for the full local stack: MySQL, nginx, Node/Vite, PHP-FPM, a queue worker, Redis, and Mailpit
- Plugins: CKEditor, SEOMate, Expanded Singles, Empty Coalesce, Typogrify

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or a compatible engine) for the local stack
- Node 22+ and npm, only for host-side tooling such as Prettier and the SVG optimizer — the Vite dev server itself runs inside the `node` container

## Getting started

Create a project from the boilerplate:

```sh
composer create-project jalendport/spark-craft <dir>
```

Composer's `post-create-project-cmd` then runs automatically and:

1. Renames `.env.example.dev` to `.env`.
2. Generates the app keys (`craft setup/keys`), which populates `CRAFT_APP_ID` and `CRAFT_SECURITY_KEY` in `.env`.
3. Swaps in the real `composer.json` (see below) and dumps an optimized autoloader.

### The dual `composer.json` mechanism

The repo tracks two files: `composer.json` and `composer.json.project`. The first is what `composer create-project` reads to build your project — it carries the `post-create-project-cmd` script and project metadata. `composer.json.project` is the leaner manifest your project should actually live with (it drops the create-time scaffolding and adds the `craft-update` / `phpstan` scripts). During post-create, the original `composer.json` is deleted and `composer.json.project` is renamed into its place. After creating a project you'll only have a single `composer.json`; the `.project` variant only matters inside this boilerplate repo.

Once created, bring the stack up (see below), then install Craft and enable the bundled plugins:

```sh
docker compose exec php ./craft install
docker compose exec php sh -c 'for plugin in vite seomate typogrify empty-coalesce ckeditor expanded-singles; do ./craft plugin/install $plugin; done'
```

(You can also install from the browser at `http://localhost:8000/admin`, but the plugins still need `plugin/install` — the composer packages alone don't enable them.)

## Docker workflow

`docker-compose.yml` defines the local services:

| Service   | Image / build            | Host port                         |
| --------- | ------------------------ | --------------------------------- |
| `mysql`   | `jalendport/spark-mysql` | `3307` → 3306                     |
| `nginx`   | `jalendport/spark-nginx` | `8000` → 80 (the site)           |
| `node`    | local build (Vite)       | `8080` (dev server)               |
| `php`     | local build (PHP-FPM)    | internal only                     |
| `queue`   | local build              | internal only (queue worker)      |
| `redis`   | `redis:7-alpine`         | internal only                     |
| `mailpit` | `axllent/mailpit`        | `8025` (web UI, overridable)      |

Start everything:

```sh
docker compose up
```

The site is served at `http://localhost:8000`, the Vite dev server at `http://localhost:8080`, and Mailpit's inbox UI at `http://localhost:8025` (set `MAILPIT_UI_PORT` in `.env` when another project already claims 8025).

On first boot the `node` container runs `npm install` for you. Keep it that way: Vite's bundler ships platform-native binaries, so a `node_modules/` installed from the macOS host won't run inside the Linux container. If you ever install on the host (e.g. for editor tooling), delete `node_modules/` and restart the `node` container to get a container-native install back.

Run Craft console commands inside the `php` container:

```sh
docker compose exec php ./craft <command>
```

Scaffold Craft classes with the generator:

```sh
docker compose exec php ./craft make <type> --with-docblocks
```

## Frontend

The frontend source lives in `src/`, and Vite is configured in `config/frontend/vite.config.js`. There are two entry points, `src/js/main.js` and `src/css/main.css`, injected into Twig via the [craft-vite](https://github.com/nystudio107/craft-vite) plugin (`craft.vite.script(...)` / `craft.vite.asset(...)`). Built assets land in `web/dist/`.

npm scripts:

- `npm run dev` — start the Vite dev server (normally run for you by the `node` container)
- `npm run build` — production build
- `npm run preview` — preview a production build
- `npm run svg` — optimize icons in `web/assets/icons/{16,20,24}` with SVGO

### Tailwind 4

Design tokens live in `src/css/theme.css` using Tailwind 4's CSS-first `@theme` block — there is no `tailwind.config.js`. Notable conventions:

- **Semantic brand tokens.** `--color-brand-accent`, `--color-brand-heading`, `--color-brand-body`, and their `on-*` counterparts are placeholders meant to be swapped per project. Every colored background gets an `on-*` pair so contrast decisions live in the theme, not scattered across templates.
- **1px spacing grid.** `--spacing` is set to `1px`, so utilities map directly to pixels (`p-20` is 20px, `text-16` is 16px).
- **Fluid values** via [`tailwind-clamp`](https://nicolas-cusan.github.io/tailwind-clamp/), clamped between the `xs` and `2xl` breakpoints (e.g. `clamp-[text,34,48]`).

### Vue

The Vue app auto-registers components from `src/js/vue/components/` using `import.meta.glob`:

- `*.vue` files are registered eagerly.
- `*.lazy.vue` files are registered as async components. An optional `*.loading.vue` and `*.error.vue` companion (matched by name) supply the loading and error states.

Because the glob is evaluated at startup, a Vite plugin restarts the dev server when a component file is added or removed.

The kit ships a set of form components (`FormInput`, `FormSelect`, `FormCheckbox`, `FormRadio`, `FormFileUpload`, etc.) and a `SuperForm` wrapper built on [vee-validate](https://vee-validate.logaflow.com/) and [yup](https://github.com/jquense/yup), plus composables in `src/js/vue/composables/` and framework-agnostic helpers in `src/js/utils/`.

### Icons and fonts

- **Icons** are optimized SVGs in `web/assets/icons/{16,20,24}` (organized by pixel size) and rendered inline via Craft's `svg()` function — for example the `_components/button.twig` `leftIcon` / `rightIcon` params.
- **Fonts** are self-hosted: drop `woff2` files into `web/assets/fonts/`, uncomment the `@font-face` blocks in `src/css/components/typography.css`, and point `--font-sans` / `--font-display` at the family in `theme.css`.

## Templates

Templates live in `src/templates/` — the templates path is moved there by the `CRAFT_TEMPLATES_PATH` constant defined in `config/craft/bootstrap.php`.

- **`_router.twig`** is the dispatch convention: point a section's template at it and it `include`s `_entries/<section>/<type>`, falling back to `_entries/<section>`, so each entry type gets its own template without per-section routing boilerplate.
- **`_layouts/`** holds base layouts; templates `extend` `_layouts/base`.
- **`_components/`** are self-contained, parameterized includes rendered with the `include … with { … } only` style so nothing leaks in from the parent scope.
- **`_partials/`** is reserved for Craft element partials.
- **`_includes/`** holds shared chrome such as the header, footer, and favicon.
- **`_errors/`** holds error templates; `errorTemplatePrefix` (set in `config/craft/general.php`) points Craft's error pages at that folder.

## Config

Craft config lives in `config/craft/`:

- `general.php`, `app.php`, `vite.php`, `seomate.php`, plus a shared `bootstrap.php` that defines the base/templates/config paths and loads the environment.
- Redis is wired as the cache backend and Mailpit as the dev mailer in `app.php`, both driven by env vars.

Environment files come as a per-environment trio: `.env.example.dev`, `.env.example.staging`, and `.env.example.production`. Post-create copies the dev variant to `.env`; copy the staging/production variants onto their respective servers.

## Quality

- **PHPStan** — `composer phpstan`, configured in `phpstan.neon` at level 5 and scoped to `src/modules`.
- **Prettier** with `prettier-plugin-tailwindcss` for class sorting (config in `.prettierrc`).
- **`.editorconfig`** — tabs, 4-wide (2-space for YAML and JSON).

## Deployment

Two GitHub Actions workflows, built on the reusable composite actions in [`jalendport/spark-github-actions`](https://github.com/jalendport/spark-github-actions), handle deploys:

- `.github/workflows/build-and-deploy--staging.yml` — deploys `develop`.
- `.github/workflows/build-and-deploy--production.yml` — deploys `master`.

Each builds (`composer install`, `npm install`, `npm run build`), rsyncs to the server, and triggers a Laravel Forge deployment. Set these repository secrets, per environment (prefix with `STAGING_` and `PRODUCTION_`):

- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`
- `SSH_PATH`
- `FORGE_DEPLOY_TRIGGER_URL`

> Note: the composite actions currently pin `php-8.3` and `node-22` variants, while the runtime images are on PHP 8.4.

## Releases

The project follows [git-flow](https://nvie.com/posts/a-successful-git-branching-model/): work merges into `develop`, releases are cut on `release/*` branches and merged to `master`. Changes are recorded in `CHANGELOG.md` following [Common Changelog](https://common-changelog.org). Pushing a tag triggers `.github/workflows/release.yml`, which creates the GitHub release (tags containing `alpha` or `beta` are marked pre-releases).

## License

[0BSD](LICENSE.md)
