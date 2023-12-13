import React, { useState, useContext } from 'react';
import { SocketContext } from '../../../App';
import Switch from '@mui/material/Switch';
import styles from './ReadyButton.module.css';

const ReadyButton = ({ isReady }) => {
    const socket = useContext(SocketContext);
    const [checked, setChecked] = useState(isReady);

    const handleCheckboxChange = () => {
        socket.emit('player:ready');
        setChecked(!checked);
    };
    return (
        <div className={styles.container}>
            <Switch onChange={handleCheckboxChange} checked={checked || false} />
            <label>{checked ? 'I want to play' : 'Im waiting'}</label>
        </div>
    );
};

export default ReadyButton;
