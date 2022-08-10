import dayjs = require('dayjs');
import { scheduleJob } from 'node-schedule';
import EventHandler from '#structures/event-handler.js';
import { getActiveGiveawaysFromDatabase, getMessageTranslationsFromDatabase, getOpenTicketsFromDatabase } from '#src/prisma/queries.js';
import displayGiveawayResults from '#src/features/giveaway.js';
import config from '#src/config.js';

export default new EventHandler<'ready'>({
    name: 'ready',
    isOnce: true,
    execute: async (client) => {
        client.loggerWebhook = await client.fetchWebhook(config.ids.loggerWebhook);

        const openTickets = await getOpenTicketsFromDatabase();
        client.tickets =
            openTickets && openTickets.length > 0 ? new Map(openTickets.map(({ userId, channelId }) => [userId, channelId])) : new Map();

        const messageTranslations = await getMessageTranslationsFromDatabase();
        client.messageTranslations =
            messageTranslations && messageTranslations.length > 0 ? new Map(
                messageTranslations.map(({ messageId, translation }) => [messageId, translation]),
            ) : new Map();

        const activeGiveaways = await getActiveGiveawaysFromDatabase();
        client.giveaways = new Map();

        if (activeGiveaways && activeGiveaways.length > 0) {
            for (const { messageId, ...giveawayData } of activeGiveaways) {
                client.giveaways.set(messageId, giveawayData);

                if (dayjs(giveawayData.endsAt).isBefore(dayjs())) {
                    await displayGiveawayResults(client, messageId);
                    continue;
                }

                scheduleJob(giveawayData.endsAt, async () => {
                    await displayGiveawayResults(client, messageId);
                });
            }
        }
    },
});
