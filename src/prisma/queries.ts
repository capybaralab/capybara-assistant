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
    }
};

export const createMessageTranslationInDatabase = async (data: Prisma.MessageTranslationsCreateInput) => {
    try {
        await prisma.messageTranslations.create({
            data,
        });
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while creating a message translation in the database.',
            error,
        });
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
    }
};

export const createTicketInDatabase = async (data: Prisma.TicketsCreateInput) => {
    try {
        return prisma.tickets.create({
            data,
        });
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while creating a ticket in the database.',
            error,
        });
    }
};

export const closeTicketInDatabase = async ({ channelId }: Omit<Prisma.TicketsCreateInput, 'userId'>) => {
    try {
        return prisma.tickets.update({
            where: {
                channelId,
            },
            data: {
                isOpen: false,
            },
        });
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while closing a ticket in the database.',
            error,
        });
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
    }
};

export const createGiveawayInDatabase = async (data: Prisma.GiveawaysCreateInput) => {
    try {
        await prisma.giveaways.create({
            data,
        });
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while creating a giveaway in the database.',
            error,
        });
    }
};

export const createGiveawayParticipantsInDatabase = async (data: Prisma.GiveawayParticipantsCreateInput) => {
    try {
        await prisma.giveawayParticipants.create({
            data,
        });
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while updating a giveaway participants in the database.',
            error,
        });
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
    } catch (error) {
        await createLoggerEntry({
            level: 'error',
            message: 'An error occurred while closing a giveaway in the database.',
            error,
        });
    }
};
