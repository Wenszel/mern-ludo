import { McpServer, type CallToolResult, type JSONObject, type ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';

import {
    DEFAULT_ROOM_LIMIT,
    MAX_ROOM_LIMIT,
    checkAvailableRooms,
    createRoom,
    getLobbySummary,
    getRoomDetails,
    listRooms,
} from './room-repository.mjs';

const readOnlyAnnotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
} satisfies ToolAnnotations;

const listRoomsInput = z
    .object({
        status: z.enum(['available', 'waiting', 'full', 'in_progress', 'finished', 'all']).default('available'),
        privacy: z.enum(['public', 'private', 'any']).default('any'),
        minPlayers: z.number().int().min(0).max(4).optional(),
        maxPlayers: z.number().int().min(0).max(4).optional(),
        sort: z.enum(['oldest', 'newest', 'most_players', 'fewest_players']).default('oldest'),
        limit: z.number().int().min(1).max(MAX_ROOM_LIMIT).default(DEFAULT_ROOM_LIMIT),
    })
    .strict()
    .refine(input => input.minPlayers === undefined || input.maxPlayers === undefined || input.minPlayers <= input.maxPlayers, {
        message: 'minPlayers cannot be greater than maxPlayers.',
    });

const roomDetailsInput = z
    .object({
        roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'roomId must be a 24-character MongoDB ObjectId.'),
        includePawns: z.boolean().default(false),
    })
    .strict();

const newRoomsInput = z
    .object({
        since: z.iso.datetime(),
        privacy: z.enum(['public', 'private', 'any']).default('any'),
        limit: z.number().int().min(1).max(MAX_ROOM_LIMIT).default(DEFAULT_ROOM_LIMIT),
    })
    .strict();

const createRoomInput = z
    .object({
        name: z.string().trim().min(1).max(50),
        isPrivate: z.boolean().default(false),
        password: z.string().min(4).max(72).optional(),
    })
    .strict()
    .superRefine((input, context) => {
        if (input.isPrivate && !input.password) {
            context.addIssue({
                code: 'custom',
                path: ['password'],
                message: 'A password is required for a private room.',
            });
        }
        if (!input.isPrivate && input.password !== undefined) {
            context.addIssue({
                code: 'custom',
                path: ['password'],
                message: 'A public room cannot have a password.',
            });
        }
    });

function success<T extends object>(result: T): CallToolResult {
    return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result as JSONObject,
    };
}

function failure(error: unknown, fallback: string): CallToolResult {
    return {
        isError: true,
        content: [{ type: 'text', text: error instanceof Error ? error.message : fallback }],
    };
}

export interface RoomOperations {
    checkAvailableRooms: typeof checkAvailableRooms;
    createRoom: typeof createRoom;
    listRooms: typeof listRooms;
    getRoomDetails: typeof getRoomDetails;
    getLobbySummary: typeof getLobbySummary;
}

export function registerRoomTools(server: McpServer, operations: Partial<RoomOperations> = {}): void {
    const roomOperations: RoomOperations = {
        checkAvailableRooms,
        createRoom,
        listRooms,
        getRoomDetails,
        getLobbySummary,
        ...operations,
    };

    server.registerTool(
        'check_available_rooms',
        {
            title: 'Check available rooms',
            description: 'List up to 100 Ludo rooms that have space and have not started.',
            annotations: readOnlyAnnotations,
        },
        async () => {
            try {
                return success(await roomOperations.checkAvailableRooms());
            } catch (error) {
                return failure(error, 'Unable to check available rooms.');
            }
        }
    );

    server.registerTool(
        'list_rooms',
        {
            title: 'List rooms',
            description: 'List sanitized Ludo room summaries with status, privacy, player-count, sort, and limit filters.',
            inputSchema: listRoomsInput,
            annotations: readOnlyAnnotations,
        },
        async input => {
            try {
                const rooms = await roomOperations.listRooms(input);
                return success({ checkedAt: new Date().toISOString(), count: rooms.length, filters: input, rooms });
            } catch (error) {
                return failure(error, 'Unable to list rooms.');
            }
        }
    );

    server.registerTool(
        'get_room_details',
        {
            title: 'Get room details',
            description: 'Get sanitized room, player, turn, and optional pawn state without passwords or session IDs.',
            inputSchema: roomDetailsInput,
            annotations: readOnlyAnnotations,
        },
        async ({ roomId, includePawns }) => {
            try {
                const room = await roomOperations.getRoomDetails(roomId, { includePawns });
                if (!room) return failure(new Error(`Room ${roomId} was not found.`), 'Room was not found.');
                return success({ checkedAt: new Date().toISOString(), room });
            } catch (error) {
                return failure(error, 'Unable to get room details.');
            }
        }
    );

    server.registerTool(
        'get_lobby_summary',
        {
            title: 'Get lobby summary',
            description: 'Get aggregate room counts, occupancy, availability, and data-quality signals.',
            annotations: readOnlyAnnotations,
        },
        async () => {
            try {
                return success(await roomOperations.getLobbySummary());
            } catch (error) {
                return failure(error, 'Unable to summarize the lobby.');
            }
        }
    );

    server.registerTool(
        'check_new_rooms',
        {
            title: 'Check new rooms',
            description: 'List currently available rooms created after an ISO timestamp and return the next timestamp cursor.',
            inputSchema: newRoomsInput,
            annotations: readOnlyAnnotations,
        },
        async ({ since, privacy, limit }) => {
            try {
                const checkedAt = new Date();
                const createdAfter = new Date(since);
                if (createdAfter > checkedAt) throw new Error('since cannot be in the future.');
                const rooms = await roomOperations.listRooms({
                    status: 'available',
                    privacy,
                    limit,
                    sort: 'oldest',
                    createdAfter,
                });
                return success({
                    checkedAt: checkedAt.toISOString(),
                    nextSince: checkedAt.toISOString(),
                    count: rooms.length,
                    rooms,
                });
            } catch (error) {
                return failure(error, 'Unable to check new rooms.');
            }
        }
    );

    server.registerTool(
        'create_room',
        {
            title: 'Create room',
            description: 'Create a public or password-protected private Ludo room. This operation is not idempotent.',
            inputSchema: createRoomInput,
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: false,
                openWorldHint: false,
            },
        },
        async input => {
            try {
                const room = await roomOperations.createRoom(input);
                return success({ createdAt: new Date().toISOString(), created: true, room });
            } catch (error) {
                return failure(error, 'Unable to create the room.');
            }
        }
    );
}
