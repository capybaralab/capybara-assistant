import {
    ActionRowBuilder,
    bold,
    ButtonBuilder,
    ButtonStyle,
    channelMention,
    EmbedBuilder,
    Guild,
    GuildMember,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { SelectMenuHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import getTextByLocale from '#utils/get-locale-message.js';
import { createTicketInDatabase } from '#src/prisma/queries.js';
import config, { DEFAULT_EMBED_OPTIONS } from '#src/config.js';

export default new SelectMenuHandler({
    customId: 'select-ticket-category',
    options: {
        permissions: {
            roleIds: [...config.ids.superRoles, config.ids.roles.customer],
        },
    },
    execute: async (interaction) => {
        const { client, user, locale } = interaction;
        const { guild } = interaction as { guild: Guild };
        const { member } = interaction as { member: GuildMember };

        if (client.tickets.has(user.id)) {
            await interaction.reply({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description: getTextByLocale(locale, 'TICKET_CREATOR_REPLY_ALREADY_OPEN'),
                    }),
                ],
                ephemeral: true,
            });

            return false;
        }

        await interaction.showModal(
            new ModalBuilder({
                customId: 'ticket-creator',
                title: getTextByLocale(locale, 'TICKET_CREATOR_TITLE'),
                components: [
                    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                        new TextInputBuilder({
                            customId: 'ticket-creator-description',
                            label: getTextByLocale(locale, 'TICKET_CREATOR_LABEL_DESCRIPTION'),
                            style: TextInputStyle.Paragraph,
                            required: true,
                        }).setMaxLength(2000),
                    ),
                    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                        new TextInputBuilder({
                            customId: 'ticket-creator-budget',
                            label: getTextByLocale(locale, 'TICKET_CREATOR_LABEL_BUDGET'),
                            placeholder: getTextByLocale(locale, 'TICKET_CREATOR_PLACEHOLDER_BUDGET'),
                            style: TextInputStyle.Short,
                            required: true,
                        }).setMaxLength(40),
                    ),
                ],
            }),
        );

        const ticketCreatorSubmission = await interaction.awaitModalSubmit({
            filter: (modalInteraction) => modalInteraction.customId === 'ticket-creator' && modalInteraction.user.id === user.id,
            time: 60_000 * 10,
        });

        await ticketCreatorSubmission.deferReply({ ephemeral: true });

        const ticketDescription = ticketCreatorSubmission.fields.getTextInputValue('ticket-creator-description');
        const ticketBudget = ticketCreatorSubmission.fields.getTextInputValue('ticket-creator-budget');

        // if (ticketDescription.length > 200 || ticketBudget.length > 200) {
        //     await interaction.followUp({
        //         content: 'Chuj ci w dupę nygusie',
        //         ephemeral: true,
        //     })
        //
        //     return false;
        // }

        const ticketChannel = await guild.channels.create({
            name: member.displayName,
            parent: config.ids.categories.tickets,
            permissionOverwrites: [{ id: member.id, allow: PermissionFlagsBits.ViewChannel }],
        });

        await ticketChannel.send({
            embeds: [
                new EmbedBuilder({
                    title: getTextByLocale(locale, 'TICKET_TITLE'),
                    description: `${(getTextByLocale(locale, 'TICKET_DESCRIPTION'))}
                    \n${bold(getTextByLocale(locale, 'TICKET_FIELD_DESCRIPTION'))}\n${ticketDescription}\n
                    ${bold(getTextByLocale(locale, 'TICKET_FIELD_BUDGET'))}\n${
                        ticketBudget === '' ? getTextByLocale(locale, 'TICKET_FIELD_BUDGET_UNKNOWN') : ticketBudget
                    }\n\n${bold(getTextByLocale(locale, 'TICKET_FIELD_CATEGORY'))}\n${interaction.values[0]}`,
                    ...DEFAULT_EMBED_OPTIONS,
                }),
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setEmoji('🔒')
                        .setLabel(getTextByLocale(locale, 'TICKET_BUTTON_CLOSE'))
                        .setCustomId('close-ticket')
                        .setStyle(ButtonStyle.Secondary),
                ),
            ],
        });

        client.tickets.set(user.id, ticketChannel.id);
        await createTicketInDatabase({ userId: user.id, channelId: ticketChannel.id });

        await ticketCreatorSubmission.followUp({
            embeds: [
                getInteractionReplyEmbed({
                    theme: 'success',
                    description: `${getTextByLocale(locale, 'TICKET_CREATOR_REPLY_SUCCESS')}\n${channelMention(ticketChannel.id)}`,
                }),
            ],
            ephemeral: true,
        });

        return true;
    },
});
