import React, { useState } from 'react';
import axios from 'axios';

const NameInput = ({ idCallback }) => {
    const [inputValue, setInputValue] = useState('');
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleButtonClick = () => {
        axios.post('http://localhost:3000/room/add',{
            name: inputValue
        },{
            withCredentials:true,
            "Content-Type": "application/json" 
        })
        .then(response => {
            console.log(response.data);
            idCallback(response.data);
        })
    }
    return(
        <div>
            <input placeholder = "Enter name" type="text" onChange={handleInputChange}/>
            <input type="submit" onClick={handleButtonClick}/>
        </div>
    )
}

export default NameInput;