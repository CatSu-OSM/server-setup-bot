import { Client, GatewayIntentBits } from "discord.js";
import { createOrUpdateRole } from "../src/adminActions.js";
import { config } from "../src/config.js";

const roles = [
  {
    name: "Owner",
    color: "#b91c1c",
    hoist: true,
    mentionable: true,
    permissions: ["Administrator"]
  },
  {
    name: "Co-Owner",
    color: "#dc2626",
    hoist: true,
    mentionable: true,
    permissions: ["Administrator"]
  },
  {
    name: "Mods",
    color: "#1d4ed8",
    hoist: true,
    mentionable: true,
    permissions: [
      "ViewChannel",
      "ManageChannels",
      "ManageRoles",
      "ManageMessages",
      "KickMembers",
      "BanMembers",
      "ModerateMembers",
      "MuteMembers",
      "DeafenMembers",
      "MoveMembers",
      "ManageNicknames",
      "ReadMessageHistory",
      "SendMessages",
      "Connect",
      "Speak"
    ]
  },
  {
    name: "Verified",
    color: "#65a30d",
    hoist: true,
    mentionable: false,
    permissions: [
      "ViewChannel",
      "ReadMessageHistory",
      "SendMessages",
      "Connect",
      "Speak",
      "UseApplicationCommands",
      "AddReactions",
      "AttachFiles",
      "EmbedLinks"
    ]
  },
  {
    name: "Members",
    color: "#16a34a",
    hoist: true,
    mentionable: false,
    permissions: [
      "ViewChannel",
      "ReadMessageHistory",
      "SendMessages",
      "Connect",
      "Speak",
      "UseApplicationCommands",
      "AddReactions",
      "AttachFiles",
      "EmbedLinks"
    ]
  },
  {
    name: "BOTs",
    color: "#1e1b4b",
    hoist: true,
    mentionable: false,
    permissions: [
      "ViewChannel",
      "ReadMessageHistory",
      "SendMessages",
      "ManageMessages",
      "EmbedLinks",
      "AttachFiles",
      "UseApplicationCommands",
      "AddReactions",
      "Connect",
      "Speak"
    ]
  }
];

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("clientReady", async () => {
  try {
    const guild = await client.guilds.fetch(config.guildId);
    await guild.fetch();
    const results = [];

    for (const roleDefinition of roles) {
      const result = await createOrUpdateRole(guild, roleDefinition);
      results.push({
        name: roleDefinition.name,
        created: result.created,
        skipped: result.skipped ?? false
      });
    }

    const created = results.filter((entry) => entry.created).map((entry) => entry.name);
    const updated = results
      .filter((entry) => !entry.created && !entry.skipped)
      .map((entry) => entry.name);
    const skipped = results.filter((entry) => entry.skipped).map((entry) => entry.name);

    console.log(`Applied requested roles to guild ${guild.id}.`);
    console.log(`Created: ${created.join(", ") || "none"}`);
    console.log(`Updated: ${updated.join(", ") || "none"}`);
    console.log(`Skipped: ${skipped.join(", ") || "none"}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.destroy();
  }
});

client.login(config.botToken);
