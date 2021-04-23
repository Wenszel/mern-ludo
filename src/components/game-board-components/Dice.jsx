import React, { useState } from 'react';
import axios from 'axios';
import one from '../../images/dice/1.png';
import two from '../../images/dice/2.png';
import three from '../../images/dice/3.png';
import four from '../../images/dice/4.png';
import five from '../../images/dice/5.png';
import six from '../../images/dice/6.png';
const Dice = () => {
    const [rolledNumber, setRolledNumber] = useState()
    const [images] = useState([one, two, three, four, five, six]);
    const handleRoll = () => {
        
        axios.get('http://localhost:3000/game/roll').then(response => {
            const utterance = new SpeechSynthesisUtterance(response.data.number);
            speechSynthesis.speak(utterance);
            setRolledNumber(response.data.number);
        })
    }
    return(
        <div>
            {rolledNumber ? <img src={images[rolledNumber - 1]} width="100" height="100"/> : null }
            <button onClick={handleRoll}>Roll number</button>
        </div>
    )
}
export default Dice;