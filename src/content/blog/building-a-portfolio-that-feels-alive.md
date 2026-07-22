---
title: "Building a Portfolio That Feels Alive"
date: "2026-07-22"
summary: "How my portfolio evolved from a collection of pages into a content-driven platform with interactive timelines, an anonymous forum, and security designed into the experience."
---

Most portfolio websites answer the same questions: Who are you? What have you built? How can someone contact you?

Those questions matter, but I wanted this project to do more than display their answers. I wanted the site itself to be evidence of how I approach software: start with a clear purpose, build a reliable foundation, and keep refining the small interactions that shape the final experience.

That decision changed the project from a static personal website into an evolving web platform.

> **A portfolio should demonstrate how you think—not only catalogue what you have done.**

![The PhP project journey — each new interaction introduced a new engineering problem](/content/php-project-journey.svg)

# Starting with the content, not the components

The first architectural decision was to keep the important content outside the React components. Projects, blog posts, education, and professional experience are stored as Markdown files with structured frontmatter.

This gives the site two useful qualities. The pages remain fast because most of the content can be generated ahead of time, and updating the portfolio does not require editing presentation code. A new project or timeline entry is a content change rather than a UI change.

It also forced me to think about the boundary between data and design. The Markdown files describe the work. The components decide how that work should appear on different screens. Keeping those responsibilities separate made later redesigns much easier.

In practice, the content model became simple:

- **Frontmatter** carries titles, dates, links, tags, and ordering.
- **Markdown** carries the story and technical detail.
- **React components** decide how each content type behaves on screen.

# Designing a timeline as an experience

The experience and education sections became one of the most iterative parts of the build.

A normal list would have been simpler, but it would not communicate progression. I built the sections as a scroll-driven timeline with alternating cards, a shared central rail, and a moving streak that follows the direction of time. As the visitor moves between experience, education, and projects, the heading and accent colour change in place.

The difficult part was not drawing a vertical line. It was making the line, cards, headings, snap behaviour, and responsive layout feel like one system. Small alignment errors were immediately visible. A card could be technically centred and still feel too close to its upper edge. An animation could move correctly and still suggest the wrong direction.

> **Correctness includes perception.** The browser can report perfect coordinates while the design still feels unbalanced.

# Adding a forum changed the security model

The anonymous forum began as a way to make the site less one-directional. Instead of treating visitors only as readers, it gives them a place to create threads, reply, vote, and attach coloured ASCII artwork generated in their browser.

The moment visitors could write to the database, the project stopped being only a portfolio. It needed real trust boundaries.

![Portfolio scope meme — the simple site became a tested full-stack platform](/content/php-scope-meme.svg)

The forum now treats every browser value as untrusted:

- Text and action parameters are validated on the server.
- Administrative permissions are checked server-side, not merely hidden in the interface.
- Sessions use HTTP-only, strict same-site cookies.
- Votes and ownership identifiers are hashed.
- Database constraints protect vote integrity even if application logic fails.

Rate limiting required deeper thought. A limiter is not useful if its identity can be changed by editing a user-agent header, and a count-then-insert sequence can fail under concurrent requests. The current design uses a proxy-controlled client address, salted fingerprints, and PostgreSQL advisory locks to make each limit check atomic. Old limiter events are removed so the protection itself cannot grow forever.

The forum also has explicit growth limits. Threads and reply discussions are bounded, queries are capped, and oversized content is rejected. These choices are intentionally less exciting than the visual features, but they are what make a public feature sustainable.

---

# Generating ASCII art without uploading the source image

The attachment workflow is one of my favourite details.

When a visitor selects an image, the browser samples it with a canvas, maps luminance values to ASCII characters, and preserves the original colours. Only the generated WebP output is submitted. The source image never needs to be uploaded to the application server.

Client-side processing improves privacy and reduces unnecessary server work, but the server still treats the result as untrusted. It verifies the data URL, decoded size, image structure, dimensions, and total pixel count before storing anything.

> Moving work to the client can improve privacy and performance, but it never removes the need for server-side validation.

# Making deployment part of the application

The deployment configuration is kept alongside the code because production behaviour is part of the system design.

The live application deploys through Vercel whenever the production branch is updated, with credentials supplied through Vercel environment variables instead of the repository. The project can also produce a standalone Next.js build and includes a hardened container setup behind Caddy or Nginx as a self-hosting option. Browser responses include a Content Security Policy and other defensive headers.

Dependency security is part of the same process. After reviewing the application, I updated the framework and transitive packages until the complete dependency audit returned zero known vulnerabilities. It is not a permanent guarantee—security is never finished—but it gives the project a clean, measurable baseline.

| Production question | Current answer |
| --- | --- |
| Can the database be reached publicly? | No—PostgreSQL stays on the internal container network. |
| Are secrets stored in the repository? | No—they are supplied through environment variables. |
| Can the app container gain extra privileges? | Its capabilities are dropped and new privileges are disabled. |
| What happens to browser-delivered code? | CSP and defensive response headers restrict its environment. |
| Are dependencies checked? | Both production and development dependency trees are audited. |

# What I learned

The biggest lesson from this project is that polish and engineering depth are not opposing goals.

The animated timeline matters because it helps visitors understand the story. The Markdown architecture matters because it keeps that story maintainable. The forum matters because it makes the site participatory. The security controls matter because participation creates responsibility.

I also learned to value iteration more deliberately. Several of the best improvements came from looking at the running application, noticing that something felt wrong, and tracing that feeling back to a specific technical decision. That loop—build, observe, question, refine—is now one of the defining ideas behind the platform.

The site will continue to change as my work changes. That is the point. I did not want to build a finished brochure; I wanted to build a system capable of growing with me.
