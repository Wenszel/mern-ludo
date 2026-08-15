import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio, type StdioServerHandle } from '@modelcontextprotocol/server/stdio';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { checkAvailableRooms } from './room-repository.mjs';
import { registerRoomTools, type RoomOperations } from './room-tools.mjs';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.basename(path.dirname(currentDirectory)) === 'dist'
    ? path.resolve(currentDirectory, '..', '..')
    : path.resolve(currentDirectory, '..');

dotenv.config({ path: path.join(backendDirectory, '.env') });

export { checkAvailableRooms };

export function createRoomsMcpServer(operations: Partial<RoomOperations> = {}): McpServer {
    const server = new McpServer({
        name: 'mern-ludo-rooms',
        version: '2.0.0',
    });

    registerRoomTools(server, operations);
    return server;
}

async function shutdown(handle: StdioServerHandle): Promise<void> {
    await handle.close();
    await mongoose.disconnect();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const handle = serveStdio(() => createRoomsMcpServer());

    process.on('SIGINT', () => void shutdown(handle));
    process.on('SIGTERM', () => void shutdown(handle));

    console.error('MERN Ludo rooms MCP server running on stdio');
}
