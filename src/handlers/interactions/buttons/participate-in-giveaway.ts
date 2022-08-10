import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { ButtonHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import getTextByLocale from '#utils/get-locale-message.js';
import { createGiveawayParticipantsInDatabase } from '#src/prisma/queries.js';

export default new ButtonHandler({
    customId: 'participate-in-giveaway',
    options: {},
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const { message, client, user, locale } = interaction;
        const giveawayData = client.giveaways.get(message.id);

        if (!giveawayData) {
            await interaction.followUp({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description: getTextByLocale(locale, 'PARTICIPATE_IN_GIVEAWAY_REPLY_GIVEAWAY_NOT_FOUND'),
                    }),
                ],
                ephemeral: true,
            });

            return false;
        }

        const { participants } = giveawayData;

        const newParticipantData = {
            userId: user.id,
            minecraftUsername: null,
        };

        if (participants.some(({ userId }) => userId === user.id)) {
            await interaction.followUp({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description: getTextByLocale(locale, 'PARTICIPATE_IN_GIVEAWAY_REPLY_ALREADY_PARTICIPATING'),
                    }),
                ],
                ephemeral: true,
            });

            return false;
        }

        participants.push(newParticipantData);
        await createGiveawayParticipantsInDatabase({ ...newParticipantData, giveaway: { connect: { messageId: message.id } } });

        await interaction.followUp({
            embeds: [
                getInteractionReplyEmbed({
                    theme: 'success',
                    description: getTextByLocale(locale, 'PARTICIPATE_IN_GIVEAWAY_REPLY_SUCCESS'),
                }),
            ],
            ephemeral: true,
        });

        const buttonWithParticipantsAmount = ActionRowBuilder.from(message.components[0]) as ActionRowBuilder<ButtonBuilder>;
        buttonWithParticipantsAmount.components[0].setLabel(`Participate [${participants.length.toString()}]`);

        await message.edit({
            embeds: message.embeds,
            components: [buttonWithParticipantsAmount],
        });

        return true;
    },
});
