import { pino, stdSerializers } from 'pino';
import type { APIEmbedField, Client } from 'discord.js';
import { getLoggerEntryEmbed } from './embeds.js';

export interface LoggerEntry {
    readonly message: string;
    readonly level?: LoggerLevel;
    readonly additionalData?: LoggerEntryAdditionalData;
    readonly error?: unknown;
    readonly client?: Client;
    readonly embedMessage?: string;
    readonly embedAdditionalData?: APIEmbedField[];
}

export type LoggerLevel = 'notification' | 'warning' | 'error';

export type LoggerEntryAdditionalData = Readonly<Record<string, string | number>>;

const loggerLevels: Record<LoggerLevel, Readonly<number>> = {
    notification: 10,
    warning: 20,
    error: 30,
};

const logger = pino({
    customLevels: loggerLevels,
    level: 'notification',
    useOnlyCustomLevels: true,
    serializers: {
        error: stdSerializers.err,
    },
});

export const createLoggerEntry = async (
    { message, level = 'notification', additionalData, error, client, embedMessage, embedAdditionalData }: LoggerEntry,
) => {
    logger[level](error ? { error, ...additionalData } : additionalData || {}, message);

    if (!client?.isReady()) {
        return;
    }

    const loggerWebhook = client.loggerWebhook;

    if (!loggerWebhook) {
        await createLoggerEntry({
            message: 'The logger webhook does not exist.',
            level: 'warning',
        });

        return;
    }

    try {
        await loggerWebhook.send({
            embeds: [
                getLoggerEntryEmbed({
                    level,
                    description: embedMessage || message,
                    additionalData: embedAdditionalData || additionalData,
                }),
            ],
        });
    } catch (error) {
        await createLoggerEntry({
            message: 'An error occurred while sending a logger entry through the logger webhook.',
            level: 'error',
            error,
        });
    }
};
