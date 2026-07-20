<p align="center"><img src=".github/icon.svg" alt="Spark Craft" width="80" height="80"></p>

<h1 align="center">Spark Craft</h1>

<p align="center"><em>An opinionated Craft CMS 5 starter that boots to a working site, not a blank slate.</em></p>

Every new Craft site starts with the same setup: wiring a local stack, configuring a bundler, structuring templates, picking plugins. Spark Craft is that baseline already built — a [Craft CMS 5](https://craftcms.com) boilerplate that a single `spark create` turns into a running, conventional site with a Dockerized local stack, a modern Vite frontend, and a Twig/Vue template skeleton.

## Features

- **Craft CMS 5.10 on PHP 8.4** — with CKEditor, SEOMate, Expanded Singles, Empty Coalesce, and Typogrify bundled
- **Full Docker stack** — MySQL, nginx, PHP-FPM, a queue worker, Redis, Mailpit, and a Node container running Vite; nothing to install on the host beyond Docker and the spark CLI
- **spark-native workflow** — `spark up`, `spark craft`, `spark composer`, and `spark npm` drive the whole stack, with no `docker compose exec` incantations
- **Modern frontend** — Vite 8, Vue 3.5 with auto-registered components, and Tailwind CSS 4 with CSS-first design tokens
- **Template conventions** — a `_router.twig` dispatch pattern, parameterized components, and a layered `_layouts` / `_partials` / `_includes` structure from day one
- **Deploys included** — GitHub Actions workflows for staging and production, built on reusable Spark composite actions

## Installation

You'll need [Docker Desktop](https://www.docker.com/products/docker-desktop/) or a compatible engine for the local stack, plus the [spark CLI](https://github.com/jalendport/spark-cli):

```sh
brew install jalendport/tap/spark
```

Scaffold a project:

```sh
spark create craft my-site
cd my-site
```

`spark create` downloads the boilerplate, copies `.env.example.dev` to `.env`, swaps the leaner `composer.json.project` into place as your project's `composer.json` (it carries the `craft-update` and `phpstan` scripts), and initializes a fresh git repository — the first commit is yours to make.

Then bring the stack up and install Craft with the bundled plugins:

```sh
spark up
spark composer install
spark craft setup/keys
spark craft install
for plugin in vite seomate typogrify empty-coalesce ckeditor expanded-singles; do spark craft plugin/install $plugin; done
```

`setup/keys` populates `CRAFT_APP_ID` and `CRAFT_SECURITY_KEY` in `.env`. (You can also install Craft from the browser at `http://localhost:8000/admin`, but the plugins still need `plugin/install` — the composer packages alone don't enable them.)

## Usage

### Docker workflow

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

`spark up` starts everything detached; `spark logs` tails the services and `spark down` stops them. The site is served at `http://localhost:8000`, the Vite dev server at `http://localhost:8080`, and Mailpit's inbox UI at `http://localhost:8025` (set `MAILPIT_UI_PORT` in `.env` when another project already claims 8025).

On first boot the `node` container runs `npm install` for you. Keep it that way: Vite's bundler ships platform-native binaries, so a `node_modules/` installed from the macOS host won't run inside the Linux container. If you ever install on the host (e.g. for editor tooling), delete `node_modules/` and restart the `node` container to get a container-native install back.

Run Craft console commands inside the `php` container:

```sh
spark craft <command>
```

Scaffold Craft classes with the generator:

```sh
spark craft make <type> --with-docblocks
```

The verbs come from two places: the project's `spark.yml` maps `spark craft`, `spark composer`, and `spark npm` into the right containers, and the CLI ships built-ins (`up`, `down`, `restart`, `logs`, `sh`, `run`) for the compose lifecycle. Run `spark` from the project root to see them all.

### Frontend

The frontend source lives in `src/`, and Vite is configured in `config/frontend/vite.config.js`. There are two entry points, `src/js/main.js` and `src/css/main.css`, injected into Twig via the [craft-vite](https://github.com/nystudio107/craft-vite) plugin (`craft.vite.script(...)` / `craft.vite.asset(...)`). Built assets land in `web/dist/`.

npm scripts (run in the `node` container via `spark npm`):

- `spark npm run dev` — start the Vite dev server (normally run for you by the `node` container)
- `spark npm run build` — production build
- `spark npm run preview` — preview a production build
- `spark npm run svg` — optimize icons in `web/assets/icons/{16,20,24}` with SVGO

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

### Templates

Templates live in `src/templates/` — the templates path is moved there by the `CRAFT_TEMPLATES_PATH` constant defined in `config/craft/bootstrap.php`.

- **`_router.twig`** is the dispatch convention: point a section's template at it and it `include`s `_entries/<section>/<type>`, falling back to `_entries/<section>`, so each entry type gets its own template without per-section routing boilerplate.
- **`_layouts/`** holds base layouts; templates `extend` `_layouts/base`.
- **`_components/`** are self-contained, parameterized includes rendered with the `include … with { … } only` style so nothing leaks in from the parent scope.
- **`_partials/`** is reserved for Craft element partials.
- **`_includes/`** holds shared chrome such as the header, footer, and favicon.
- **`_errors/`** holds error templates; `errorTemplatePrefix` (set in `config/craft/general.php`) points Craft's error pages at that folder.

### Quality tooling

- **PHPStan** — `spark composer phpstan`, configured in `phpstan.neon` at level 5 and scoped to `src/modules`.
- **Prettier** with `prettier-plugin-tailwindcss` for class sorting (config in `.prettierrc`).
- **`.editorconfig`** — tabs, 4-wide (2-space for YAML and JSON).

## Configuration

Craft config lives in `config/craft/`:

- `general.php`, `app.php`, `vite.php`, `seomate.php`, plus a shared `bootstrap.php` that defines the base/templates/config paths and loads the environment.
- Redis is wired as the cache backend and Mailpit as the dev mailer in `app.php`, both driven by env vars.

Environment files come as a per-environment trio: `.env.example.dev`, `.env.example.staging`, and `.env.example.production`. `spark create` copies the dev variant to `.env`; copy the staging/production variants onto their respective servers.

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

## Support

Found a bug or need help? Open an [issue](https://github.com/jalendport/spark-craft/issues).

<hr>

<p align="center">Made by <a href="https://jalendport.com">Jalen Davenport</a></p>
