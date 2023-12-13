import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServersTable from './ServersTable';

const mockRooms = [
    { _id: '1', name: 'Room 1', private: false, players: [], isStarted: false },
    { _id: '2', name: 'Room 2', private: true, players: [], isStarted: true },
];

describe('ServersTable component', () => {
    it('should renders without crashing', () => {
        render(<ServersTable rooms={mockRooms} handleJoinClick={() => {}} />);
        expect(screen.getByText('Server')).toBeInTheDocument();
        expect(screen.getByText('#/#')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should renders the list of rooms', () => {
        render(<ServersTable rooms={mockRooms} handleJoinClick={() => {}} />);
        expect(screen.getByText('Room 1')).toBeInTheDocument();
        expect(screen.getByText('Room 2')).toBeInTheDocument();
    });

    it('should handles join click for each room', () => {
        const handleJoinClick = jest.fn();
        render(<ServersTable rooms={mockRooms} handleJoinClick={handleJoinClick} />);

        const joinButtons = screen.getAllByText('Join');
        fireEvent.click(joinButtons[0]);

        expect(handleJoinClick).toHaveBeenCalledWith(mockRooms[0]);
    });
});
