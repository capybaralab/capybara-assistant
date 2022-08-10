import { GuildMember } from 'discord.js';
import { ButtonHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import config from '#src/config.js';
import getTextByLocale from '#utils/get-locale-message.js';

export default new ButtonHandler({
    customId: 'verify-account',
    options: {},
    execute: async (interaction) => {
        const { member } = interaction as { member: GuildMember };

        if (member.roles.cache.hasAny(config.ids.roles.customer, config.ids.roles.administrator)) {
            await interaction.reply({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description: getTextByLocale(interaction.locale, 'VERIFY_ACCOUNT_REPLY_ALREADY_VERIFIED'),
                    }),
                ],
                ephemeral: true,
            });

            return false;
        }

        await member.roles.add(config.ids.roles.customer);

        await interaction.reply({
            embeds: [
                getInteractionReplyEmbed({
                    theme: 'success',
                    description: getTextByLocale(interaction.locale, 'VERIFY_ACCOUNT_REPLY_SUCCESS'),
                }),
            ],
            ephemeral: true,
        });

        return true;
    },
});
