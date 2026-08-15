const { expect } = require('chai');

describe('rooms MCP', function () {
    let repository;
    let registerRoomTools;

    before(async function () {
        repository = await import('../../mcp/room-repository.mts');
        ({ registerRoomTools } = await import('../../mcp/room-tools.mts'));
    });

    const room = overrides => ({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        name: 'Test room',
        private: false,
        createDate: new Date('2026-08-15T12:00:00.000Z'),
        players: [],
        started: false,
        full: false,
        winner: null,
        ...overrides,
    });

    it('derives room status and availability from the full room state', function () {
        const waiting = room({ players: [{}, {}] });
        const fullByFlag = room({ full: true, players: [{}, {}] });
        const fullByCapacity = room({ players: [{}, {}, {}, {}] });
        const inProgress = room({ started: true, full: true, players: [{}, {}, {}, {}] });
        const finished = room({ winner: 'red', started: true });

        expect(repository.roomStatus(waiting)).to.equal('waiting');
        expect(repository.roomStatus(fullByFlag)).to.equal('full');
        expect(repository.roomStatus(fullByCapacity)).to.equal('full');
        expect(repository.roomStatus(inProgress)).to.equal('in_progress');
        expect(repository.roomStatus(finished)).to.equal('finished');

        expect(repository.isRoomAvailable(waiting)).to.equal(true);
        expect(repository.isRoomAvailable(fullByFlag)).to.equal(false);
        expect(repository.isRoomAvailable(fullByCapacity)).to.equal(false);
        expect(repository.isRoomAvailable(inProgress)).to.equal(false);
        expect(repository.isRoomAvailable(finished)).to.equal(false);
    });

    it('returns sanitized room details without passwords, session IDs, or internal IDs', async function () {
        let receivedFilter;
        let receivedProjection;
        const collection = {
            findOne: async (filter, options) => {
                receivedFilter = filter;
                receivedProjection = options.projection;
                return room({
                    password: 'room-secret',
                    rolledNumber: 6,
                    nextMoveTime: Date.parse('2026-08-15T12:01:00.000Z'),
                    players: [
                        {
                            _id: 'internal-player-id',
                            sessionID: 'private-session-id',
                            password: 'player-secret',
                            name: 'Ada',
                            color: 'red',
                            ready: true,
                            nowMoving: true,
                        },
                    ],
                    pawns: [
                        {
                            _id: 'internal-pawn-id',
                            color: 'red',
                            basePos: 0,
                            position: 12,
                            sessionID: 'pawn-secret',
                        },
                    ],
                });
            },
        };

        const details = await repository.getRoomDetails(
            '507f1f77bcf86cd799439011',
            { includePawns: true },
            collection
        );

        expect(receivedFilter._id.toString()).to.equal('507f1f77bcf86cd799439011');
        expect(receivedProjection['players.name']).to.equal(1);
        expect(receivedProjection['players.color']).to.equal(1);
        expect(receivedProjection).not.to.have.property('players._id');
        expect(receivedProjection).not.to.have.property('players.sessionID');
        expect(receivedProjection).not.to.have.property('password');
        expect(details.players).to.deep.equal([
            { name: 'Ada', color: 'red', ready: true, isCurrentTurn: true },
        ]);
        expect(details.currentTurn).to.deep.equal(details.players[0]);
        expect(details.pawns).to.deep.equal([{ color: 'red', basePosition: 0, position: 12 }]);
        expect(details.nextMoveAt).to.equal('2026-08-15T12:01:00.000Z');

        const serialized = JSON.stringify(details);
        expect(serialized).not.to.include('password');
        expect(serialized).not.to.include('sessionID');
        expect(serialized).not.to.include('internal-player-id');
        expect(serialized).not.to.include('internal-pawn-id');
        expect(Object.keys(details)).not.to.include('_id');
    });

    it('lists rooms through a bounded aggregation without loading player documents', async function () {
        let receivedPipeline;
        const collection = {
            aggregate: pipeline => {
                receivedPipeline = pipeline;
                return {
                    toArray: async () => [
                        room({ players: undefined, playerCount: 2 }),
                    ],
                };
            },
        };

        const rooms = await repository.listRooms(
            { status: 'available', privacy: 'public', minPlayers: 1, sort: 'newest', limit: 10 },
            collection
        );

        expect(receivedPipeline[0].$match.$and).to.deep.include({ private: { $ne: true } });
        expect(receivedPipeline[1].$project).not.to.have.property('players');
        expect(receivedPipeline[1].$project.playerCount).to.deep.equal({
            $size: { $ifNull: ['$players', []] },
        });
        expect(receivedPipeline[2]).to.deep.equal({ $sort: { createDate: -1, _id: -1 } });
        expect(receivedPipeline[3]).to.deep.equal({ $limit: 10 });
        expect(rooms[0].playerCount).to.equal(2);
    });

    it('summarizes lobby status, occupancy, availability, and data-quality signals', async function () {
        const documents = [
            room({ players: [{}, {}] }),
            room({ private: true, players: [{}, {}, {}, {}], full: false }),
            room({ private: true, players: [{}], started: true }),
            room({ players: [{}, {}, {}, {}, {}], started: true, full: true, winner: 'blue' }),
        ];
        const collection = {
            aggregate: pipeline => {
                expect(pipeline).to.have.length(1);
                expect(pipeline[0].$project).to.include({ _id: 1, winner: 1 });
                expect(pipeline[0].$project.playerCount).to.deep.equal({
                    $size: { $ifNull: ['$players', []] },
                });
                return { toArray: async () => documents };
            },
        };

        const summary = await repository.getLobbySummary(collection);

        expect(summary.totalRooms).to.equal(4);
        expect(summary.availableRooms).to.equal(1);
        expect(summary.publicAvailableRooms).to.equal(1);
        expect(summary.privateAvailableRooms).to.equal(0);
        expect(summary.statusCounts).to.deep.equal({ waiting: 1, full: 1, in_progress: 1, finished: 1 });
        expect(summary.occupancy).to.deep.equal({ players: 12, capacity: 16, percent: 75 });
        expect(summary.dataQuality).to.deep.equal({ overCapacity: 1, fullFlagMismatch: 1 });
        expect(Number.isNaN(Date.parse(summary.checkedAt))).to.equal(false);
    });

    it('creates a room from allowlisted fields and returns only a safe summary', async function () {
        let storedDocument;
        const collection = {
            insertOne: async document => {
                storedDocument = document;
            },
        };

        const created = await repository.createRoom(
            { name: '  Private table  ', isPrivate: true, password: 'secret-pass' },
            collection
        );

        expect(storedDocument).to.deep.include({
            name: 'Private table', private: true, password: 'secret-pass', started: false, full: false, winner: null,
        });
        expect(storedDocument.players).to.deep.equal([]);
        expect(storedDocument.pawns).to.have.length(16);
        expect(storedDocument.pawns.slice(0, 4).map(pawn => pawn.color)).to.deep.equal(Array(4).fill('red'));
        expect(storedDocument.pawns.map(pawn => pawn.basePos)).to.deep.equal([...Array(16).keys()]);
        expect(storedDocument.pawns.map(pawn => pawn.position)).to.deep.equal([...Array(16).keys()]);
        expect(created).to.deep.include({
            name: 'Private table',
            isPrivate: true,
            status: 'waiting',
            playerCount: 0,
            capacity: 4,
        });
        expect(JSON.stringify(created)).not.to.include('secret-pass');
        expect(created).not.to.have.property('password');
    });

    it('registers the complete room tool surface with accurate safety annotations', function () {
        const tools = new Map();
        const server = {
            registerTool: (name, options, handler) => tools.set(name, { options, handler }),
        };

        registerRoomTools(server, {});

        expect([...tools.keys()]).to.deep.equal([
            'check_available_rooms',
            'list_rooms',
            'get_room_details',
            'get_lobby_summary',
            'check_new_rooms',
            'create_room',
        ]);
        for (const [name, { options, handler }] of tools) {
            if (name === 'create_room') continue;
            expect(options.annotations).to.deep.include({
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
            });
            expect(handler).to.be.a('function');
        }
        expect(tools.get('create_room').options.annotations).to.deep.equal({
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        });
        expect(tools.get('create_room').handler).to.be.a('function');

        const createSchema = tools.get('create_room').options.inputSchema;
        expect(createSchema.safeParse({ name: 'Public room' }).success).to.equal(true);
        expect(createSchema.safeParse({ name: 'Private room', isPrivate: true }).success).to.equal(false);
        expect(createSchema.safeParse({ name: 'Public room', password: 'secret' }).success).to.equal(false);
        expect(
            createSchema.safeParse({ name: 'Private room', isPrivate: true, password: 'secret' }).success
        ).to.equal(true);
    });

    it('uses injected operations and returns sanitized structured tool results', async function () {
        const expectedRooms = [
            {
                id: '507f1f77bcf86cd799439011',
                name: 'Safe room',
                isPrivate: false,
                status: 'waiting',
                playerCount: 1,
                capacity: 4,
                createdAt: '2026-08-15T12:00:00.000Z',
            },
        ];
        const tools = new Map();
        const server = {
            registerTool: (name, options, handler) => tools.set(name, { options, handler }),
        };
        registerRoomTools(server, {
            listRooms: async input => {
                expect(input).to.deep.include({ status: 'available', privacy: 'public' });
                return expectedRooms;
            },
        });

        const result = await tools.get('list_rooms').handler({
            status: 'available',
            privacy: 'public',
            sort: 'oldest',
            limit: 25,
        });

        expect(result.isError).not.to.equal(true);
        expect(result.structuredContent.count).to.equal(1);
        expect(result.structuredContent.rooms).to.deep.equal(expectedRooms);
        expect(JSON.parse(result.content[0].text)).to.deep.equal(result.structuredContent);
    });

    it('returns a sanitized result from the injected create operation', async function () {
        const tools = new Map();
        const server = {
            registerTool: (name, options, handler) => tools.set(name, { options, handler }),
        };
        registerRoomTools(server, {
            createRoom: async input => {
                expect(input).to.deep.equal({ name: 'New table', isPrivate: true, password: 'secret' });
                return {
                    id: '507f1f77bcf86cd799439011',
                    name: input.name,
                    isPrivate: input.isPrivate,
                    status: 'waiting',
                    playerCount: 0,
                    capacity: 4,
                    createdAt: '2026-08-15T12:00:00.000Z',
                };
            },
        });

        const result = await tools.get('create_room').handler({
            name: 'New table',
            isPrivate: true,
            password: 'secret',
        });

        expect(result.structuredContent.created).to.equal(true);
        expect(result.structuredContent.room.name).to.equal('New table');
        expect(JSON.stringify(result.structuredContent)).not.to.include('secret');
    });
});
