import EventHandler from '#structures/event-handler.js';
import { closeGiveawayInDatabase } from '#src/prisma/queries.js';

export default new EventHandler<'messageDelete'>({
    name: 'messageDelete',
    execute: async (message) => {
        const { client } = message;

        for (const id of Object.keys(client.giveaways)) {
            if (id === message.id) {
                client.giveaways.delete(id);
                await closeGiveawayInDatabase(id);
            }
        }
    },
});
