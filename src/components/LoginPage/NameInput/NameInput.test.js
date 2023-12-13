import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NameInput from './NameInput';
import { SocketContext } from '../../../App';

const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
};

describe('NameInput component', () => {
    it('should renders password field when room is private', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <NameInput isRoomPrivate={true} />
            </SocketContext.Provider>
        );
        expect(screen.getByPlaceholderText('Room password')).toBeInTheDocument();
    });

    it('should not renders password field when room is not private', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <NameInput isRoomPrivate={false} />
            </SocketContext.Provider>
        );
        expect(screen.queryByPlaceholderText('Room password')).not.toBeInTheDocument();
    });

    it('should handles input change', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <NameInput isRoomPrivate={false} />
            </SocketContext.Provider>
        );
        const nicknameInput = screen.getByPlaceholderText('Nickname');
        fireEvent.change(nicknameInput, { target: { value: 'TestName' } });
        expect(nicknameInput.value).toBe('TestName');
    });

    it('should handles password change', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <NameInput isRoomPrivate={true} />
            </SocketContext.Provider>
        );
        const passwordInput = screen.getByPlaceholderText('Room password');
        fireEvent.change(passwordInput, { target: { value: 'TestPassword' } });
        expect(passwordInput.value).toBe('TestPassword');
    });

    it('should handles button click', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <NameInput isRoomPrivate={true} roomId={123} />
            </SocketContext.Provider>
        );
        const nicknameInput = screen.getByPlaceholderText('Nickname');
        fireEvent.change(nicknameInput, { target: { value: 'TestName' } });
        const passwordInput = screen.getByPlaceholderText('Room password');
        fireEvent.change(passwordInput, { target: { value: 'TestPassword' } });
        const button = screen.getByText('JOIN');
        fireEvent.click(button);
        expect(mockSocket.emit).toHaveBeenCalledWith('player:login', {
            name: 'TestName',
            password: 'TestPassword',
            roomId: 123,
        });
    });

    it('should handles Enter key press', () => {
        render(
            <SocketContext.Provider value={mockSocket}>
                <NameInput isRoomPrivate={true} roomId={123} />
            </SocketContext.Provider>
        );
        const nicknameInput = screen.getByPlaceholderText('Nickname');
        fireEvent.change(nicknameInput, { target: { value: 'TestName' } });
        const passwordInput = screen.getByPlaceholderText('Room password');
        fireEvent.change(passwordInput, { target: { value: 'TestPassword' } });
        fireEvent.keyDown(nicknameInput, { key: 'Enter' });
        expect(mockSocket.emit).toHaveBeenCalledWith('player:login', {
            name: 'TestName',
            password: 'TestPassword',
            roomId: 123,
        });
    });
});
