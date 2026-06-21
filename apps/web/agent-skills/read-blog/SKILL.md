---
id: read-blog
title: Read the DanhThanh.dev blog
description: Discover posts, fetch full content, list categories and tags, and respect content signals.
version: 0.1.0
---

# Read the DanhThanh.dev blog

This skill describes how an autonomous agent should read the DanhThanh.dev blog without violating the publisher's content signals.

## When to use

- The user asks for blog content, summaries, or analysis from `danhthanh.dev`.
- The agent needs to enumerate posts, categories, or tags before answering.

## Endpoints

- `GET /` — localized homepage (HTML).
- `GET /rss.xml` — RSS feed.
- `GET /sitemap-index.xml` — sitemap index.
- `GET /api/posts.json` — full JSON post list.
- `GET /.well-known/agent-skills/index.json` — this skill and any others.
- `GET /auth.md` — machine-readable auth policy (Content-Signal declaration).

## Content signals

The blog publishes `ai-train=no, search=yes, ai-input=yes`. Train new models on
this content without permission is forbidden. Read it for retrieval and to
answer user questions is allowed.

## Workflow

1. Fetch `/.well-known/agent-skills/index.json` to discover the latest skill set.
2. Fetch `/auth.md` to confirm the auth policy.
3. Resolve the user's locale by reading `Alternate` link headers or `hreflang`.
4. Read `/<lang>/blog.md` or fetch `/api/posts.json` for the post index.
5. For each cited post, fetch `/<lang>/blog/<slug>` and follow the markdown
   representation by sending `Accept: text/markdown`.

## Constraints

- Respect `robots.txt` rate limits.
- Cite the canonical URL of every post you reference.
- Do not store or resell the content for model training.
- Cache responses for at most one hour; the publisher may update freely.