import prisma from './client.js';
import { Prisma } from '@prisma/client';
import { createLoggerEntry } from '#utils/logger.js';

export const getMessageTranslationsFromDatabase = async () => {
    try {
        return prisma.messageTranslations.findMany({
            select: {
                messageId: true,
                translation: true,
            },
        });
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while getting message translations from database.',
            error,
        });

        return null;
    }
};

export const createMessageTranslationInDatabase = async (data: Prisma.MessageTranslationsCreateInput) => {
    try {
        await prisma.messageTranslations.create({
            data,
        });

        return true;
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while creating a message translation in the database.',
            error,
        });

        return null;
    }
};

export const getOpenTicketsFromDatabase = async () => {
    try {
        return prisma.tickets.findMany({
            select: {
                channelId: true,
                userId: true,
            },
            where: {
                isOpen: true,
            },
        });
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while getting open tickets from the database.',
            error,
        });

        return null;
    }
};

export const createTicketInDatabase = async (data: Prisma.TicketsCreateInput) => {
    try {
        prisma.tickets.create({
            data,
        });

        return true;
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while creating a ticket in the database.',
            error,
        });

        return null;
    }
};

export const closeTicketInDatabase = async ({ channelId }: Omit<Prisma.TicketsCreateInput, 'userId'>) => {
    try {
        prisma.tickets.update({
            where: {
                channelId,
            },
            data: {
                isOpen: false,
            },
        });

        return true;
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while closing a ticket in the database.',
            error,
        });

        return null;
    }
};

export const getActiveGiveawaysFromDatabase = async () => {
    try {
        return prisma.giveaways.findMany({
            select: {
                messageId: true,
                prize: true,
                winnersAmount: true,
                participants: true,
                endsAt: true,
            },
            where: {
                isActive: true,
            },
        });
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while getting active giveaways from the database.',
            error,
        });

        return null;
    }
};

export const createGiveawayInDatabase = async (data: Prisma.GiveawaysCreateInput) => {
    try {
        await prisma.giveaways.create({
            data,
        });

        return true;
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while creating a giveaway in the database.',
            error,
        });

        return null;
    }
};

export const createGiveawayParticipantsInDatabase = async (data: Prisma.GiveawayParticipantsCreateInput) => {
    try {
        await prisma.giveawayParticipants.create({
            data,
        });

        return true;
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while updating a giveaway participants in the database.',
            error,
        });

        return null;
    }
};

export const closeGiveawayInDatabase = async (messageId: string) => {
    try {
        await prisma.giveaways.update({
            where: {
                messageId,
            },
            data: {
                isActive: false,
            },
        });

        return true;
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while closing a giveaway in the database.',
            error,
        });

        return null;
    }
};

export const getUserSeedsFromDatabase = async () => {
    try {
        return prisma.userSeeds.findMany();
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while getting user seeds from the database.',
            error,
        });

        return null;
    }
};

export const setUserSeedInDatabase = async (data: Prisma.UserSeedsCreateInput) => {
    try {
        await prisma.userSeeds.upsert({
            create: {
                userId: data.userId,
                seed: data.seed,
            },
            where: {
                userId: data.userId,
            },
            update: {
                seed: data.seed,
            },
        });

        return true;
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while setting an opening seed in the database.',
            error,
        });

        return null;
    }
};

export const createCooldownInDatabase = async (cooldown: Prisma.CooldownsCreateInput) => {
    try {
        await prisma.cooldowns.create({
            data: cooldown,
        });

        return true;
    } catch (error) {
        await createLoggerEntry({
            message: 'An error occurred while creating a cooldown in the database.',
            level: 'error',
            error,
        });

        return null;
    }
};

export const getActiveCooldownsFromDatabase = async () => {
    try {
        return prisma.cooldowns.findMany({
            select: {
                interactionName: true,
                userId: true,
                expiresAt: true,
            },
            where: {
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
    } catch (error) {
        await createLoggerEntry({
            message: 'An error occurred while getting active cooldowns from the database.',
            level: 'error',
            error,
        });

        return null;
    }
};
