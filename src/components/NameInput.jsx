import React, { useState } from 'react';
import axios from 'axios';

const NameInput = () => {
    const [inputValue, setInputValue] = useState('');
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleButtonClick = () => {
        axios.post('http://localhost:3000/room/add')
    }
    return(
        <div>
            <input placeholder = "Enter name" type="text" onChange={handleInputChange}/>
            <input type="submit" onClick={handleButtonClick}/>
        </div>
    )
}

export default NameInput;