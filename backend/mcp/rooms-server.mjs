import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { checkAvailableRooms } from './room-repository.mjs';
import { registerRoomTools } from './room-tools.mjs';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(currentDirectory, '..', '.env') });

export { checkAvailableRooms };

export function createRoomsMcpServer(operations) {
    const server = new McpServer({
        name: 'mern-ludo-rooms',
        version: '1.1.0',
    });

    registerRoomTools(server, operations);

    return server;
}

async function shutdown(handle) {
    await handle.close();
    await mongoose.disconnect();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const handle = serveStdio(createRoomsMcpServer);

    process.on('SIGINT', () => void shutdown(handle));
    process.on('SIGTERM', () => void shutdown(handle));

    console.error('MERN Ludo rooms MCP server running on stdio');
}
