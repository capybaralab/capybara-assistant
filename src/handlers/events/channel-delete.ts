import EventHandler from '#structures/event-handler.js';
import { closeTicketInDatabase } from '#src/prisma/queries.js';

export default new EventHandler<'channelDelete'>({
    name: 'channelDelete',
    execute: async (channel) => {
        for (const [userId, channelId] of channel.client.tickets) {
            if (channelId === channel.id) {
                channel.client.tickets.delete(userId);
                await closeTicketInDatabase({ channelId: channel.id });
            }
        }
    },
});
