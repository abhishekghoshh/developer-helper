# AGENTS.md — developer-helper docs repository

This repo is the **single consolidated home** for Markdown documentation migrated from
`aws-helper`, `database-helper`, `infrastructure-helper`, and `system-design-helper`.
`docs/` holds only documentation (Markdown + doc-referenced assets). No application code lives here.

## Layout

```
docs/
  index.md            # Home page (new; links to each section)
  ai/                 # from system-design-helper docs/ai/ (+ skills.md, previously un-navved)
  aws/                # from aws-helper docs/ (13 flat topic pages + assets/networking-basics.jpg + slides/*.pdf)
  basics/             # from system-design-helper docs/basics/
  database/           # from database-helper docs/
    index.md          # section ToC (links namespaced per subdir, e.g. postgres/introduction.md)
    database/         # fundamentals (31 pp.)
    postgres/ sql/ redis/ mongodb/ kafka/ others/
    sql/leetcode-problems/   # .sql companions referenced by sql/leetcode.md (NOT in nav)
  devops/             # from system-design-helper docs/devops/
  infrastructure/     # from infrastructure-helper docs/ (renamed — see below)
  security/           # from system-design-helper docs/security/ (+ reverse-engineering.md)
  system-design/
    index.md          # moved from root docs/index.md
    books.md courses.md interview.md
    high-level/{concepts/{basic,advanced},designing/{basic,advanced},links/,assets/}
    low-level/{concepts,design-pattern/{creational,structural,behavioral},designing}
mkdocs.yml            # consolidated nav (strict-clean), site_name: Developer Helper
requirements.txt      # mkdocs stack (material, mermaid2, mkdocs-pdf; NO macros — see below)
projects/
  aws/                # from aws-helper docs/codes/ (121 sample-code files + 3 .md; NOT in MkDocs nav)
  ai/                 # pre-existing PoCs (gen-ai/agentic-ai/vector-db) — out of scope
```

`projects/ai/*/docs/` (gen-ai/agentic-ai/vector-db PoCs) was deliberately **not** migrated — out of scope.

## Conventions for contributors/agents

- **Markdown only in `docs/`**: every `.md` under `docs/` must appear in `mkdocs.yml` nav
  (exception: `database/sql/leetcode-problems/*.sql` companions — referenced by link, not navved).
- **Filenames**: kebab-case for new files. Legacy mixed-case names are preserved as-is — do not rename
  (`ai/MCP.md`, `ai/RAG.md`, `database/others/SurrealDB.md`, `database/others/rabbitMQ.md`,
  `system-design/.../Image-Optimisation-on-the-fly.md`); new files must not copy that style.
- **Known legacy typos, preserved** (renaming breaks URLs): `url-shortner`, `cap-theorm`,
  `restfull-architecture`, `ditributed-transaction-*`, `asynchronus-communication`, `recomendation-engine`,
  `whatspp`, `thundering-effect`, postgres `README.md` as section landing.
  Fixed during migration (do not reintroduce): infrastructure `observibility→observability`,
  `computer-architechture→computer-architecture`, `intialization→initialization`,
  `harshicorp→hashicorp`; system-design nav `desgining→designing`.
- **Cross-directory links** must be explicit relative paths: from
  `system-design/high-level/concepts/basic/api.md` to `../advanced/graphql.md`, and from
  `database/index.md` to `postgres/introduction.md` (never bare `introduction.md`).
- **Do not re-add the `macros` plugin**: GitHub `${{ secrets.* }}` / `${{ github.* }}` snippets,
  Java `"{%s:g%d}:s%d".formatted(...)`, and mermaid `Q{{...}}` nodes are misparsed as Jinja by
  mkdocs-macros (13+ pre-existing pages). Code samples render literally without it.
  Keep `{% raw %}…{% endraw %}` guards where they already exist (helm theory).
- **Assets**: keep doc-referenced binaries next to their docs (`aws/assets/`, `aws/slides/*.pdf`,
  `infrastructure/kubernetes/assets/*`, `system-design/high-level/assets/*`, `database/sql/leetcode-problems/*.sql`).
  Code samples live in `projects/aws/` (NOT navved) — the 3 `.md` there
  (`api-gateway/mapping-template.md`, `sam-codedeploy/SAM.md`, `sam-codedeploy/sam-app/README.md`) are READMEs
  accompanying their sample code; they must NOT be re-added to `docs/` or nav.
  Do not commit build output (`site/`), venvs, node_modules, PDFs/DOCXs/YAML/code that no `.md` references.
  Orphan third-party images do not belong in `docs/` (a low-res watermarked `URL+Shortening+Service.png` was deleted 2026-11-15 rather than wired into `url-shortner.md`).
  `projects/ai/*/docs/` (116 `.md` across gen-ai/agentic-ai/vector-db PoCs) stays co-located with its code — zero filename overlap with `docs/ai/` but 21 shared basenames across PoCs, so keep separate; cross-link instead of merging.
- **Validation**: after any docs/nav change, run `python -m mkdocs build --strict` and require
  **zero** `WARNING`/`ERROR` lines (anchor `#fragment` INFO lines are pre-existing noise, acceptable).
  Every `docs/**/*.md` (except the leetcode `.sql` companions, which aren't `.md`) must be reachable via nav.
