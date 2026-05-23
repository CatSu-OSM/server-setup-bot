import {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} from "discord.js";
import {
  createOrUpdateCategory,
  createOrUpdateChannel,
  createOrUpdateRole,
  parseColor,
  parsePermissionList,
  updateChannelRolePermissions
} from "./adminActions.js";
import { config } from "./config.js";
import {
  exportGuildTemplate,
  getTemplateBySlug,
  getTemplates
} from "./templates.js";
import { applyTemplate } from "./setupServer.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function previewTemplate(template) {
  const roleLines = (template.roles ?? []).map((role) => `- ${role.name}`);
  const categoryLines = (template.categories ?? []).flatMap((category) => {
    const header = `- ${category.name}`;
    const channels = (category.channels ?? []).map(
      (channel) => `  - [${channel.type}] ${channel.name}`
    );
    return [header, ...channels];
  });

  return [
    `**${template.name}**`,
    template.description,
    "",
    `Roles (${roleLines.length})`,
    ...(roleLines.length ? roleLines : ["- None"]),
    "",
    `Categories and channels (${categoryLines.length})`,
    ...(categoryLines.length ? categoryLines : ["- None"])
  ].join("\n");
}

function assertGuildAdmin(interaction) {
  if (!interaction.inGuild()) {
    throw new Error("This command can only be used inside a server.");
  }

  const hasAdmin = interaction.memberPermissions?.has(
    PermissionsBitField.Flags.Administrator
  );

  if (!hasAdmin) {
    throw new Error(
      "You need the Administrator permission to use this server admin command."
    );
  }
}

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    if (interaction.commandName === "templates") {
      const templates = getTemplates();
      const message = templates
        .map(
          (template) =>
            `â€¢ \`${template.slug}\` - **${template.name}**: ${template.description}`
        )
        .join("\n");

      await interaction.reply({
        content: message || "No templates are available.",
        ephemeral: true
      });
      return;
    }

    if (interaction.commandName === "preview") {
      const slug = interaction.options.getString("template", true);
      const template = getTemplateBySlug(slug);

      if (!template) {
        await interaction.reply({
          content: `Template \`${slug}\` was not found.`,
          ephemeral: true
        });
        return;
      }

      await interaction.reply({
        content: previewTemplate(template),
        ephemeral: true
      });
      return;
    }

    if (interaction.commandName === "setup") {
      assertGuildAdmin(interaction);

      const slug = interaction.options.getString("template", true);
      const template = getTemplateBySlug(slug);

      if (!template) {
        await interaction.reply({
          content: `Template \`${slug}\` was not found.`,
          ephemeral: true
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const result = await applyTemplate(interaction.guild, template);

      await interaction.editReply({
        content: [
          `Applied **${template.name}** to **${interaction.guild.name}**.`,
          `Roles processed: ${result.roleCount}`,
          `Categories processed: ${result.categoryCount}`,
          `Channels processed: ${result.channelCount}`
        ].join("\n")
      });
      return;
    }

    if (interaction.commandName === "save-template") {
      assertGuildAdmin(interaction);

      const result = await exportGuildTemplate(interaction.guild, {
        slug: interaction.options.getString("slug", true),
        name: interaction.options.getString("name"),
        description: interaction.options.getString("description"),
        overwrite: interaction.options.getBoolean("overwrite") ?? false
      });

      await interaction.reply({
        content: [
          `Saved template **${result.slug}**.`,
          `Roles exported: ${result.roleCount}`,
          `Categories exported: ${result.categoryCount}`,
          `Channels exported: ${result.channelCount}`
        ].join("\n"),
        ephemeral: true
      });
      return;
    }

    if (interaction.commandName === "create-role") {
      assertGuildAdmin(interaction);

      const permissions = parsePermissionList(
        interaction.options.getString("permissions")
      );
      const color = parseColor(interaction.options.getString("color"));

      const { role, created } = await createOrUpdateRole(interaction.guild, {
        name: interaction.options.getString("name", true),
        color,
        permissions,
        hoist: interaction.options.getBoolean("hoist") ?? false,
        mentionable: interaction.options.getBoolean("mentionable") ?? false
      });

      await interaction.reply({
        content: created
          ? `Created role **${role.name}**.`
          : `Updated role **${role.name}**.`,
        ephemeral: true
      });
      return;
    }

    if (interaction.commandName === "create-category") {
      assertGuildAdmin(interaction);

      const { category, created } = await createOrUpdateCategory(
        interaction.guild,
        interaction.options.getString("name", true)
      );

      await interaction.reply({
        content: created
          ? `Created category **${category.name}**.`
          : `Category **${category.name}** already exists.`,
        ephemeral: true
      });
      return;
    }

    if (interaction.commandName === "create-channel") {
      assertGuildAdmin(interaction);

      const { channel, created } = await createOrUpdateChannel(interaction.guild, {
        name: interaction.options.getString("name", true),
        type: interaction.options.getString("type", true),
        categoryName: interaction.options.getString("category"),
        topic: interaction.options.getString("topic")
      });

      await interaction.reply({
        content: created
          ? `Created channel **#${channel.name}**.`
          : `Updated channel **#${channel.name}**.`,
        ephemeral: true
      });
      return;
    }

    if (interaction.commandName === "set-channel-role-perms") {
      assertGuildAdmin(interaction);

      const { channel, role } = await updateChannelRolePermissions(
        interaction.guild,
        {
          channelName: interaction.options.getString("channel", true),
          roleName: interaction.options.getString("role", true),
          viewChannel: interaction.options.getBoolean("view_channel"),
          sendMessages: interaction.options.getBoolean("send_messages"),
          readMessageHistory: interaction.options.getBoolean("read_history"),
          connect: interaction.options.getBoolean("connect"),
          speak: interaction.options.getBoolean("speak")
        }
      );

      await interaction.reply({
        content: `Updated permissions for **${role.name}** in **#${channel.name}**.`,
        ephemeral: true
      });
      return;
    }
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while processing that command.";

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: message });
      return;
    }

    await interaction.reply({
      content: message,
      ephemeral: true
    });
  }
});

client.login(config.botToken);
