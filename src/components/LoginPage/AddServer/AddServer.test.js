import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocketContext } from '../../../App';
import AddServer from './AddServer';

const mockSocket = {
    emit: jest.fn(),
};

describe('AddServer component', () => {
    it('should renders without crashing', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <AddServer />
            </SocketContext.Provider>
        );
        expect(screen.getByText('Host A Server')).toBeInTheDocument();
    });

    it('should handles form submission with valid data when private', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <AddServer />
            </SocketContext.Provider>
        );

        const serverNameInput = screen.getByPlaceholderText('Server Name');
        fireEvent.change(serverNameInput, { target: { value: 'Test Server' } });

        const privateSwitch = screen.getByRole('checkbox');
        fireEvent.click(privateSwitch);

        const passwordInput = screen.getByPlaceholderText('password');
        fireEvent.change(passwordInput, { target: { value: 'TestPassword' } });

        const hostButton = screen.getByText('Host');
        fireEvent.click(hostButton);

        expect(mockSocket.emit).toHaveBeenCalledWith('room:create', {
            name: 'Test Server',
            password: 'TestPassword',
            private: true,
        });
    });

    it('should handles form submission with valid data when not private', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <AddServer />
            </SocketContext.Provider>
        );

        const serverNameInput = screen.getByPlaceholderText('Server Name');
        fireEvent.change(serverNameInput, { target: { value: 'Test Server' } });

        const hostButton = screen.getByText('Host');
        fireEvent.click(hostButton);

        expect(mockSocket.emit).toHaveBeenCalledWith('room:create', {
            name: 'Test Server',
            password: '',
            private: false,
        });
    });

    it('should handles form submission with missing server name', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <AddServer />
            </SocketContext.Provider>
        );

        const hostButton = screen.getByText('Host');
        fireEvent.click(hostButton);

        expect(mockSocket.emit).not.toHaveBeenCalled();

        const serverNameInput = screen.getByPlaceholderText('Server Name');
        expect(serverNameInput).toHaveStyle('border: 1px solid red');
    });
});
