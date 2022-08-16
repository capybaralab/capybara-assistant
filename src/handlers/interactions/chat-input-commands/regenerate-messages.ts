import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle, codeBlock,
    EmbedBuilder,
    GuildTextBasedChannel,
    Locale,
    MessageOptions, roleMention,
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
    [
        config.ids.channels.drops,
        {
            messageOptions: {
                embeds: [
                    new EmbedBuilder({
                        title: 'Case opening',
                        description:
                            '🎁 You have a new case to open! Please click the button below to open it.\n\nIf you wish to change your seed, use `/set-seed` command.',
                        image: { url: config.imageUrls.openingMessage },
                        ...DEFAULT_EMBED_OPTIONS,
                    }),
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>({
                        components: [
                            new ButtonBuilder({
                                customId: 'open-case',
                                label: 'Open case',
                                style: ButtonStyle.Success,
                            }),
                            translationButton,
                        ],
                    }),
                ],
            },
            translation:
                '🎁 Masz nową skrzynkę do otwarcia! Kliknij poniższy przycisk, aby ją otworzyć.\n\nJeżeli chcesz zmienić swój seed, użyj polecenia `/set-seed`.',
        },
    ],
    [
        config.ids.channels.rules,
        {
            messageOptions: {
                embeds: [
                    new EmbedBuilder({
                        title: 'Rules',
                        description: `By participating in chat, you're expected to follow the rules below.\n\nPlease feel free to report anybody to ${roleMention(config.ids.roles.administrator)} or the ${roleMention(config.ids.roles.helper)} who you think is breaking them and we'll respond swiftly and sternly.\n\n${codeBlock('1) Be friendly and patient. Do not spam the server for help.\n\n2) Be welcoming. We strive to be a community that welcomes and supports people of all backgrounds and identities.\n\n3) Be respectful. You can disagree, but this cannot be allowed to turn into a personal attack.\n\n4) Be careful about your wording. No leaking of personal information, no harassment, no accusations. Reports should be made in private, to staff, not in public channels.\n\n5) Be courteous of people\'s time and space.\n\n6) Do not impersonate developers, moderators or other users.\n\n7) These rules may vary at any time. We reserve the right to warn and ban users discretionally.\n\n8) Please follow the Discord ToS and Community Guidelines.')}`,
                    ...DEFAULT_EMBED_OPTIONS,})
                ]
            }
        }
    ]
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
