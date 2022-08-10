import { AutocompleteInteraction, channelMention, type Interaction, userMention } from 'discord.js';
import EventHandler from '#structures/event-handler.js';
import { InteractionHandler } from '#structures/interaction-handlers.js';
import { getInteractionReplyEmbed } from '#utils/embeds.js';
import { createLoggerEntry } from '#utils/logger.js';

const invokeInteractionHandler = async <InteractionType extends Interaction>(
    execute: InteractionHandler<InteractionType>['execute'],
    interaction: InteractionType,
) => {
    const { client, user, channelId } = interaction;

    const loggerEntryInteractionData = {
        additionalData: {
            user: user.tag,
            channelId: channelId ?? 'Unknown',
        },
        embedAdditionalData: [
            { name: 'Użytkownik', value: userMention(user.id) },
            { name: 'Kanał', value: channelId ? channelMention(channelId) : 'Nieznany' },
        ],
    };

    try {
        const handlerResponse = await execute(interaction);

        if (!handlerResponse) {
            await createLoggerEntry({
                message: 'The interaction handler has reported an internal error, probably due to validation.',
                embedMessage:
                    'Podczas obsługi interakcji wystąpił błąd wewnętrzny, prawdopodobnie wynikający z walidacji otrzymanych danych.',
                ...loggerEntryInteractionData,
                level: 'warning',
                client,
            });

            return;
        }

        const loggerEntryMessages = {
            message: 'The interaction handler has been successfully executed.',
            embedMessage: 'Interakcja została poprawnie obsłużona.',
        };

        if (typeof handlerResponse === 'object') {
            await createLoggerEntry({
                ...loggerEntryMessages,
                additionalData: { ...handlerResponse.additionalData, ...loggerEntryInteractionData.additionalData },
                embedAdditionalData: handlerResponse.embedAdditionalData && [
                    ...handlerResponse.embedAdditionalData,
                    ...loggerEntryInteractionData.embedAdditionalData,
                ],
                client,
            });

            return;
        }

        await createLoggerEntry({
            ...loggerEntryMessages,
            ...loggerEntryInteractionData,
            client,
        });
    } catch (error) {
        await createLoggerEntry({
            message: 'An error occurred while executing an interaction handler.',
            embedMessage: 'Wystąpił nieoczekiwany błąd podczas obsługi interakcji.',
            ...loggerEntryInteractionData,
            level: 'error',
            error,
        });

        if (!interaction.isRepliable()) {
            return;
        }

        await interaction[(interaction.replied || interaction.deferred) ? 'followUp' : 'reply']({
            embeds: [
                getInteractionReplyEmbed({
                    theme: 'error',
                    description:
                        interaction.locale === 'pl' ? 'Wystąpił błąd podczas obsługi interakcji. Spróbuj ponownie, lub skontaktuj się z administratorem.' : 'An error occurred while handling the interaction. Please try again or contact an administrator.',
                }),
            ],
            ephemeral: true,
        });
    }
};

const validateInteraction = async <InteractionType extends Exclude<Interaction, AutocompleteInteraction>>(
    { interactionName, interaction, handlerOptions }: {
        interactionName: string;
        interaction: InteractionType;
        handlerOptions: InteractionHandler<InteractionType>['options'];
    },
) => {
    const { user } = interaction;

    if ('permissions' in handlerOptions) {
        const { permissions } = handlerOptions;

        const replyWithInsufficientPermissionsEmbed = async () =>
            interaction.reply({
                embeds: [
                    getInteractionReplyEmbed({
                        theme: 'warning',
                        description:
                            interaction.locale === 'pl' ? 'Nie posiadasz odpowiednich uprawnień, by użyć tej interakcji.' : 'You do not have sufficient permissions to use this interaction.',
                    }),
                ],
                ephemeral: true,
            });

        if (permissions?.userIds && !permissions.userIds.includes(user.id)) {
            await replyWithInsufficientPermissionsEmbed();

            return false;
        }

        if (permissions?.roleIds && interaction.inCachedGuild() && !interaction.member.roles.cache.hasAny(...permissions.roleIds)) {
            await replyWithInsufficientPermissionsEmbed();

            return false;
        }
    }

    return true;
};

export default new EventHandler<'interactionCreate'>({
    name: 'interactionCreate',
    execute: async (interaction) => {
        const {
            client: { interactionHandlers },
        } = interaction;

        if (interaction.isChatInputCommand()) {
            const handler = interactionHandlers.chatInputCommands.get(interaction.commandName);

            if (!handler) {
                return;
            }

            if (!(await validateInteraction({ interaction, interactionName: interaction.commandName, handlerOptions: handler.options }))) {
                return;
            }

            await invokeInteractionHandler(handler.execute, interaction);
            return;
        }

        if (interaction.isButton()) {
            const handler = interactionHandlers.buttons.get(interaction.customId);

            if (!handler) {
                return;
            }

            if (!(await validateInteraction({ interaction, interactionName: interaction.customId, handlerOptions: handler.options }))) {
                return;
            }

            await invokeInteractionHandler(handler.execute, interaction);
            return;
        }

        if (interaction.isSelectMenu()) {
            const handler = interactionHandlers.selectMenus.get(interaction.customId);

            if (!handler) {
                return;
            }

            if (!(await validateInteraction({ interaction, interactionName: interaction.customId, handlerOptions: handler.options }))) {
                return;
            }

            await invokeInteractionHandler(handler.execute, interaction);
            return;
        }

        if (interaction.isModalSubmit()) {
            const handler = interactionHandlers.modalSubmits.get(interaction.customId);

            if (!handler) {
                return;
            }

            if (!(await validateInteraction({ interaction, interactionName: interaction.customId, handlerOptions: handler.options }))) {
                return;
            }

            await invokeInteractionHandler(handler.execute, interaction);
        }
    },
});
