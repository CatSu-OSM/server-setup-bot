import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ChannelType } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, "..", "templates");

const EXPORTED_CHANNEL_TYPES = new Map([
  [ChannelType.GuildText, "text"],
  [ChannelType.GuildVoice, "voice"],
  [ChannelType.GuildForum, "forum"],
  [ChannelType.GuildStageVoice, "stage"],
  [ChannelType.GuildAnnouncement, "announcement"]
]);

function readTemplateFile(filename) {
  const fullPath = path.join(templatesDir, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = JSON.parse(raw);

  parsed.slug = parsed.slug ?? path.basename(filename, ".json");
  return parsed;
}

export function getTemplates() {
  return fs
    .readdirSync(templatesDir)
    .filter((entry) => entry.endsWith(".json"))
    .map(readTemplateFile)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getTemplateBySlug(slug) {
  return getTemplates().find((template) => template.slug === slug) ?? null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeRoleColor(role) {
  if (!role.hexColor || role.hexColor === "#000000") {
    return undefined;
  }

  return role.hexColor;
}

function extractRolePermissions(role) {
  return role.permissions
    .toArray()
    .filter((permission) => permission !== "ViewChannel" || !role.managed)
    .sort((a, b) => a.localeCompare(b));
}

function extractOverwrite(guild, overwrite) {
  if (overwrite.type !== 0) {
    return null;
  }

  if (overwrite.id === guild.roles.everyone.id) {
    return {
      target: "@everyone",
      allow: overwrite.allow.toArray().sort((a, b) => a.localeCompare(b)),
      deny: overwrite.deny.toArray().sort((a, b) => a.localeCompare(b))
    };
  }

  const role = guild.roles.cache.get(overwrite.id);

  if (!role || role.managed) {
    return null;
  }

  return {
    target: role.name,
    allow: overwrite.allow.toArray().sort((a, b) => a.localeCompare(b)),
    deny: overwrite.deny.toArray().sort((a, b) => a.localeCompare(b))
  };
}

function extractChannelDefinition(guild, channel) {
  const type = EXPORTED_CHANNEL_TYPES.get(channel.type);

  if (!type) {
    return null;
  }

  const definition = {
    name: channel.name,
    type
  };

  if ("topic" in channel && channel.topic) {
    definition.topic = channel.topic;
  }

  const overwrites = channel.permissionOverwrites.cache
    .map((overwrite) => extractOverwrite(guild, overwrite))
    .filter(Boolean);

  if (overwrites.length) {
    definition.permissions = overwrites;
  }

  return definition;
}

export async function exportGuildTemplate(guild, options = {}) {
  await guild.roles.fetch();
  await guild.channels.fetch();

  const slug = slugify(options.slug || options.name || guild.name);

  if (!slug) {
    throw new Error("Template slug cannot be empty.");
  }

  const roles = guild.roles.cache
    .filter((role) => role.id !== guild.roles.everyone.id && !role.managed)
    .sort((a, b) => b.position - a.position)
    .map((role) => {
      const definition = {
        name: role.name,
        hoist: role.hoist,
        mentionable: role.mentionable,
        permissions: extractRolePermissions(role)
      };

      const color = normalizeRoleColor(role);

      if (color) {
        definition.color = color;
      }

      return definition;
    });

  const categories = guild.channels.cache
    .filter((channel) => channel.type === ChannelType.GuildCategory)
    .sort((a, b) => a.rawPosition - b.rawPosition)
    .map((category) => {
      const channels = guild.channels.cache
        .filter((channel) => channel.parentId === category.id)
        .sort((a, b) => a.rawPosition - b.rawPosition)
        .map((channel) => extractChannelDefinition(guild, channel))
        .filter(Boolean);

      return {
        name: category.name,
        channels
      };
    });

  const template = {
    slug,
    name: options.name?.trim() || guild.name,
    description:
      options.description?.trim() ||
      `Exported from ${guild.name} on ${new Date().toISOString().slice(0, 10)}`,
    roles,
    categories
  };

  const templatePath = path.join(templatesDir, `${slug}.json`);

  if (!options.overwrite && fs.existsSync(templatePath)) {
    throw new Error(`Template "${slug}" already exists.`);
  }

  fs.writeFileSync(templatePath, `${JSON.stringify(template, null, 2)}\n`);

  return {
    slug,
    templatePath,
    roleCount: roles.length,
    categoryCount: categories.length,
    channelCount: categories.reduce(
      (total, category) => total + category.channels.length,
      0
    )
  };
}
