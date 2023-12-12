import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReadyButton from './ReadyButton';
import { SocketContext } from '../../../App';

const mockSocket = {
    emit: jest.fn(),
};

describe('ReadyButton component', () => {
    it('renders without crashing', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <ReadyButton isReady={false} />
            </SocketContext.Provider>
        );
    });

    it('emits "player:ready" event and toggles switch on change', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <ReadyButton isReady={false} />
            </SocketContext.Provider>
        );

        const switchElement = screen.getByRole('checkbox');
        fireEvent.click(switchElement);

        expect(mockSocket.emit).toHaveBeenCalledWith('player:ready');
        expect(switchElement).toBeChecked();
    });

    it('displays correct label when switch is checked', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <ReadyButton isReady={true} />
            </SocketContext.Provider>
        );

        const labelElement = screen.getByText('I want to play');
        expect(labelElement).toBeInTheDocument();
    });

    it('displays correct label when switch is not checked', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <ReadyButton isReady={false} />
            </SocketContext.Provider>
        );

        const labelElement = screen.getByText('Im waiting');
        expect(labelElement).toBeInTheDocument();
    });
});
