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

function resolvePermissions(permissionNames = []) {
  return permissionNames.reduce((bitfield, permissionName) => {
    const resolved = PermissionFlagsBits[permissionName];

    if (!resolved) {
      throw new Error(`Unknown Discord permission: ${permissionName}`);
    }

    return bitfield | resolved;
  }, 0n);
}

function colorForRole(role) {
  if (!role.color) {
    return undefined;
  }

  return role.color;
}

async function ensureRole(guild, roleDefinition) {
  const existing = guild.roles.cache.find(
    (role) => normalizeName(role.name) === normalizeName(roleDefinition.name)
  );

  const permissions = new PermissionsBitField(
    resolvePermissions(roleDefinition.permissions)
  );

  if (existing) {
    await existing.edit({
      color: colorForRole(roleDefinition),
      hoist: roleDefinition.hoist ?? false,
      mentionable: roleDefinition.mentionable ?? false,
      permissions
    });
    return existing;
  }

  return guild.roles.create({
    name: roleDefinition.name,
    color: colorForRole(roleDefinition),
    hoist: roleDefinition.hoist ?? false,
    mentionable: roleDefinition.mentionable ?? false,
    permissions,
    reason: "Admin Bot server template setup"
  });
}

function buildOverwrite(overwrite, guild, rolesByName) {
  const allow = resolvePermissions(overwrite.allow);
  const deny = resolvePermissions(overwrite.deny);

  if (overwrite.target === "@everyone") {
    return {
      id: guild.roles.everyone.id,
      allow,
      deny
    };
  }

  const role = rolesByName.get(normalizeName(overwrite.target));

  if (!role) {
    throw new Error(
      `Permission overwrite references missing role: ${overwrite.target}`
    );
  }

  return {
    id: role.id,
    allow,
    deny
  };
}

async function ensureCategory(guild, categoryDefinition) {
  const existing = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildCategory &&
      normalizeName(channel.name) === normalizeName(categoryDefinition.name)
  );

  if (existing) {
    return existing;
  }

  return guild.channels.create({
    name: categoryDefinition.name,
    type: ChannelType.GuildCategory,
    reason: "Admin Bot server template setup"
  });
}

async function ensureChannel(guild, category, channelDefinition, rolesByName) {
  const desiredType = CHANNEL_TYPES[channelDefinition.type];

  if (!desiredType) {
    throw new Error(`Unsupported channel type: ${channelDefinition.type}`);
  }

  const existing = guild.channels.cache.find(
    (channel) =>
      channel.parentId === category.id &&
      channel.type === desiredType &&
      normalizeName(channel.name) === normalizeName(channelDefinition.name)
  );

  const permissionOverwrites = (channelDefinition.permissions ?? []).map(
    (overwrite) => buildOverwrite(overwrite, guild, rolesByName)
  );

  const payload = {
    name: channelDefinition.name,
    type: desiredType,
    parent: category.id,
    nsfw: channelDefinition.nsfw ?? false,
    permissionOverwrites,
    reason: "Admin Bot server template setup"
  };

  if (
    desiredType === ChannelType.GuildText ||
    desiredType === ChannelType.GuildAnnouncement
  ) {
    payload.topic = channelDefinition.topic;
    payload.rateLimitPerUser = channelDefinition.rateLimitPerUser ?? 0;
  }

  if (existing) {
    await existing.edit(payload);
    return existing;
  }

  return guild.channels.create(payload);
}

export async function applyTemplate(guild, template) {
  await guild.roles.fetch();
  await guild.channels.fetch();

  const rolesByName = new Map();
  const createdRoles = [];
  const createdCategories = [];
  const createdChannels = [];

  for (const roleDefinition of template.roles ?? []) {
    const role = await ensureRole(guild, roleDefinition);
    rolesByName.set(normalizeName(role.name), role);
    createdRoles.push(role.name);
  }

  for (const categoryDefinition of template.categories ?? []) {
    const category = await ensureCategory(guild, categoryDefinition);
    createdCategories.push(category.name);

    for (const channelDefinition of categoryDefinition.channels ?? []) {
      const channel = await ensureChannel(
        guild,
        category,
        channelDefinition,
        rolesByName
      );
      createdChannels.push(`#${channel.name}`);
    }
  }

  return {
    roleCount: createdRoles.length,
    categoryCount: createdCategories.length,
    channelCount: createdChannels.length,
    roles: createdRoles,
    categories: createdCategories,
    channels: createdChannels
  };
}
