import {
    ActionRowBuilder,
    ButtonBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { ButtonHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import getTextByLocale from '#utils/get-locale-message.js';
import { createGiveawayParticipantsInDatabase } from '#src/prisma/queries.js';

export default new ButtonHandler({
    customId: 'participate-in-minecraft-giveaway',
    options: {},
    execute: async (interaction) => {
        const { message, client, user, locale } = interaction;
        const giveawayData = client.giveaways.get(message.id);

        if (!giveawayData) {
            await interaction.reply({
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

        await interaction.showModal(
            new ModalBuilder({
                customId: 'provide-minecraft-username',
                title: getTextByLocale(locale, 'PARTICIPATE_IN_MINECRAFT_GIVEAWAY_MODAL_TITLE'),
                components: [
                    new ActionRowBuilder<ModalActionRowComponentBuilder>({
                        components: [
                            new TextInputBuilder({
                                customId: 'minecraft-username',
                                label: getTextByLocale(locale, 'PARTICIPATE_IN_MINECRAFT_GIVEAWAY_MODAL_TITLE'),
                                style: TextInputStyle.Short,
                                required: true,
                            }).setMaxLength(30),
                        ],
                    }),
                ],
            }),
        );

        const minecraftUsernameSubmission = await interaction.awaitModalSubmit({
            filter: (modalInteraction) =>
                modalInteraction.customId === 'provide-minecraft-username' && modalInteraction.user.id === user.id,
            time: 60_000 * 10,
        });

        await minecraftUsernameSubmission.deferReply({ ephemeral: true });

        if (!client.giveaways.has(message.id)) {
            await minecraftUsernameSubmission.followUp({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description: getTextByLocale(locale, 'PARTICIPATE_IN_MINECRAFT_GIVEAWAY_REPLY_ALREADY_ENDED'),
                    }),
                ],
                ephemeral: true,
            });

            return false;
        }

        const newParticipantData = {
            userId: user.id,
            minecraftUsername: minecraftUsernameSubmission.fields.getTextInputValue('minecraft-username'),
        };

        if (
            participants.some(
                ({ userId, minecraftUsername }) => userId === user.id || minecraftUsername === newParticipantData.minecraftUsername,
            )
        ) {
            await minecraftUsernameSubmission.followUp({
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

        await minecraftUsernameSubmission.followUp({
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
// import {
//     ActionRowBuilder,
//     ButtonBuilder,
//     ModalActionRowComponentBuilder,
//     ModalBuilder,
//     TextInputBuilder,
//     TextInputStyle,
// } from 'discord.js';
// import { ButtonHandler } from '#structures/interaction-handlers.js';
// import { getInteractionReplyEmbed } from '#utils/embeds.js';
// import { updateGiveawayParticipantsInDatabase } from '#src/prisma/queries.js';
//
// export default new ButtonHandler({
//     customId: 'minecraft-giveaway-participation',
//     options: {},
//     execute: async (interaction) => {
//         const { message, client, user, locale } = interaction;
//         const giveawayMap = client.giveaways.get(message.id);
//
//         if (!giveawayMap) {
//             await interaction.reply({
//                 embeds: [
//                     getInteractionReplyEmbed({
//                         theme: 'warning',
//                         description:
//                             locale === 'pl' ? 'Podany konkurs nie został zarejestrowany.' : 'The given giveaway has not been registered.',
//                     }),
//                 ],
//                 ephemeral: true,
//             });
//
//             return false;
//         }
//
//         if (giveawayMap.participants.includes(user.id)) {
//             await interaction.reply({
//                 embeds: [
//                     getInteractionReplyEmbed({
//                         theme: 'warning',
//                         description:
//                             locale === 'pl' ? 'Już jesteś uczestnikiem tego konkursu.' : 'You are already a participant of this giveaway.',
//                     }),
//                 ],
//                 ephemeral: true,
//             });
//
//             return false;
//         }
//
//         const minecraftUsernameForm = new ModalBuilder()
//             .setTitle(locale === 'pl' ? 'Zgłoszenie do konkursu' : 'Giveaway participation form')
//             .setCustomId('minecraft-username-form')
//             .addComponents(
//                 new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
//                     new TextInputBuilder()
//                         .setLabel(locale === 'pl' ? 'Nazwa użytkownika Minecraft' : 'Minecraft username')
//                         .setCustomId('minecraft-username-input')
//                         .setStyle(TextInputStyle.Short)
//                         .setRequired(true),
//                 ),
//             );
//
//         await interaction.showModal(minecraftUsernameForm);
//         const modalSubmit = await interaction.awaitModalSubmit({
//             filter: (modal) => modal.customId === 'minecraft-username-form' && modal.user.id === user.id,
//             time: 60_000 * 10,
//         });
//
//         const minecraftUsername = modalSubmit.fields.getTextInputValue('minecraft-username-input');
//
//         if (giveawayMap.minecraftUsernames.includes(minecraftUsername)) {
//             await modalSubmit.reply({
//                 embeds: [
//                     getInteractionReplyEmbed({
//                         theme: 'warning',
//                         description:
//                             locale === 'pl' ? 'Wprowadzona nazwa użytkownika jest już zapisana w tym konkursie.' : 'Given username is already registered in this giveaway.',
//                     }),
//                 ],
//                 ephemeral: true,
//             });
//
//             return false;
//         }
//
//         giveawayMap.participants.push(user.id);
//         giveawayMap.minecraftUsernames.push(minecraftUsername);
//         await updateGiveawayParticipantsInDatabase(message.id, giveawayMap.participants, giveawayMap.minecraftUsernames);
//
//         await modalSubmit.reply({
//             embeds: [
//                 getInteractionReplyEmbed({
//                     theme: 'success',
//                     description: locale === 'pl' ? 'Pomyślnie zarejestrowano w konkursie.' : 'You are now a participant of this giveaway.',
//                 }),
//             ],
//             ephemeral: true,
//         });
//
//         const newActionRow = ActionRowBuilder.from(message.components[0]) as ActionRowBuilder<ButtonBuilder>;
//         newActionRow.components[0].setLabel(`Participate [#${giveawayMap.participants.length.toString()}]`);
//
//         await message.edit({
//             embeds: message.embeds,
//             components: [newActionRow],
//         });
//
//         return true;
//     },
// });
