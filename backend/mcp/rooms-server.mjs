import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(currentDirectory, '..', '.env') });

const AVAILABLE_ROOM_FILTER = { full: false, started: false };
const ROOM_CAPACITY = 4;

let connectionPromise;

async function connectToDatabase() {
    if (mongoose.connection.readyState === 1) return;

    const connectionUri = process.env.CONNECTION_URI;
    if (!connectionUri) {
        throw new Error('CONNECTION_URI is required to check available rooms.');
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(connectionUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: process.env.MONGODB_DB_NAME || 'test',
            })
            .catch(error => {
                connectionPromise = undefined;
                throw error;
            });
    }

    await connectionPromise;
}

export async function checkAvailableRooms() {
    await connectToDatabase();

    const rooms = await mongoose.connection
        .collection('rooms')
        .find(AVAILABLE_ROOM_FILTER, {
            projection: {
                _id: 1,
                name: 1,
                private: 1,
                createDate: 1,
                players: 1,
            },
        })
        .sort({ createDate: 1 })
        .toArray();

    const availableRooms = rooms.map(room => ({
        id: room._id.toString(),
        name: room.name || null,
        isPrivate: Boolean(room.private),
        playerCount: room.players?.length || 0,
        capacity: ROOM_CAPACITY,
        createdAt: room.createDate ? room.createDate.toISOString() : null,
    }));

    return {
        count: availableRooms.length,
        rooms: availableRooms,
    };
}

export function createRoomsMcpServer() {
    const server = new McpServer({
        name: 'mern-ludo-rooms',
        version: '1.0.0',
    });

    server.registerTool(
        'check_available_rooms',
        {
            title: 'Check available rooms',
            description: 'List Ludo rooms that have space and have not started.',
        },
        async () => {
            try {
                const result = await checkAvailableRooms();
                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    structuredContent: result,
                };
            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: error instanceof Error ? error.message : 'Unable to check available rooms.',
                        },
                    ],
                };
            }
        }
    );

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
