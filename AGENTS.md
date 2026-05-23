Do not use kluster.

Project scope:
- This repository is a Discord server setup bot.
- The primary interaction model is through Codex or another coding agent making changes in the repo for the user.
- It supports slash commands, template-based server setup, direct admin actions for roles/categories/channels, and exporting templates from a live server.

Hard boundaries:
- Do not use this bot for reaction roles.
- Do not add reaction-role features, listeners, setup messages, storage files, or automation.
- Do not restore deleted reaction-role code.
- Keep `.env` secret and out of git.
- Keep `.env.example` sanitized with placeholders only.

Edit map:
- Edit `src/config.js` lines 15-18 for required environment variables.
- Edit `scripts/register-commands.js` lines 5-29 for command registration behavior.
- Edit `src/commands.js` lines 4-198 for slash command definitions, names, descriptions, and options.
- Edit `src/index.js` lines 68-261 for interaction routing and command execution behavior.
- Edit `src/setupServer.js` lines 156-194 for how templates are applied to a guild.
- Edit `src/adminActions.js` lines 64-219 for direct role/category/channel helper behavior.
- Edit `templates/*.json` for reusable server layouts.
- Keep `README.md` and `AGENTS.md` synchronized with the actual behavior.

Preferred approaches:
- Prefer making the repo changes directly instead of giving generic setup advice.
- Prefer editing templates and command code over asking the user to rebuild things manually in Discord.
- Reuse existing roles and channels by name when possible.
- Preserve simple local-file workflows over hosted services.

Simple agent prompt:
- "This repository is a Discord server setup bot. Operate mainly by editing the repo for the user, not by giving generic manual instructions. Start with src/config.js lines 15-18, scripts/register-commands.js lines 5-29, src/commands.js lines 4-198, src/index.js lines 68-261, src/setupServer.js lines 156-194, src/adminActions.js lines 64-219, and templates/*.json. Do not add or use reaction roles. Keep secrets out of git and keep docs in sync with behavior."
