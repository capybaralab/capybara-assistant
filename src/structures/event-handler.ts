import type { ClientEvents } from 'discord.js';
import type { RestEvents } from '@discordjs/rest';

class EventHandler<Name extends keyof ClientEvents | keyof RestEvents> {
    public readonly name: Name;
    public readonly isOnce?: boolean;
    public readonly execute: (
        ...executeArguments: Name extends keyof ClientEvents
            ? ClientEvents[Name]
            : Name extends keyof RestEvents
                ? RestEvents[Name]
                : never
    ) => void;

    public constructor({ name, isOnce, execute }: EventHandler<Name>) {
        this.name = name;
        this.isOnce = isOnce;
        this.execute = execute;
    }
}

export default EventHandler;
