Do not use kluster.

Project scope:
- This repository is a Discord server setup bot.
- It supports slash commands, template-based server setup, direct admin actions for roles/categories/channels, and exporting templates from a live server.
- It is intended for reusable server structure management, not generic community automation.

Hard boundaries:
- Do not use this bot for reaction roles.
- Do not add reaction-role features, listeners, setup messages, storage files, or automation.
- Do not restore deleted reaction-role code.
- Keep `.env` secret and out of git.
- Keep `.env.example` sanitized with placeholders only.

Preferred approaches:
- Use slash commands, template-driven setup, and direct admin commands.
- Reuse existing roles and channels by name when possible.
- Preserve simple local-file workflows over hosted services.

Simple agent prompt:
- "This repository is a Discord server setup bot. Stay within slash commands, templates, and direct admin utilities. Do not add or use reaction roles. Keep secrets out of git and preserve placeholder-only example config."
