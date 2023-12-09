import React, { useState, useContext, useEffect } from 'react';
import './AddServer.css';
import Switch from '@mui/material/Switch';
import { SocketContext } from '../../../App';
const AddServer = () => {
    const socket = useContext(SocketContext);
    const [isPrivate, setIsPrivate] = useState(false);
    const [serverName, setServerName] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        socket.on('room:created', () => {
            socket.emit('room:rooms');
        });
    }, [socket]);

    const handleButtonClick = e => {
        e.preventDefault();
        socket.emit('room:create', {
            name: serverName,
            private: isPrivate,
            password: password,
        });
    };

    return (
        <div className='lp-container'>
            <div className='title-container'>
                <h1>Host A Server</h1>
            </div>
            <div className='content-container'>
                <form>
                    <input
                        type='text'
                        value={serverName}
                        onChange={e => setServerName(e.target.value)}
                        placeholder='Server Name'
                    />
                    <div className='private-container'>
                        <p>Private</p>
                        <Switch checked={isPrivate} color='primary' onChange={() => setIsPrivate(!isPrivate)} />
                    </div>
                    <input
                        type='text'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder='password'
                        disabled={!isPrivate}
                    />
                    <button onClick={handleButtonClick}>Host</button>
                </form>
            </div>
        </div>
    );
};

export default AddServer;
