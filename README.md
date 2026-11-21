# Developer Helper

Consolidated technical documentation: AWS, databases, infrastructure, security, AI, and system design — built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and published to [GitHub Pages](https://abhishekghoshh.github.io/developer-helper).

## Table of Contents

- [Live Site](#live-site)
- [What's Inside](#whats-inside)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Live Site

Browse the rendered docs: **https://abhishekghoshh.github.io/developer-helper**

Start from the [Home](docs/index.md) page, or jump straight into a section below.

## What's Inside

| Section | Start Here | What You'll Find |
|---|---|---|
| [System Design](docs/system-design/index.md) | [Overview](docs/system-design/index.md) | HLD/LDD concepts, designing guides, books, courses, [interview prep](docs/system-design/interview.md) |
| [Databases](docs/database/index.md) | [Overview](docs/database/index.md) | Fundamentals, PostgreSQL, SQL, Redis, MongoDB, Kafka, and more |
| [AWS](docs/aws/introduction.md) | [Introduction](docs/aws/introduction.md) | DVA-C02 questions, CLI, DynamoDB, EKS, networking, S3, SSO |
| [Infrastructure](docs/infrastructure/index.md) | [Overview](docs/infrastructure/index.md) | Docker, Kubernetes, Terraform, Git, CI/CD, observability, Linux |
| [Security](docs/security/introduction.md) | [Introduction](docs/security/introduction.md) | Auth, OAuth, JWT, RBAC, SSO, TLS/SSL, certificates, reverse proxies |
| [AI](docs/ai/ai.md) | [AI](docs/ai/ai.md) | Gen AI, agentic AI, RAG, MCP, LangChain, vector embeddings, skills |
| [Basics](docs/basics/computer-architecture.md) | [Computer Architecture](docs/basics/computer-architecture.md) | CPU, pointers, maths, behavioural, wisdom, open-source tools |
| [DevOps](docs/devops/index.md) | [Overview](docs/devops/index.md) | Deployment strategies and practices |

### System Design Highlights

- **Books:** [System Design Interview Guide](docs/system-design/books/system-design-interview-insider-guide/index.md) · [Designing Data-Intensive Applications](docs/system-design/books/data-intensive-applications/index.md) · [All books](docs/system-design/books.md)
- **Concepts:** [Overview](docs/system-design/high-level/concepts/0-introduction.md) — basic + advanced, from networking and caching to consistency, Raft, and event sourcing
- **Designing:** [Overview](docs/system-design/high-level/designing/0-introduction.md) — basic + advanced system builds (URL shortener → Netflix, payments, maps)
- **LLD:** [Design patterns](docs/system-design/low-level/design-pattern/design-pattern.md) · [Designing problems](docs/system-design/low-level/designing/0-introduction.md) · [LLD overview](docs/system-design/low-level/index.md)
- **Prep:** [Courses](docs/system-design/courses.md) · [Interview helper](docs/system-design/interview.md)

## Quick Start

### Local preview (venv)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m mkdocs serve
# open http://127.0.0.1:8000
```

### Local preview (Docker)

```bash
docker compose up
# open http://localhost:8000 — local changes mount live into the container
```

### Strict build (required before pushing docs/nav changes)

```bash
python -m mkdocs build --strict
```

Must produce zero `WARNING`/`ERROR` lines. See [AGENTS.md](AGENTS.md) for the full contributor contract.

## Project Structure

```
docs/                  # Markdown documentation only (every .md is in mkdocs.yml nav)
  index.md             # Home page
  ai/ aws/ basics/ database/ devops/
  infrastructure/ security/ system-design/
projects/
  aws/                 # Sample code (NOT in nav) + 3 READMEs for their samples
  ai/                  # Pre-existing PoCs — out of scope, kept co-located
mkdocs.yml             # Consolidated nav, site_name: Developer Helper
requirements.txt       # MkDocs Material + mermaid2 + PDF stack (no macros plugin)
Dockerfile.docs        # Docs container (venv + mkdocs serve on :8000)
docker-compose.yaml    # Live-mount local preview
archive/               # Retired notes, not published
```

See [AGENTS.md](AGENTS.md) for layout details, filename conventions (kebab-case for new files, legacy names preserved), and validation rules.

## Contributing

1. Add or edit Markdown under `docs/` and wire every new page into `mkdocs.yml` nav.
2. Use kebab-case filenames; keep cross-directory links as explicit relative paths.
3. Run `python -m mkdocs build --strict` — zero warnings required.
4. Open a PR; GitHub Actions builds and publishes to Pages.

## License

[Apache License 2.0](LICENSE).
