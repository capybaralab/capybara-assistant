import type { Collection, Webhook } from 'discord.js';
import type { Snowflake } from 'discord-api-types/v10';
import type { Giveaways, GiveawayParticipants } from '@prisma/client';
import type { ButtonHandler, ChatInputCommandHandler, ModalSubmitHandler, SelectMenuHandler } from '#structures/interaction-handlers.js';

declare module 'discord.js' {
    interface Client {
        loggerWebhook?: Webhook;
        tickets: Map<Snowflake, Snowflake>;
        messageTranslations: Map<Snowflake, string>;
        giveaways: Map<
            Snowflake,
            Omit<Giveaways, 'messageId' | 'prize' | 'isActive'> & { participants: Omit<GiveawayParticipants, 'id' | 'giveawayId'>[] }
        >;
        cooldowns: Map<Snowflake, Map<Snowflake, Date>>;
        userSeeds: Map<Snowflake, string>;
        interactionHandlers: {
            chatInputCommands: Collection<Snowflake, ChatInputCommandHandler>;
            buttons: Map<Snowflake, ButtonHandler>;
            selectMenus: Map<Snowflake, SelectMenuHandler>;
            modalSubmits: Map<Snowflake, ModalSubmitHandler>;
        };
    }
}
