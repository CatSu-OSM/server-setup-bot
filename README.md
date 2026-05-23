# Admin Bot

A Discord server setup bot meant to be operated primarily through Codex or another coding agent.

## Primary workflow

The intended way to use this repository is:

1. Tell Codex or another agent what server structure or command behavior you want.
2. Let the agent update the templates or command code in this repo.
3. Put your real Discord credentials into `.env`.
4. Run command registration.
5. Start the bot and use the slash commands in Discord.

Manual editing is supported, but the repo is organized so an agent can handle most setup and customization directly.

## Scope

This project is for:

- registering slash commands
- previewing built-in templates
- applying template-based server layouts
- creating or updating roles, categories, channels, and simple channel role permissions
- exporting a server into a reusable template

This project is not for:

- reaction roles
- moderation automations based on reactions
- onboarding systems that depend on reaction messages

## Hard boundary

- Do not use this bot for reaction roles.
- Do not add reaction-role automation, reaction listeners, reaction-role setup messages, or reaction-role data files in this project.
- If role assignment is needed, use slash commands, template setup, or another dedicated tool instead.

## Agent-first setup

If you want Codex or another agent to set this up for you, give it your intended server structure and tell it to work in this order:

- update `.env` locally from `.env.example`
- edit `templates/*.json` for server structure
- edit `src/commands.js` if slash commands need to change
- edit `src/setupServer.js` if template application behavior needs to change
- edit `src/index.js` if command handling or replies need to change
- edit `scripts/register-commands.js` only if command registration behavior needs to change
- keep `README.md` and `AGENTS.md` aligned with the real behavior

## Setup

1. Create a Discord application in the Discord Developer Portal.
2. Add a bot user to that application.
3. Copy `.env.example` to `.env`.
4. Fill in:
   - `BOT_TOKEN` with your bot token
   - `CLIENT_ID` with your Discord application client ID
   - `GUILD_ID` with a test server ID if you want fast guild-specific slash command registration
5. Install dependencies:

```powershell
npm install
```

6. Register slash commands:

```powershell
npm run register
```

7. Start the bot:

```powershell
npm start
```

## Discord permissions

Use a bot invite with these scopes:

- `bot`
- `applications.commands`

Recommended bot permissions:

- `Manage Roles`
- `Manage Channels`
- `View Channels`
- `Send Messages`

If you plan to let the bot create private or restricted spaces, make sure the bot's role is high enough in the server role list to manage the target roles.

## Repo map for agents

Use these files as the main edit points:

- `src/config.js` lines 15-18: environment variables used at runtime
- `src/commands.js` lines 4-198: slash command definitions and options
- `src/index.js` lines 68-261: interaction routing and command execution behavior
- `src/setupServer.js` lines 156-194: how templates are applied to a guild
- `src/adminActions.js` lines 64-219: direct role/category/channel helper logic
- `scripts/register-commands.js` lines 5-29: pushes slash commands to Discord
- `templates/community.json` and `templates/gaming.json`: examples of reusable server layouts

## Local files

- `.env` stores your local bot token and IDs and should never be committed
- `.env.example` is the safe template to keep in GitHub
- `templates/` stores reusable server layouts as JSON
- `data/` can hold local runtime data if the bot gains future non-secret persistence

## Pushing to GitHub

Before pushing this as a new repository:

- keep `.env` out of git
- keep `node_modules/` out of git
- make sure only placeholder values are in shared example files
- review template JSON files for anything server-specific you do not want to publish

## Agent prompt

Use this with Codex or another coding agent:

```text
This repository is a Discord server setup bot, and the main interaction model should be through the agent making code and template changes for the user. Automate setup practically instead of giving generic advice.

Work from these files first:
- src/config.js lines 15-18 for required env vars and runtime config
- scripts/register-commands.js lines 5-29 for slash-command registration behavior
- src/commands.js lines 4-198 for command names, descriptions, and options
- src/index.js lines 68-261 for command handling and Discord replies
- src/setupServer.js lines 156-194 for how templates are applied to a server
- src/adminActions.js lines 64-219 for direct role/category/channel helpers
- templates/*.json for the actual reusable server structures

Rules:
- do not add or use reaction roles
- keep .env secret and out of git
- keep .env.example sanitized with placeholders only
- prefer editing templates and command code directly over telling the user to click around manually
- when changing behavior, also update README.md and AGENTS.md so the repo instructions stay accurate
```

## Notes

- `/setup` requires Discord Administrator permission in the target server.
- The direct admin commands also require Discord Administrator permission.
- The bot does not delete anything yet; it only creates missing items and updates matching ones.
- Reaction roles are intentionally unsupported in this repository.
- Guild-specific slash command registration with `GUILD_ID` updates almost immediately. Global registration can take longer.

## Examples

```text
/create-role name:Moderator color:#ff6600 permissions:ManageMessages,KickMembers,BanMembers hoist:true mentionable:true
```

```text
/create-category name:Staff
```

```text
/create-channel name:staff-chat type:text category:Staff topic:Private moderator coordination
```

```text
/set-channel-role-perms channel:staff-chat role:@everyone view_channel:false
```

```text
/save-template slug:my-server-backup name:My Server Backup overwrite:true
```
