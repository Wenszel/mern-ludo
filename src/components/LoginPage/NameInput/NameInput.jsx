import React, { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../../../App';
import './NameInput.css';
const NameInput = ({ isRoomPrivate, roomId }) => {
    const socket = useContext(SocketContext);
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordWrong, setIsPasswordWrong] = useState(false);
    const handleButtonClick = () => {
        socket.emit('player:login', { name: nickname, password: password, roomId: roomId });
    };
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
    }, []);

    return (
        <div className='name-overlay'>
            <div className='name-input-container' style={{ height: isRoomPrivate ? '100px' : '50px' }}>
                <input placeholder='Nickname' type='text' onChange={e => setNickname(e.target.value)} />
                {isRoomPrivate ? (
                    <input
                        placeholder='Room password'
                        type='text'
                        onChange={e => setPassword(e.target.value)}
                        style={{ backgroundColor: isPasswordWrong ? 'red' : null }}
                    />
                ) : null}
                <button onClick={handleButtonClick}>JOIN</button>
            </div>
        </div>
    );
};

export default NameInput;
