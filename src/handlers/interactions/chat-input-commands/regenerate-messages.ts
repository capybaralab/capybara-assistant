import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildTextBasedChannel,
    Locale,
    MessageOptions,
    SelectMenuBuilder,
    SelectMenuOptionBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { Snowflake } from 'discord-api-types/v10';
import { ChatInputCommandHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import getTextByLocale from '#utils/get-locale-message.js';
import { createMessageTranslationInDatabase } from '#src/prisma/queries.js';
import config, { DEFAULT_EMBED_OPTIONS } from '#src/config.js';

const translationButton = new ButtonBuilder()
    .setEmoji('🇵🇱')
    .setCustomId('translate-message')
    .setStyle(ButtonStyle.Primary);

const ticketCategories = ['UI/UX Design', 'Web Development', 'Discord Bots', 'Other'] as const;

const templates = new Map<Snowflake, { messageOptions: MessageOptions; translation?: string }>([
    [
        config.ids.channels.tickets,
        {
            messageOptions: {
                embeds: [
                    new EmbedBuilder({
                        title: '☎️ Get in touch',
                        description: 'Would you like to get in touch with us? Select the relevant category and fill in the form.',
                        image: { url: config.imageUrls.getInTouchMessage },
                        ...DEFAULT_EMBED_OPTIONS,
                    }),
                ],
                components: [
                    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                        new SelectMenuBuilder({
                            customId: 'select-ticket-category',
                            placeholder: 'Select a category...',
                        }).setOptions(
                            ticketCategories.map((category) => new SelectMenuOptionBuilder({ label: category, value: category })),
                        ),
                    ),
                    new ActionRowBuilder<ButtonBuilder>({
                        components: [translationButton],
                    }),
                ],
            },
            translation: 'Chcesz się z nami skontaktować? Wybierz odpowiednią kategorię i wypełnij formularz.',
        },
    ],
    [
        config.ids.channels.verification,
        {
            messageOptions: {
                embeds: [
                    new EmbedBuilder({
                        title: 'Verification',
                        description: '👋 Hi! Please verify your account by clicking the button below.',
                        image: { url: config.imageUrls.verificationMessage },
                        ...DEFAULT_EMBED_OPTIONS,
                    }),
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder({
                            customId: 'verify-account',
                            label: 'Verify your account',
                            style: ButtonStyle.Success,
                        }),
                        translationButton,
                    ),
                ],
            },
            translation: '👋 Cześć! Zweryfikuj proszę swoje konto klikając poniższy przycisk.',
        },
    ],
]);

export default new ChatInputCommandHandler({
    builder: new SlashCommandBuilder()
        .setName('regenerate-messages')
        .setDescription('Regenerates necessary messages used by the bot on the current channel.')
        .setNameLocalization(Locale.Polish, 'zregeneruj-wiadomości')
        .setDescriptionLocalization(Locale.Polish, 'Regeneruje wymagane wiadomości używane przez bota na bieżącym kanale.'),
    options: {},
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const { locale } = interaction;
        const { channel } = interaction as { channel: GuildTextBasedChannel };

        for (const [channelId, { messageOptions, translation }] of templates) {
            if (channelId === channel.id) {
                const message = await channel.send(messageOptions);

                if (message.pinnable) {
                    await message.pin();
                }

                if (translation) {
                    interaction.client.messageTranslations.set(message.id, translation);
                    await createMessageTranslationInDatabase({ messageId: message.id, translation });
                }

                await interaction.followUp({
                    embeds: [
                        getInteractionReplyEmbed({
                            theme: 'success',
                            description: getTextByLocale(locale, 'MESSAGE_REGENERATE_SUCCESS'),
                        }),
                    ],
                    ephemeral: true,
                });

                return true;
            }
        }

        await interaction.followUp({
            embeds: [
                getInteractionReplyEmbed({
                    theme: 'warning',
                    description: getTextByLocale(locale, 'MESSAGE_REGENERATE_MESSAGE_NOT_FOUND'),
                }),
            ],
            ephemeral: true,
        });

        return false;
    },
});
