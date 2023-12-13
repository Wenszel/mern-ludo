import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';
import { PlayerDataContext } from '../../App';

const mockPlayers = [
    { name: 'Player1', color: 'red' },
    { name: 'Player2', color: 'blue' },
];

const mockPlayerData = {
    color: 'red',
};

jest.mock('./NameContainer/NameContainer.jsx', () => () => {
    return <mock-name-container data-testid='name-container' />;
});

jest.mock('./ReadyButton/ReadyButton.jsx', () => () => {
    return <mock-ready-button data-testid='ready-button' />;
});

jest.mock('./Dice/Dice.jsx', () => () => {
    return <mock-dice data-testid='dice-container' />;
});

const setup = props => {
    props.players = mockPlayers;
    return render(
        <PlayerDataContext.Provider value={mockPlayerData}>
            <Navbar {...props} />
        </PlayerDataContext.Provider>
    );
};

describe('Navbar component', () => {
    it('should render NameContainer for each player', () => {
        setup({
            started: true,
        });
        expect(screen.getAllByTestId('name-container')).toHaveLength(mockPlayers.length);
    });

    it('should render Dice when started is true', () => {
        setup({
            started: true,
        });
        expect(screen.getAllByTestId('dice-container')).toHaveLength(mockPlayers.length);
    });

    it('should not render ReadyButton when started is true', () => {
        setup({
            started: true,
        });
        expect(screen.queryByTestId('ready-button')).toBeNull();
    });

    it('should render ReadyButton when started is false', () => {
        setup({
            started: false,
        });
        expect(screen.getByTestId('ready-button')).toBeInTheDocument();
    });

    it('does not render Dice when started is false', () => {
        setup({
            started: false,
        });
        expect(screen.queryByTestId('dice-container')).toBeNull();
    });
});
