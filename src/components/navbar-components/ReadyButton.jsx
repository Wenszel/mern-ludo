import React, { useState } from 'react';
import Switch from '@material-ui/core/Switch';
import axios from 'axios';

const ReadyButton = () => {

    const [checked, setChecked] = useState(false)

    const handleCheckboxChange = () => {
        axios.post('http://localhost:3000/player/ready',{},{withCredentials: true});
        setChecked(!checked);
    }
    
    return(
    <div className="ready-container"> 
        <Switch onClick={handleCheckboxChange} checked={checked}/>
        <label>{checked ? 'I want to play' : 'Im waiting' }</label>
    </div>
    )

}

export default ReadyButton;