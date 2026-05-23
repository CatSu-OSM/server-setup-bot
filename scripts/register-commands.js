import { REST, Routes } from "discord.js";
import { config } from "../src/config.js";
import { buildCommands } from "../src/commands.js";

const rest = new REST({ version: "10" }).setToken(config.botToken);
const commands = buildCommands();

async function main() {
  if (config.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );

    console.log(`Registered ${commands.length} guild command(s).`);
    return;
  }

  await rest.put(Routes.applicationCommands(config.clientId), {
    body: commands
  });

  console.log(`Registered ${commands.length} global command(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
