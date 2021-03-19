import React from 'react';
import axios from 'axios';
const ReadyButton = () => {

    const handleCheckboxChange = () => {
        axios.post('http://localhost:3000/player/ready',{},{withCredentials: true});
    }
    
    return(
    <>
        <label>Ready: </label>
        <input type="checkbox" onClick={handleCheckboxChange}/>
    </>
    )

}

export default ReadyButton;