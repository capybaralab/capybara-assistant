import { Snowflake } from 'discord-api-types/v10';
import { createLoggerEntry } from './logger.js';
import client from '#src/index.js';
import config from '#src/config.js';

export const getGuild = async (id: Snowflake = config.ids.guild) => {
    const guild = client.guilds.cache.get(id);

    if (!guild) {
        await createLoggerEntry({
            message: 'Could not find the guild with the given ID.',
            level: 'warning',
            additionalData: { id },
        });
    }

    return guild;
};

export const getChannel = async (id: Snowflake) => {
    const channel = client.channels.cache.get(id);

    if (!channel) {
        await createLoggerEntry({
            message: 'A channel with the given id or desired type (if checked) does not exist.',
            level: 'warning',
            additionalData: { id },
        });
    }

    return channel;
};
