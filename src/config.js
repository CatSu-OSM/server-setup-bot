import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const config = {
  botToken: required("BOT_TOKEN"),
  clientId: required("CLIENT_ID"),
  guildId: process.env.GUILD_ID ?? null
};
