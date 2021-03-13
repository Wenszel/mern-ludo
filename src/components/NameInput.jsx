import React, { useState } from 'react';
const NameInput = ()=>{
    const [inputValue, setInputValue] = useState('');
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }
    const handleButtonClick = () => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: inputValue })
        };
        fetch('localhost:3000/adduser', request)
        .then(response => {
            if(response.status == 200){
                //redirect
            }else{
                //error
            }
        });
    }
    return(
        <div>
            <input placeholder = "Podaj swoje imię" type="text" onChange={handleInputChange}/>
            <input type="submit" onClick={handleButtonClick}/>
        </div>
    )
}

export default NameInput;