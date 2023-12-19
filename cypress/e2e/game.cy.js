const io = require('socket.io-client');
const socket = io.connect('http://localhost:8080', { withCredentials: true });
const uniqName = Date.now().toString();

describe('game', () => {
    before(() => {
        cy.visit('http://localhost:3000');
        cy.get('[placeholder="Server Name"]').type(uniqName);
        cy.get('button:contains("Host")').click();
        const room = cy.contains(`${uniqName}`).should('exist');
        room.closest('tr').find('button:contains("Join")').click();
        const e = cy.get('[placeholder="Nickname"]').type('player1');
        e.type('{enter}');
        setTimeout(() => {
            socket.emit('room:rooms');
            socket.on('room:rooms', rooms => {
                const roomId = JSON.parse(rooms).find(r => r.name === uniqName)._id;
                socket.emit('player:login', { roomId: roomId, name: 'player2', password: '' });
            });
        }, 1000);
    });

    it('starts game correctly', () => {
        socket.emit('player:ready');
        cy.get('.PrivateSwitchBase-input').click();
        cy.get('[data-testid="animated-overlay"]').should('exist');
        socket.emit('');
    });
});
