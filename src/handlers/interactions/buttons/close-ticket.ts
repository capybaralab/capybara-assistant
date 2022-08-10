import { GuildTextBasedChannel } from 'discord.js';
import { ButtonHandler } from '#structures/interaction-handlers.js';
import { closeTicketInDatabase } from '#src/prisma/queries.js';
import config from '#src/config.js';

export default new ButtonHandler({
    customId: 'close-ticket',
    options: {
        permissions: {
            roleIds: [...config.ids.superRoles, config.ids.roles.customer],
        },
    },
    execute: async (interaction) => {
        const { client, user } = interaction;
        const { channel } = interaction as { channel: GuildTextBasedChannel };

        client.tickets.delete(user.id);
        await closeTicketInDatabase({ channelId: channel.id });

        await channel.delete();

        return true;
    },
});
