import { Locale, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommandHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import getTextByLocale from '#utils/get-locale-message.js';
import { setUserSeedInDatabase } from '#src/prisma/queries.js';

export default new ChatInputCommandHandler({
    builder: new SlashCommandBuilder()
        .setName('set-seed')
        .setDescription('Sets the opening seed for the current user.')
        .setNameLocalization(Locale.Polish, 'ustaw-seed')
        .setDescriptionLocalization(Locale.Polish, 'Ustawia seed dla bieżącego użytkownika.')
        .addStringOption((option) => option.setName('seed').setDescription('Your seed.').setMinLength(2).setMaxLength(8).setRequired(true)),
    options: {},
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const { options, user, locale } = interaction;

        const seed = options.getString('seed')!;

        if (!(await setUserSeedInDatabase({ userId: user.id, seed }))) {
            throw new Error('Failed to set seed in database.');
        }

        await interaction.followUp({
            embeds: [
                getInteractionReplyEmbed({
                    theme: 'success',
                    description: getTextByLocale(locale, 'SET_SEED_SUCCESS'),
                }),
            ],
            ephemeral: true,
        });

        return true;
    },
});
