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
    <div>
        <label>Ready: </label>
        <Switch onClick={handleCheckboxChange} checked={checked}/>
    </div>
    )

}

export default ReadyButton;