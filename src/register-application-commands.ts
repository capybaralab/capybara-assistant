import * as process from 'node:process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { type RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import { ChatInputCommandHandler } from '#structures/interaction-handlers.js';
import getDirectoryContentPaths from '#utils/get-directory-content-paths.js';
import { createLoggerEntry } from '#utils/logger.js';
import config from '#src/config.js';

const getApplicationCommands = async () => {
    const paths = getDirectoryContentPaths(fileURLToPath(new URL('handlers/interactions/chat-input-commands', import.meta.url)));
    const applicationCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    for (const path of paths) {
        const handler = (await import(pathToFileURL(path).href)).default;

        if (!(handler instanceof ChatInputCommandHandler)) {
            continue;
        }

        applicationCommands.push(handler.builder.toJSON());
    }

    return applicationCommands;
};

export const registerApplicationCommands = async () => {
    const rest = new REST({ version: '10' }).setToken(config.environmentVariables.DISCORD_BOT_TOKEN);
    const applicationCommands = await getApplicationCommands();

    if (applicationCommands.length === 0) {
        await createLoggerEntry({
            message: 'No application commands have been found to register.',
        });

        return;
    }

    try {
        if (process.argv.at(-1) === '--global') {
            await rest.put(Routes.applicationCommands(config.environmentVariables.DISCORD_CLIENT_ID), { body: applicationCommands });

            await createLoggerEntry({
                message: 'Global application commands have been successfully registered.',
            });

            return;
        }

        await rest.put(Routes.applicationGuildCommands(config.environmentVariables.DISCORD_CLIENT_ID, config.ids.guild), {
            body: applicationCommands,
        });

        await createLoggerEntry({
            message: 'Guild application commands have been successfully registered.',
        });
    } catch (error) {
        await createLoggerEntry({
            message: 'An error occurred while registering application commands.',
            level: 'error',
            error,
        });
    }
};

await registerApplicationCommands();
