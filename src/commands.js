import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { getTemplates } from "./templates.js";

export function buildCommands() {
  const templateChoices = getTemplates().map((template) => ({
    name: template.name,
    value: template.slug
  }));

  return [
    new SlashCommandBuilder()
      .setName("templates")
      .setDescription("List the available server setup templates."),
    new SlashCommandBuilder()
      .setName("preview")
      .setDescription("Preview what a setup template will create.")
      .addStringOption((option) => {
        option
          .setName("template")
          .setDescription("Template to preview")
          .setRequired(true);

        for (const choice of templateChoices) {
          option.addChoices(choice);
        }

        return option;
      }),
    new SlashCommandBuilder()
      .setName("setup")
      .setDescription("Create or update this server using a setup template.")
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addStringOption((option) => {
        option
          .setName("template")
          .setDescription("Template to apply")
          .setRequired(true);

        for (const choice of templateChoices) {
          option.addChoices(choice);
        }

        return option;
      }),
    new SlashCommandBuilder()
      .setName("save-template")
      .setDescription("Save this server's structure as a reusable template.")
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addStringOption((option) =>
        option
          .setName("slug")
          .setDescription("Template file name, like pc-community")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Display name for the saved template")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("description")
          .setDescription("Short description for the saved template")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("overwrite")
          .setDescription("Overwrite an existing template with the same slug")
          .setRequired(false)
      ),
    new SlashCommandBuilder()
      .setName("create-role")
      .setDescription("Create or update a role.")
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Role name")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("color")
          .setDescription("Hex color like #ff6600")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("permissions")
          .setDescription("Comma-separated permissions, like ManageChannels,BanMembers")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("hoist")
          .setDescription("Show the role separately in the member list")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("mentionable")
          .setDescription("Allow anyone to mention this role")
          .setRequired(false)
      ),
    new SlashCommandBuilder()
      .setName("create-category")
      .setDescription("Create a category if it does not already exist.")
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Category name")
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("create-channel")
      .setDescription("Create or update a channel.")
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Channel name")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Channel type")
          .setRequired(true)
          .addChoices(
            { name: "Text", value: "text" },
            { name: "Voice", value: "voice" },
            { name: "Forum", value: "forum" },
            { name: "Stage", value: "stage" },
            { name: "Announcement", value: "announcement" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("category")
          .setDescription("Optional existing category name")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("topic")
          .setDescription("Optional topic for text or announcement channels")
          .setRequired(false)
      ),
    new SlashCommandBuilder()
      .setName("set-channel-role-perms")
      .setDescription("Set basic channel permissions for a role.")
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addStringOption((option) =>
        option
          .setName("channel")
          .setDescription("Channel name")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("role")
          .setDescription("Role name or @everyone")
          .setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName("view_channel")
          .setDescription("Allow viewing the channel")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("send_messages")
          .setDescription("Allow sending messages")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("read_history")
          .setDescription("Allow reading message history")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("connect")
          .setDescription("Allow connecting to a voice channel")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("speak")
          .setDescription("Allow speaking in a voice channel")
          .setRequired(false)
      )
  ].map((command) => command.toJSON());
}
