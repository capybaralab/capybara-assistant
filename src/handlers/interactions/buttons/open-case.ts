import { EmbedBuilder } from 'discord.js';
import { ButtonHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import getTextByLocale from '#utils/get-locale-message.js';
import { getOpeningResult } from '#src/features/drop.js';

export default new ButtonHandler({
    customId: 'open-case',
    options: {
        cooldownDuration: 1000 * 60 * 1,
    },
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const { client, user, locale } = interaction;
        const userSeed = client.userSeeds.get(user.id);

        if (!userSeed) {
            await interaction.followUp({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description: getTextByLocale(locale, 'OPEN_CASE_REPLY_NO_SEED'),
                    }),
                ],
                ephemeral: true,
            });

            return false;
        }

        const openingResult = getOpeningResult(userSeed);

        await interaction.followUp({
            embeds: [
                new EmbedBuilder({
                    description: Object.entries(openingResult)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n'),
                }),
            ],
            ephemeral: true,
        });

        return true;
    },
});
