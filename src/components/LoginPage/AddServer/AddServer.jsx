import React, { useState, useContext } from 'react';
import Switch from '@mui/material/Switch';
import { SocketContext } from '../../../App';
import WindowLayout from '../WindowLayout/WindowLayout';
import useInput from '../../../hooks/useInput';
import styles from './AddServer.module.css';

const AddServer = () => {
    const socket = useContext(SocketContext);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const serverName = useInput('');
    const password = useInput('');

    const handleButtonClick = e => {
        e.preventDefault();
        if (!serverName.value) setIsIncorrect(true);
        else
            socket.emit('room:create', {
                name: serverName.value,
                password: password.value,
                private: isPrivate,
            });
    };

    return (
        <WindowLayout
            title='Host A Server'
            content={
                <form className={styles.formContainer}>
                    <input
                        type='text'
                        placeholder='Server Name'
                        {...serverName}
                        style={{
                            border: isIncorrect ? '1px solid red' : '1px solid white',
                        }}
                    />
                    <div className={styles.privateContainer}>
                        <label>Private</label>
                        <Switch checked={isPrivate} color='primary' onChange={() => setIsPrivate(!isPrivate)} />
                    </div>
                    <input type='text' placeholder='password' disabled={!isPrivate} {...password} />
                    <button onClick={handleButtonClick}>Host</button>
                </form>
            }
        />
    );
};

export default AddServer;
