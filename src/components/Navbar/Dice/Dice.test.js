import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dice from './Dice';
import { SocketContext } from '../../../App';

const mockSocket = {
    emit: jest.fn(),
};

describe('Dice component', () => {
    let props;
    const MOVING_PLAYER = 'blue';
    const NOT_MOVING_PLAYER = 'red';
    const THIS_PLAYER_MOVING = true;
    
    beforeEach(() => {
        props = {
            rolledNumber: null,
            nowMoving: false,
            playerColor: '',
            movingPlayer: '',
        };
    });

    it('should render correct rolledNumber next to moving player', () => {
        props.rolledNumber = 5;
        props.movingPlayer = MOVING_PLAYER;
        props.playerColor = MOVING_PLAYER;
        render(<Dice {...props} />);
        expect(screen.queryByAltText(props.rolledNumber)).toBeInTheDocument();
    });

    it('should not render rolledNumber next to not moving player', () => {
        props.rolledNumber = 5;
        props.movingPlayer = MOVING_PLAYER;
        props.playerColor = NOT_MOVING_PLAYER;
        render(<Dice {...props} />);
        expect(screen.queryByAltText(props.rolledNumber)).not.toBeInTheDocument();
    });

    it('should render roll icon next to moving player', () => {
        props.rolledNumber = null;
        props.movingPlayer = MOVING_PLAYER;
        props.playerColor = MOVING_PLAYER;
        props.nowMoving = THIS_PLAYER_MOVING;
        render(<Dice {...props} />);
        expect(screen.queryByAltText('roll')).toBeInTheDocument();
    });

    it('should not render roll icon next to not moving player', () => {
        props.rolledNumber = null;
        props.movingPlayer = MOVING_PLAYER;
        props.playerColor = MOVING_PLAYER;
        props.nowMoving = !THIS_PLAYER_MOVING;
        render(<Dice {...props} />);
        expect(screen.queryByAltText('roll')).not.toBeInTheDocument();
    });

    it('should send data on click', () => {
        props.rolledNumber = null;
        props.movingPlayer = MOVING_PLAYER;
        props.playerColor = MOVING_PLAYER;
        props.nowMoving = THIS_PLAYER_MOVING;
        render(
            <SocketContext.Provider value={mockSocket}>
                <Dice {...props} />
            </SocketContext.Provider>
        );
        const dice = screen.getByAltText('roll');
        fireEvent.click(dice);
        expect(mockSocket.emit).toHaveBeenCalledWith('game:roll');
    });
});
