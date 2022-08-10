import { Client, Collection, IntentsBitField } from 'discord.js';
import { setEventListeners, setInteractionHandlers } from '#handlers/setup.js';
import config from '#src/config.js';
import displayGiveawayResults from '#src/features/giveaway.js';

// TODO: Check circular dependencies with Madge after finishing the project.

// Project's imports hierarchy:
// - built-in node modules
// - external modules
// - types
// - structures
// - utils
// - prisma queries
// - config
// - client

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildWebhooks],
});

(async () => {
    client.interactionHandlers = {
        chatInputCommands: new Collection(),
        buttons: new Map(),
        selectMenus: new Map(),
        modalSubmits: new Map(),
    };

    await setEventListeners(client);
    await setInteractionHandlers(client);

    await client.login(config.environmentVariables.DISCORD_BOT_TOKEN);
})();

export { client as default };
