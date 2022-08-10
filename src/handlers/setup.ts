import { fileURLToPath, pathToFileURL } from 'node:url';
import { type Client, Events } from 'discord.js';
import EventHandler from '../structures/event-handler.js';
import {
    ButtonHandler,
    ChatInputCommandHandler,
    InteractionHandler,
    ModalSubmitHandler,
    SelectMenuHandler,
} from '../structures/interaction-handlers.js';
import getDirectoryContentPaths from '../utils/get-directory-content-paths.js';
import { createLoggerEntry } from '../utils/logger.js';

export const setEventListeners = async (client: Client) => {
    const paths = getDirectoryContentPaths(fileURLToPath(new URL('events', import.meta.url)));

    for (const path of paths) {
        const handler = (await import(pathToFileURL(path).href)).default;

        if (!(handler instanceof EventHandler)) {
            await createLoggerEntry({
                message: "The file with the given path does not export a proper 'EventHandler' structure by default.",
                level: 'warning',
                additionalData: { path },
            });

            continue;
        }

        const { name, isOnce, execute } = handler;

        if (Object.values(Events).includes(name)) {
            client[isOnce ? 'once' : 'on'](name, (executeArgument) => execute(executeArgument));

            await createLoggerEntry({
                message: `The listener for the client event named '${name}' has been successfully bound to the client.`,
            });

            continue;
        }

        client.rest[isOnce ? 'once' : 'on'](name, (executeArgument) => execute(executeArgument));

        await createLoggerEntry({
            message: `The listener for the REST event named '${name}' has been successfully bound to the client.`,
        });
    }
};

export const setInteractionHandlers = async ({ interactionHandlers }: Client) => {
    const paths = getDirectoryContentPaths(fileURLToPath(new URL('interactions', import.meta.url)));

    for (const path of paths) {
        const handler = (await import(pathToFileURL(path).href)).default;

        if (!(handler instanceof InteractionHandler)) {
            await createLoggerEntry({
                message: "The file with the given path does not export a proper 'InteractionHandler' structure by default.",
                level: 'warning',
                additionalData: { path },
            });

            continue;
        }

        if (handler instanceof ChatInputCommandHandler) {
            interactionHandlers.chatInputCommands.set(handler.builder.name, handler);
            continue;
        }

        if (handler instanceof ButtonHandler) {
            interactionHandlers.buttons.set(handler.customId, handler);
            continue;
        }

        if (handler instanceof SelectMenuHandler) {
            interactionHandlers.selectMenus.set(handler.customId, handler);
            continue;
        }

        if (handler instanceof ModalSubmitHandler) {
            interactionHandlers.modalSubmits.set(handler.customId, handler);
        }
    }
};
