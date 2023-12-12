import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NameContainer from './NameContainer';
import { NOT_READY_COLOR } from '../../../constants/colors';

jest.mock('./AnimatedOverlay/AnimatedOverlay.jsx', () => () => {
    return <mock-animated-overlay data-testid='animated-overlay' />;
});

describe('NameContainer component', () => {
    let player;
    let time;

    beforeEach(() => {
        player = {
            name: 'TestPlayer',
            ready: false,
            color: 'blue',
            nowMoving: false,
        };
        time = 0;
    });

    it('renders without crashing', () => {
        render(<NameContainer player={player} time={time} />);
    });

    it('renders player name', () => {
        render(<NameContainer player={player} time={time} />);
        expect(screen.getByText(player.name)).toBeInTheDocument();
    });

    it('applies grey color when player is not ready', () => {
        player.ready = false;
        render(<NameContainer player={player} time={time} testId='name-container' />);
        const container = screen.getByText(player.name).closest('div');
        expect(container).toHaveStyle({ backgroundColor: NOT_READY_COLOR });
    });

    it('applies player colors as background when player is ready', () => {
        player.ready = true;
        render(<NameContainer player={player} time={time} testId='name-container' />);
        const container = screen.getByText(player.name).closest('div');
        expect(container).toHaveStyle({ backgroundColor: player.color });
    });

    it('renders AnimatedOverlay when player is nowMoving', () => {
        const movingPlayer = { ...player, nowMoving: true };
        render(<NameContainer player={movingPlayer} time={time} />);
        expect(screen.getByTestId('animated-overlay')).toBeInTheDocument();
    });

    it('does not render AnimatedOverlay when player is not nowMoving', () => {
        render(<NameContainer player={player} time={time} />);
        expect(screen.queryByTestId('animated-overlay')).toBeNull();
    });
});
