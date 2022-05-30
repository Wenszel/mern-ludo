import React, { useState, useContext } from 'react';
import { SocketContext } from '../../App';
import Switch from '@material-ui/core/Switch';

const ReadyButton = () => {
    const socket = useContext(SocketContext);
    const [checked, setChecked] = useState(false);

    const handleCheckboxChange = () => {
        socket.emit('player:ready');
        setChecked(!checked);
    };

    return (
        <div className='ready-container'>
            <Switch onClick={handleCheckboxChange} checked={checked} />
            <label>{checked ? 'I want to play' : 'Im waiting'}</label>
        </div>
    );
};

export default ReadyButton;
