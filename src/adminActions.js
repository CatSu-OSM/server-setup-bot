import {
  ChannelType,
  PermissionFlagsBits,
  PermissionsBitField
} from "discord.js";

const CHANNEL_TYPES = {
  text: ChannelType.GuildText,
  voice: ChannelType.GuildVoice,
  forum: ChannelType.GuildForum,
  stage: ChannelType.GuildStageVoice,
  announcement: ChannelType.GuildAnnouncement
};

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function resolvePermissionName(name) {
  const key = Object.keys(PermissionFlagsBits).find(
    (permissionName) => permissionName.toLowerCase() === name.toLowerCase()
  );

  if (!key) {
    throw new Error(`Unknown Discord permission: ${name}`);
  }

  return key;
}

export function parsePermissionList(raw) {
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(resolvePermissionName);
}

function resolvePermissions(permissionNames = []) {
  return permissionNames.reduce((bitfield, permissionName) => {
    const resolved = PermissionFlagsBits[permissionName];
    return bitfield | resolved;
  }, 0n);
}

export function parseColor(raw) {
  if (!raw?.trim()) {
    return undefined;
  }

  const value = raw.trim();

  if (!/^#?[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error("Role color must be a 6-digit hex code like #ff6600.");
  }

  return value.startsWith("#") ? value : `#${value}`;
}

export async function createOrUpdateRole(guild, options) {
  await guild.roles.fetch();

  const existing = guild.roles.cache.find(
    (role) => normalizeName(role.name) === normalizeName(options.name)
  );

  const permissions = new PermissionsBitField(
    resolvePermissions(options.permissions)
  );

  const payload = {
    name: options.name,
    colors: options.color ? { primaryColor: options.color } : undefined,
    hoist: options.hoist ?? false,
    mentionable: options.mentionable ?? false,
    permissions
  };

  if (existing) {
    if (!existing.editable) {
      return { role: existing, created: false, skipped: true };
    }

    await existing.edit(payload);
    return { role: existing, created: false, skipped: false };
  }

  const role = await guild.roles.create({
    ...payload,
    reason: "Admin Bot direct role setup"
  });

  return { role, created: true, skipped: false };
}

export async function createOrUpdateCategory(guild, name) {
  await guild.channels.fetch();

  const existing = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildCategory &&
      normalizeName(channel.name) === normalizeName(name)
  );

  if (existing) {
    return { category: existing, created: false };
  }

  const category = await guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    reason: "Admin Bot direct category setup"
  });

  return { category, created: true };
}

function buildChannelPayload(type, name, categoryId, topic) {
  const payload = {
    name,
    type,
    reason: "Admin Bot direct channel setup"
  };

  if (categoryId) {
    payload.parent = categoryId;
  }

  if (type === ChannelType.GuildText || type === ChannelType.GuildAnnouncement) {
    payload.topic = topic ?? undefined;
  }

  return payload;
}

export async function createOrUpdateChannel(guild, options) {
  await guild.channels.fetch();

  const type = CHANNEL_TYPES[options.type];

  if (type === undefined) {
    throw new Error(`Unsupported channel type: ${options.type}`);
  }

  let categoryId;

  if (options.categoryName) {
    const category = guild.channels.cache.find(
      (channel) =>
        channel.type === ChannelType.GuildCategory &&
        normalizeName(channel.name) === normalizeName(options.categoryName)
    );

    if (!category) {
      throw new Error(`Category not found: ${options.categoryName}`);
    }

    categoryId = category.id;
  }

  const existing = guild.channels.cache.find(
    (channel) =>
      channel.type === type &&
      normalizeName(channel.name) === normalizeName(options.name)
  );

  const payload = buildChannelPayload(
    type,
    options.name,
    categoryId,
    options.topic
  );

  if (existing) {
    await existing.edit(payload);
    return { channel: existing, created: false };
  }

  const channel = await guild.channels.create(payload);
  return { channel, created: true };
}

export async function updateChannelRolePermissions(guild, options) {
  await guild.channels.fetch();
  await guild.roles.fetch();

  const channel = guild.channels.cache.find(
    (entry) => normalizeName(entry.name) === normalizeName(options.channelName)
  );

  if (!channel) {
    throw new Error(`Channel not found: ${options.channelName}`);
  }

  const role =
    options.roleName === "@everyone"
      ? guild.roles.everyone
      : guild.roles.cache.find(
          (entry) => normalizeName(entry.name) === normalizeName(options.roleName)
        );

  if (!role) {
    throw new Error(`Role not found: ${options.roleName}`);
  }

  await channel.permissionOverwrites.edit(role.id, {
    ViewChannel: options.viewChannel,
    SendMessages: options.sendMessages,
    Connect: options.connect,
    Speak: options.speak,
    ReadMessageHistory: options.readMessageHistory
  });

  return { channel, role };
}
