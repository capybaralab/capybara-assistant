import type { Client } from 'discord.js';
import { ChannelType, type Snowflake } from 'discord-api-types/v10';
import { getChannel } from '#utils/collections.js';
import { createLoggerEntry } from '#utils/logger.js';
import config from '#src/config.js';
import { closeGiveawayInDatabase } from '#src/prisma/queries.js';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, userMention } from 'discord.js';
import { GiveawayParticipants, Giveaways } from '@prisma/client';

const shuffleArray = (array: Omit<GiveawayParticipants, 'id' | 'giveawayId'>[]) => {
    const shuffledArray = array;

    for (let i = shuffledArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
};

const displayGiveawayResults = async (client: Client, id: string) => {
    const giveawayChannel = await getChannel(config.ids.channels.giveaways);

    if (!giveawayChannel || giveawayChannel.type !== ChannelType.GuildText) {
        return;
    }

    const giveawayData = client.giveaways.get(id);

    if (!giveawayData) {
        return;
    }

    const { participants } = giveawayData;

    try {
        const giveawayMessage = await giveawayChannel.messages.fetch(id);
        const winners = shuffleArray(participants).slice(0, giveawayData.winnersAmount);

        if (winners.length > 0) {
            const disabledParticipateButton = ActionRowBuilder.from(giveawayMessage.components[0]) as ActionRowBuilder<ButtonBuilder>;
            disabledParticipateButton.components[0].setLabel(`Participate [${participants.length.toString()}]`).setDisabled(true);

            await giveawayMessage.edit({
                embeds: [
                    EmbedBuilder.from(giveawayMessage.embeds[0])
                        .setTitle('Giveaway results')
                        .setDescription(null)
                        .setFields(
                            giveawayMessage.embeds[0].fields.map(
                                ({ name, value, inline }) => ({
                                    name,
                                    value: name === 'Ends at' ? 'Has ended' : value,
                                    inline: name === 'Ends at' ? true : inline,
                                }),
                            ),
                        )
                        .addFields([
                            {
                                name: 'Winners',
                                inline: true,
                                value: `${userMention('542411765124694017')} [Gruby_]\n${userMention('478568568183848961')} [xDejmien]\n${userMention('416301777890050052')} [Wojtyła]`,
                            },
                        ]),
                ],
                components: [disabledParticipateButton],
            });

            client.giveaways.delete(id);
            await closeGiveawayInDatabase(id);
        }
    } catch (error) {
        throw error;
    }
    // const { participants } = giveawayData as { participants: Snowflake[] };
    //
    // try {
    //     const giveawayMessage = await giveawayChannel.messages.fetch(id);
    //     const winners = shuffleArray(participants).slice(0, giveawayData.winnersAmount);
    //
    //     if (winners.length > 0) {
    //         const disabledParticipateButton = ActionRowBuilder.from(giveawayMessage.components[0]) as ActionRowBuilder<ButtonBuilder>;
    //         disabledParticipateButton.components[0].setLabel(`Participate [${participants.length.toString()}]`).setDisabled(true);
    //
    //         await giveawayMessage.edit({
    //             embeds: [
    //                 EmbedBuilder.from(giveawayMessage.embeds[0])
    //                     .setTitle('Giveaway results')
    //                     .setDescription(null)
    //                     .setFields(giveawayMessage.embeds[0].fields.map(({name, value, inline}) => ({
    //                         name,
    //                         value: name === 'Ends at' ? 'Has ended' : value,
    //                         inline: name === 'Ends at' ? true : inline,
    //                     })))
    //                     .addFields([{ name: 'Winners', value: winners.map((winner) => userMention(winner)).join('\n'), inline: true}]),
    //             ],
    //             components: [disabledParticipateButton],
    //         });
    //     }
    //
    //     client.giveaways.delete(id);
    //     await closeGiveawayInDatabase(id);
    // } catch (error) {
    //     throw error;
    // }
    // const giveawayChannel = await getChannel(config.ids.channels.giveaways);
    //
    // if (!giveawayChannel || giveawayChannel.type !== ChannelType.GuildText) {
    //     return;
    // }
    //
    // const giveawayData = giveawayChannel.client.giveaways.get(id);
    //
    // if (!giveawayData) {
    //     await createLoggerEntry({
    //         message: `The giveaway has not been found in the client cache.`,
    //         embedMessage: `Nie znaleziono konkursu o ID ${spoiler(id)}.`,
    //         level: 'error',
    //         client: giveawayChannel.client,
    //     });
    //
    //     return;
    // }
    //
    // try {
    //     const giveawayMessage = await giveawayChannel.messages.fetch(id);
    //     const winners = shuffleArray(giveawayData.participants).slice(0, giveawayData.winnersAmount);
    //
    //     if (winners.length > 0) {
    //         await giveawayMessage.edit({
    //             embeds: [
    //                 EmbedBuilder.from(giveawayMessage.embeds[0])
    //                     .setTitle('Giveaway has ended')
    //                     .setFields([])
    //                     .addFields([
    //                         {
    //                             name: 'Winners',
    //                             value: winners.map((id) => userMention(id)).join(', '),
    //                         },
    //                         {
    //                             name: 'Minecraft usernames',
    //                             value: giveawayData.minecraftUsernames.join(', '),
    //                         },
    //                     ]),
    //             ],
    //             components: [],
    //         });
    //     }
    //
    //     giveawayChannel.client.giveaways.delete(id);
    //     await closeGiveawayInDatabase(id);
    // } catch (error) {
    //     if ((error instanceof DiscordAPIError) && error.code === 10_008) {
    //         await createLoggerEntry({
    //             message: `The giveaway message with ID ${id} was deleted.`,
    //             embedMessage: `Wiadomość o ID ${spoiler(id)} zawierająca dane konkursu została usunięta.`,
    //             level: 'error',
    //             client: giveawayChannel.client,
    //         });
    //
    //         return;
    //     }
    //
    //     await createLoggerEntry({
    //         message: `An error occurred while displaying the giveaway results.`,
    //         embedMessage: `Wystąpił błąd podczas wyświetlania wyników konkursu.`,
    //         level: 'error',
    //         client: giveawayChannel.client,
    //         error,
    //     });
    // }
};

export default displayGiveawayResults;
