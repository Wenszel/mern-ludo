import React, { useState, useContext } from 'react';
import { SocketContext } from '../../../App';
import './NameInput.css';
const NameInput = () => {
    const socket = useContext(SocketContext);
    const [inputValue, setInputValue] = useState('');
    const handleInputChange = e => {
        setInputValue(e.target.value);
    };
    const handleButtonClick = () => {
        socket.emit('player:login', { name: inputValue });
    };
    return (
        <div className="name-input-container">
            <input placeholder='Enter name' type='text' onChange={handleInputChange} />
            <button onClick={handleButtonClick}>JOIN</button>
        </div>
    );
};

export default NameInput;
