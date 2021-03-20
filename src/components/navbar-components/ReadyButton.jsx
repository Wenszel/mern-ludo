import React, { useState } from 'react';
import axios from 'axios';
const ReadyButton = ( {ready} ) => {
    const [checked, setChecked] = useState(ready);

    const handleCheckboxChange = () => {
        axios.post('http://localhost:3000/player/ready',{},{withCredentials: true});
        setChecked(state => state = !checked);
    }
    
    return(
    <>
        <label>Ready: </label>
        <input type="checkbox" onClick={handleCheckboxChange} checked={checked}/>
    </>
    )

}

export default ReadyButton;