# Admin Bot

A Discord bot for setting up servers from reusable templates and direct admin commands.

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

## Included commands

- `/templates` shows the built-in templates
- `/preview template:<name>` shows what a template will create
- `/setup template:<name>` creates or updates the current server
- `/save-template ...` exports the current server into a reusable template file
- `/create-role ...` creates or updates a role directly
- `/create-category ...` creates a category directly
- `/create-channel ...` creates or updates a channel directly
- `/set-channel-role-perms ...` updates simple role permissions on a channel

## Setup

1. Create a Discord application in the Discord Developer Portal.
2. Add a bot user to that application.
3. Copy [`.env.example`](C:\Users\catsu\Documents\Admin Bot\upload\.env.example) to `.env`.
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

## Templates

Templates live in the `templates/` folder as JSON files. Each template can define:

- `roles`
- `categories`
- `channels`
- channel permission overwrites by role name

Built-in templates currently include:

- `community`
- `gaming`

You can also create a template from an existing server with `/save-template`.

## Notes

- `/setup` requires Discord Administrator permission in the target server.
- The direct admin commands also require Discord Administrator permission.
- The bot does not delete anything yet; it only creates missing items and updates matching ones.
- Reaction roles are intentionally unsupported in this repository.
- Guild-specific slash command registration with `GUILD_ID` updates almost immediately. Global registration can take longer.

## Agent prompt

Use this prompt with Codex or another coding agent:

```text
This repository is a Discord server setup bot. Its scope is slash commands, reusable server templates, direct admin actions for roles/categories/channels, and exporting templates from an existing server. Do not add or use reaction roles. Do not add reaction listeners, reaction-role setup messages, or reaction-role storage. Keep .env secret, preserve .env.example as placeholders only, and prefer simple template-driven or slash-command-driven workflows.
```

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
