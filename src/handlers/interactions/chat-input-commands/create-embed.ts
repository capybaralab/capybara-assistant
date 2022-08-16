import {ChatInputCommandHandler} from "#structures/interaction-handlers.js";
import {ColorResolvable, EmbedBuilder, resolveColor, SlashCommandBuilder} from "discord.js";
import config from "#src/config.js";

export default new ChatInputCommandHandler({
    builder: new SlashCommandBuilder()
        .setName('create-embed')
        .setDescription('Łod tego co godo')
        .addStringOption(option => option.setName('title').setRequired(true).setDescription('Tytuł'))
        .addStringOption(option => option.setName('description').setRequired(false).setDescription('Opis'))
        .addStringOption(option => option.setName('color').setRequired(false).setDescription('Kolor w formacie HEX, np. #FFFFFF')),
    options: {},
    execute: async (interaction) => {
        const {options, channel} = interaction;

        const title = options.getString('title')!;
        const description = options.getString('description');
        const color = options.getString('color');

        await channel!.send({
            embeds: [
                new EmbedBuilder({
                    title,
                    description: description ?? undefined,
                    color: color ? resolveColor(color as ColorResolvable) : resolveColor(config.colors.default),
                    footer: {
                        text: 'capybaralab.com',
                    }
                })
            ]
        })

        await interaction.reply({
            content: 'Szafa gra, brachu.',
            ephemeral: true,
        });

        return true;
    }
});