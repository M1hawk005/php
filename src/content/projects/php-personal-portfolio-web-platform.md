---
title: "PhP — Personal Portfolio & Web Platform"
description: "A content-driven portfolio and community platform with interactive timelines, technical writing, an anonymous forum, and production-focused security."
techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma", "Docker", "Markdown"]
isHighlighted: true
link: "https://php-m1hawk.vercel.app/"
githubUrl: "https://github.com/M1hawk005/php"
---

# Overview

PhP is my personal portfolio and an evolving full-stack web platform. It brings my professional timeline, technical projects, writing, and an anonymous community forum into one cohesive experience.

I built it because I wanted my portfolio to demonstrate more than finished outcomes. The application should also show how I structure content, design responsive interactions, protect public features, and prepare software for deployment.

![PhP platform architecture — content-driven pages and controlled public writes](/content/php-platform-architecture.svg)

# Motivation

A conventional portfolio can become difficult to maintain as soon as every update requires a component change. It can also feel passive: visitors read a few summaries, open a link, and leave.

I wanted a different foundation—one where publishing new work was simple, the interface communicated progression, and visitors could interact with the platform rather than only consume it.

> **The design rule:** the portfolio should not only describe how I build software; using it should reveal how I build software.

That led to three goals:

- Keep professional content independent from presentation code.
- Make the journey through my work feel deliberate on desktop and mobile.
- Treat interactive features as production systems, with validation, abuse controls, and operational limits.

# The system at a glance

| Concern | Decision | Result |
| --- | --- | --- |
| Publishing | Markdown with frontmatter | New work can be added without rewriting UI components. |
| Experience | Scroll-driven responsive timeline | Career progression becomes part of the interaction. |
| Participation | Anonymous threaded forum | Visitors can contribute without creating an account. |
| Media | Browser-based ASCII conversion | Source images stay on the visitor's device. |
| Safety | Server validation, atomic limits, database constraints | Public writes remain bounded and auditable. |
| Delivery | Standalone Next.js with container isolation | The production boundary is versioned with the application. |

# Content-driven architecture

Projects, blog posts, education, and experience entries live in Markdown files with frontmatter metadata. Next.js reads that content at build time and generates the corresponding pages.

This keeps publishing lightweight and makes the interface reusable. A project card and its detail page are driven by the same source file, while the React components remain focused on layout, navigation, accessibility, and interaction.

The approach also makes the repository itself a practical content-management workflow: adding a page is as simple as adding a reviewed Markdown file.

---

# Scroll-driven portfolio experience

The home page uses full-screen sections and nested scroll snapping to create a guided experience without taking control away from the visitor. Experience and education entries are presented as alternating timeline cards connected by a shared rail.

The rail responds to the active section, and a bright animated streak moves from bottom to top to reinforce the direction of time. Section headings remain in place while their text and theme colour transition between experience, education, and featured projects.

Getting this interaction right required repeated work across spacing, card sizing, rail geometry, responsive behaviour, reduced-motion support, and intersection detection. Automated component tests now cover the important section changes and timeline states.

# Anonymous forum

The forum turns the site into a two-way platform. Visitors can create threads, reply to comments, vote, and delete content they own without registering for an account. Administrators can pin, archive, restore, or remove content.

Ownership is represented by a random browser identifier that is salted and hashed before persistence. Administrative sessions use HTTP-only cookies with strict same-site behaviour, and every privileged action is verified on the server.

The forum supports one level of nested discussion, thread retention, voting constraints, and bounded post counts so that individual pages and the underlying database cannot grow without limit.

> Adding a database was easy. Defining who could write, how often they could write, and how much the system would retain was the real full-stack work.

# Coloured ASCII image generator

Visitors can convert an image into coloured ASCII art before attaching it to a forum post. The conversion happens entirely in the browser:

1. A canvas samples the selected image at a small resolution.
2. Each pixel's luminance is mapped to an ASCII character.
3. The character is drawn using the sampled colour.
4. The generated canvas is encoded as WebP and submitted with the post.

The original image is never uploaded. On the server, the generated attachment is still validated for encoding, file structure, byte size, dimensions, and total pixels before it is accepted.

---

# Security and reliability

Adding anonymous writes changed the threat model of the application. Security work therefore became part of the feature rather than a final checklist.

Key controls include:

- Server-side validation for all forum inputs and action parameters.
- Atomic rate limits using salted client fingerprints and PostgreSQL advisory locks.
- Escaped user content with no raw HTML rendering.
- Database constraints for valid vote types and directions.
- Bounded attachment sizes, discussion sizes, and query results.
- Content Security Policy, clickjacking protection, MIME sniffing protection, and restrictive browser permissions.
- Automated dependency auditing with no currently known vulnerabilities.

The goal is not to claim that the application is permanently secure. The goal is to make every trust decision explicit, testable, and replaceable as the platform evolves.

# Deployment

The live application is deployed through Vercel from the repository's production branch. Production credentials are supplied through Vercel environment variables, and each approved push creates a fresh deployment without storing secrets in Git.

The repository also retains a standalone Next.js container setup with Docker Compose, Caddy, and an Nginx alternative for future self-hosting. Prisma migrations keep database changes versioned with the application across either deployment model.

# Outcome

PhP now serves as both a portfolio and a working demonstration of my approach to product engineering. The visible experience is backed by a maintainable content system, tested interactions, database-backed community features, and a deployment model designed with security in mind.

The project is intentionally ongoing. As my work develops, the platform can grow without needing to be rebuilt around a new structure each time.
