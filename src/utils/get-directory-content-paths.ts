import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const getDirectoryContentPaths = (rootPath: string) => {
    const paths: string[] = [];

    for (const entry of readdirSync(rootPath)) {
        const entryPath = join(rootPath, entry);

        if (statSync(entryPath).isDirectory()) {
            paths.push(...getDirectoryContentPaths(entryPath));
        }

        if (!entry.endsWith('.js')) {
            continue;
        }

        paths.push(entryPath);
    }

    return paths;
};

export default getDirectoryContentPaths;
