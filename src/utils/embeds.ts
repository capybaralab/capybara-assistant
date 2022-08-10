import { type APIEmbedField, type ColorResolvable, Colors, EmbedBuilder, resolveColor } from 'discord.js';
import type { LoggerEntryAdditionalData, LoggerLevel } from './logger.js';

type EmbedTheme = LoggerLevel | 'success';

type EmbedThemeOptions = {
    readonly title: string;
    readonly color: ColorResolvable;
};

const themes: Record<EmbedTheme, EmbedThemeOptions> = {
    notification: {
        title: 'Powiadomienie!',
        color: Colors.Blurple,
    },
    success: {
        title: 'Sukces!',
        color: Colors.Green,
    },
    warning: {
        title: 'Ostrzeżenie!',
        color: Colors.Orange,
    },
    error: {
        title: 'Błąd!',
        color: Colors.Red,
    },
};

export const getInteractionReplyEmbed = (
    { theme, title, description, color }: {
        theme?: EmbedTheme;
        title?: string;
        description: string;
        color?: ColorResolvable;
    },
) =>
    theme ? new EmbedBuilder({
        title: themes[theme].title,
        color: resolveColor(themes[theme].color),
        description,
    }) : new EmbedBuilder({
        title,
        description,
        color: color && resolveColor(color),
    });

export const getLoggerEntryEmbed = (
    { level = 'notification', description, additionalData }: {
        level: LoggerLevel;
        description: string;
        additionalData?: LoggerEntryAdditionalData | APIEmbedField[];
    },
) =>
    new EmbedBuilder({
        title: themes[level].title,
        color: resolveColor(themes[level].color),
        description,
        fields: Array.isArray(additionalData) ? additionalData : additionalData && Object.entries(additionalData).map(
            ([name, value]) => ({ name, value: typeof value !== 'string' ? value.toString() : value }),
        ),
    });
