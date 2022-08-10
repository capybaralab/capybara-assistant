import { ButtonHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import getTextByLocale from '#utils/get-locale-message.js';

export default new ButtonHandler({
    customId: 'translate-message',
    options: {},
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const { client, message, locale } = interaction;

        const translation = client.messageTranslations.get(message.id);

        if (!translation) {
            await interaction.followUp({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description: getTextByLocale(locale, 'MESSAGE_TRANSLATION_REPLY_NOT_FOUND'),
                    }),
                ],
                ephemeral: true,
            });

            return false;
        }

        await interaction.followUp({
            embeds: [
                getInteractionReplyEmbed({
                    theme: 'success',
                    description: translation,
                }),
            ],
            ephemeral: true,
        });

        return true;
    },
});
