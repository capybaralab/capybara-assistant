import * as process from 'node:process';
import { resolveColor } from 'discord.js';
import { Snowflake } from 'discord-api-types/v10';
import { createLoggerEntry } from '#utils/logger.js';

interface Config {
    readonly environmentVariables: EnvironmentVariables;
    readonly ids: {
        readonly guild: Snowflake;
        readonly loggerWebhook: Snowflake;
        readonly superUsers: Snowflake[];
        readonly superRoles: Snowflake[];
        readonly channels: {
            [Channel in typeof channels[number]]: Snowflake;
        };
        readonly roles: {
            [Role in typeof roles[number]]: Snowflake;
        };
        readonly categories: {
            [Category in typeof categories[number]]: Snowflake;
        };
    };
    readonly colors: {
        [Color in typeof colors[number]]: number;
    };
    readonly imageUrls: {
        [Image in typeof imageUrls[number]]: string;
    };
}

type EnvironmentVariables = {
    DISCORD_BOT_TOKEN: string;
    DISCORD_CLIENT_ID: string;
    DATABASE_URL: string;
};

const channels = ['logs', 'verification', 'tickets', 'ticketArchives', 'giveaways'] as const;
const roles = ['customer', 'administrator'] as const;
const categories = ['tickets'] as const;
const colors = ['default'] as const;
const imageUrls = ['verificationMessage', 'getInTouchMessage', 'giveawayMessage'] as const;

const getEnvironmentVariables = async (keys: (keyof EnvironmentVariables)[]) => {
    const environmentVariables = {} as EnvironmentVariables;

    for (const key of keys) {
        const value = process.env[key];

        if (typeof value === 'undefined') {
            throw new Error(`The environment variable '${key}' is undefined.`);
        }

        environmentVariables[key] = value;
    }

    await createLoggerEntry({
        message: 'Successfully loaded necessary environment variables.',
        additionalData: { keys: keys.join(', ') },
    });

    return environmentVariables;
};

const config: Config = {
    environmentVariables: await getEnvironmentVariables(['DISCORD_BOT_TOKEN', 'DISCORD_CLIENT_ID', 'DATABASE_URL']),
    ids: {
        guild: '1004842165542858942',
        loggerWebhook: '1005124119106437271',
        superUsers: [],
        superRoles: ['1004856417263570944'],
        channels: {
            logs: '1004863900749152306',
            verification: '1004871162599317716',
            tickets: '1004865067071832125',
            ticketArchives: '1005190051250057317',
            giveaways: '1005499464364077236',
        },
        roles: {
            customer: '1005114579694661703',
            administrator: '1004856417263570944',
        },
        categories: {
            tickets: '1005149505760546856',
        },
    },
    colors: {
        default: resolveColor('#ffc1e5'),
    },
    imageUrls: {
        verificationMessage:
            'https://images-ext-1.discordapp.net/external/hkWErLKkfikTLIr5j_gNMjAjKlNOn3JXzgT5SpLt-go/https/i.imgur.com/SsoVZiL.png',
        getInTouchMessage:
            'https://images-ext-1.discordapp.net/external/vmH6ZyxWJZS13US1IDzzZif3-9HM4bjsoUZvOHMOlAU/https/i.imgur.com/33obrSn.png',
        giveawayMessage: 'https://cdn.discordapp.com/attachments/1005121223111487599/1006265732901896192/giveaway.png',
    },
};

export const DEFAULT_EMBED_OPTIONS = {
    color: config.colors.default,
    footer: { text: 'capybaralab.com' },
};

export default config;
