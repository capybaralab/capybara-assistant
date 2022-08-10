import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Interaction,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    SlashCommandBuilder,
} from 'discord.js';
import { Snowflake } from 'discord-api-types/v10';
import type { LoggerEntry } from '#utils/logger.js';

export interface InteractionHandlerOptions {
    readonly permissions?: InteractionHandlerPermissions;
    readonly cooldownDuration?: number;
}

export interface InteractionHandlerPermissions {
    readonly userIds?: Snowflake[];
    readonly roleIds?: Snowflake[];
}

export abstract class InteractionHandler<InteractionType extends Interaction> {
    public readonly options: InteractionType extends ChatInputCommandInteraction ? Omit<
        InteractionHandlerOptions,
        'permissions'
    > : InteractionHandlerOptions;
    public readonly execute: (interaction: InteractionType) => Promise<
        boolean | Pick<LoggerEntry, 'embedAdditionalData' | 'additionalData'>
    >;

    protected constructor({ options, execute }: InteractionHandler<InteractionType>) {
        this.options = options;
        this.execute = execute;
    }
}

export class ChatInputCommandHandler extends InteractionHandler<ChatInputCommandInteraction> {
    public readonly builder: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

    public constructor({ builder, options, execute }: ChatInputCommandHandler) {
        super({ options, execute });
        this.builder = builder;
    }
}

export class ButtonHandler extends InteractionHandler<ButtonInteraction> {
    public readonly customId: string;

    public constructor({ customId, options, execute }: ButtonHandler) {
        super({ options, execute });
        this.customId = customId;
    }
}

export class SelectMenuHandler extends InteractionHandler<SelectMenuInteraction> {
    public readonly customId: string;

    public constructor({ customId, options, execute }: SelectMenuHandler) {
        super({ options, execute });
        this.customId = customId;
    }
}

export class ModalSubmitHandler extends InteractionHandler<ModalSubmitInteraction> {
    public readonly customId: string;

    public constructor({ customId, options, execute }: ModalSubmitHandler) {
        super({ options, execute });
        this.customId = customId;
    }
}
