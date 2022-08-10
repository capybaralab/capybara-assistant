import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildTextBasedChannel,
    Locale,
    resolveColor,
    roleMention,
    SlashCommandBuilder,
    time,
} from 'discord.js';
import { scheduleJob } from 'node-schedule';
import dayjs from 'dayjs';
import dayjsTimezone from 'dayjs/plugin/timezone.js';
import dayjsIsSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import dayjsCustomParseFormat from 'dayjs/plugin/customParseFormat.js';
import dayjsUtc from 'dayjs/plugin/utc.js';
import { ChatInputCommandHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import getTextByLocale from '#utils/get-locale-message.js';
import { createGiveawayInDatabase } from '#src/prisma/queries.js';
import displayGiveawayResults from '#src/features/giveaway.js';
import config, { DEFAULT_EMBED_OPTIONS } from '#src/config.js';

dayjs.extend(dayjsTimezone);
dayjs.extend(dayjsIsSameOrBefore);
dayjs.extend(dayjsCustomParseFormat);
dayjs.extend(dayjsUtc);

dayjs.tz.setDefault('Europe/Warsaw');

export default new ChatInputCommandHandler(<ChatInputCommandHandler>{
    builder: new SlashCommandBuilder()
        .setName('create-giveaway')
        .setDescription('Creates a giveaway with the given parameters.')
        .setNameLocalization(Locale.Polish, 'utwórz-konkurs')
        .setDescriptionLocalization(Locale.Polish, 'Tworzy konkurs o podanych parametrach.')
        .addStringOption(
            (option) =>
                option
                    .setName('prize')
                    .setDescription('The prize of the giveaway.')
                    .setNameLocalization(Locale.Polish, 'nagroda')
                    .setDescriptionLocalization(Locale.Polish, 'Nagroda konkursu.')
                    .setRequired(true),
        )
        .addIntegerOption(
            (option) =>
                option
                    .setName('winners-amount')
                    .setDescription('The amount of winners of the giveaway.')
                    .setNameLocalization(Locale.Polish, 'ilość-zwycięzców')
                    .setDescriptionLocalization(Locale.Polish, 'Ilość zwycięzców konkursu.')
                    .setMinValue(1)
                    .setRequired(true),
        )
        .addStringOption(
            (option) =>
                option
                    .setName('ends-at-date')
                    .setDescription('!FORMAT: DD-MM-YYYY HH:mm')
                    .setNameLocalization(Locale.Polish, 'data-zakończenia')
                    .setRequired(true),
        )
        .addBooleanOption(
            (option) =>
                option
                    .setName('is-minecraft-giveaway')
                    .setDescription('Whether the giveaway is a Minecraft giveaway.')
                    .setNameLocalization(Locale.Polish, 'konkurs-minecraft')
                    .setDescriptionLocalization(Locale.Polish, 'Czy konkurs jest związany z Minecraft?')
                    .setRequired(true),
        ),
    options: {},
    execute: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const { client, options, locale } = interaction;
        const { channel } = interaction as { channel: GuildTextBasedChannel };

        const prize = options.getString('prize')!;
        const winnersAmount = options.getInteger('winners-amount')!;
        const endsAtDate = options.getString('ends-at-date')!;
        const isMinecraftGiveaway = options.getBoolean('is-minecraft-giveaway')!;

        const formattedEndsAtDate = dayjs(endsAtDate, 'DD-MM-YYYY HH:mm', true);

        if (!formattedEndsAtDate.isValid() || formattedEndsAtDate.isBefore(dayjs())) {
            await interaction.followUp({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description: getTextByLocale(locale, 'CREATE_GIVEAWAY_REPLY_WRONG_DATE'),
                    }),
                ],
                ephemeral: true,
            });

            return false;
        }

        const giveawayMessageOptions = {
            embeds: [
                new EmbedBuilder({
                    title: 'Giveaway',
                    description: '🎉 There is a new giveaway! To participate, please press the button below this message.',
                    fields: [
                        { name: 'Prize', value: prize, inline: true },
                        { name: 'Winners amount', value: winnersAmount.toString(), inline: true },
                        { name: 'Ends at', value: time(formattedEndsAtDate.toDate()) },
                    ],
                    image: { url: config.imageUrls.giveawayMessage },
                    ...DEFAULT_EMBED_OPTIONS,
                    color: resolveColor('#ffd8ab'),
                }),
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder({
                            customId: isMinecraftGiveaway ? 'participate-in-minecraft-giveaway' : 'participate-in-giveaway',
                            emoji: '🎉',
                            label: 'Participate',
                            style: ButtonStyle.Success,
                        }),
                    ],
                }),
            ],
        };

        const giveawayMessage = await channel.send(giveawayMessageOptions);

        client.giveaways.set(giveawayMessage.id, {
            winnersAmount,
            endsAt: formattedEndsAtDate.toDate(),
            participants: [],
        });

        await createGiveawayInDatabase({
            messageId: giveawayMessage.id,
            prize,
            winnersAmount,
            endsAt: formattedEndsAtDate.toDate(),
        });

        scheduleJob(formattedEndsAtDate.toDate(), async () => {
            await displayGiveawayResults(client, giveawayMessage.id);
        });

        // const mentionMessage = await channel.send({ content: roleMention(config.ids.roles.customer) });
        // await mentionMessage.delete();

        await interaction.followUp({
            embeds: [
                getInteractionReplyEmbed({
                    theme: 'success',
                    description: getTextByLocale(locale, 'CREATE_GIVEAWAY_REPLY_SUCCESS'),
                }),
            ],
            ephemeral: true,
        });

        return true;
    },
});
