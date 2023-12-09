import React, { useState, useContext, useEffect, useCallback } from 'react';
import { SocketContext } from '../../../App';
import useInput from '../../../hooks/useInput';
import './NameInput.css';
import Overlay from '../../Overlay/Overlay';

const NameInput = ({ isRoomPrivate, roomId }) => {
    const socket = useContext(SocketContext);
    const nickname = useInput('');
    const password = useInput('');
    const [isPasswordWrong, setIsPasswordWrong] = useState(false);

    const handleButtonClick = useCallback(() => {
        socket.emit('player:login', { name: nickname.value, password: password.value, roomId: roomId });
    }, [socket, nickname.value, password.value, roomId]);

    useEffect(() => {
        socket.on('error:wrongPassword', () => {
            setIsPasswordWrong(true);
        });
        const keyDownHandler = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleButtonClick();
            }
        };
        document.addEventListener('keydown', keyDownHandler);
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, [socket, handleButtonClick]);

    return (
        <div className='name-overlay'>
            <div className='name-input-container' style={{ height: isRoomPrivate ? '100px' : '50px' }}>
                <input placeholder='Nickname' type='text' onChange={nickname.onChange} />
                {isRoomPrivate ? (
                    <input
                        placeholder='Room password'
                        type='text'
                        onChange={password.onChange}
                        style={{ backgroundColor: isPasswordWrong ? 'red' : null }}
                    />
                ) : null}
                <button onClick={handleButtonClick}>JOIN</button>
            </div>
        </div>
    );
};

export default NameInput;
