import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import { SocketContext } from '../../App';
import Switch from '@material-ui/core/Switch';

const ReadyButton = ({ isReady }) => {
    const socket = useContext(SocketContext);
    const [checked, setChecked] = useState();
    const handleCheckboxChange = () => {
        socket.emit('player:ready');
        setChecked(!checked);
    };
    useEffect(() => {
        setChecked(isReady);
    });
    return (
        <div className='ready-container'>
            <Switch onChange={handleCheckboxChange} checked={checked || false} />
            <label>{checked ? 'I want to play' : 'Im waiting'}</label>
        </div>
    );
};

export default ReadyButton;
