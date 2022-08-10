import { PrismaClient } from '@prisma/client';
import { createLoggerEntry } from '#utils/logger.js';

const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
    ],
});

prisma.$on('query', async ({ query, duration }) => {
    await createLoggerEntry({
        message: 'A query has been sent to the database.',
        additionalData: {
            query: query.replaceAll('"', ''),
            duration,
        },
    });
});

export default prisma;
