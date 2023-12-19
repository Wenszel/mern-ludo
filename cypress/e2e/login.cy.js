describe('login', () => {
    it('should change color of input if the server name is invalid', () => {
        cy.visit('http://localhost:3000');
        cy.get('button:contains("Host")').click();
        cy.get('[placeholder="Server Name"]').should('have.css', 'border-color', 'rgb(255, 0, 0)');
    });
    
    it('should redirect user to game when filling inputs correctly', () => {
        cy.visit('http://localhost:3000');
        const uniqName = Date.now().toString();
        cy.get('[placeholder="Server Name"]').type(uniqName);
        cy.get('.PrivateSwitchBase-input').click();
        cy.get('[placeholder="password"]').type('123456');
        cy.get('button:contains("Host")').click();
        const room = cy
            .contains(`${uniqName}`)
            .should('exist')
            .then($room => {
                cy.wrap($room).scrollIntoView();
            });
        room.closest('tr').find('button:contains("Join")').click();
        cy.get('[placeholder="Nickname"]').type('player1');
        const e = cy.get('[placeholder="Room password"]').type('123456');
        e.type('{enter}');
        cy.url().should('include', '/game');
        cy.contains('player1').should('exist');
        cy.get('canvas').should('exist');
    });
});
