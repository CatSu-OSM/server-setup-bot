import { Client, GatewayIntentBits } from "discord.js";
import {
  createOrUpdateCategory,
  createOrUpdateChannel
} from "../src/adminActions.js";
import { config } from "../src/config.js";

const structure = [
  {
    category: "ðŸ“˜ Information",
    channels: [
      { name: "ðŸ“Œãƒ»welcome", type: "text", readonly: true },
      { name: "ðŸ“Œãƒ»rules", type: "text", readonly: true },
      { name: "ðŸ“Œãƒ»announcements", type: "text", readonly: true }
    ]
  },
  {
    category: "ðŸ›  Support",
    channels: [
      { name: "ðŸ’»ãƒ»pc-help", type: "text" },
      { name: "ðŸ› ï¸ãƒ»tech-support", type: "text" },
      { name: "ðŸ“±ãƒ»phone-help", type: "text" },
      { name: "ðŸ”§ãƒ»build-advice", type: "text" }
    ]
  },
  {
    category: "ðŸ’¬ Community",
    channels: [
      { name: "ðŸ’¬ãƒ»main-chat", type: "text" },
      { name: "ðŸ—‘ï¸ãƒ»off-topic", type: "text" },
      { name: "ðŸ“¸ãƒ»pictures-and-videos", type: "text" },
      { name: "ðŸŽ®ãƒ»setup-showcase", type: "text" }
    ]
  },
  {
    category: "ðŸ”Š Voice",
    channels: [
      { name: "ðŸ”Šãƒ»Lounge", type: "voice" },
      { name: "ðŸŽ®ãƒ»Gaming VC", type: "voice" },
      { name: "ðŸ› ï¸ãƒ»Support VC", type: "voice" }
    ]
  }
];

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

async function ensureReadonlyChannel(channel) {
  await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
    ViewChannel: true,
    ReadMessageHistory: true,
    SendMessages: false
  });
}

client.once("clientReady", async () => {
  try {
    const guild = await client.guilds.fetch(config.guildId);
    await guild.fetch();

    for (const block of structure) {
      await createOrUpdateCategory(guild, block.category);

      for (const channelDefinition of block.channels) {
        const { channel } = await createOrUpdateChannel(guild, {
          name: channelDefinition.name,
          type: channelDefinition.type,
          categoryName: block.category
        });

        if (channelDefinition.readonly) {
          await ensureReadonlyChannel(channel);
        }
      }
    }

    console.log(`Applied live setup to guild ${guild.id}.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.destroy();
  }
});

client.login(config.botToken);
