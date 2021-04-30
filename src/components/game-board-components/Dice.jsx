import React, { useState } from 'react';
import axios from 'axios';
import one from '../../images/dice/1.png';
import two from '../../images/dice/2.png';
import three from '../../images/dice/3.png';
import four from '../../images/dice/4.png';
import five from '../../images/dice/5.png';
import six from '../../images/dice/6.png';

const Dice = ({ rolledNumberCallback, nowMoving }) => {
    const [rolledNumber, setRolledNumber] = useState();
    const [images] = useState([one, two, three, four, five, six]);
    const handleRoll = () => {
        axios.get('http://localhost:3000/game/roll', {withCredentials: true}).then(response => {
            const utterance = new SpeechSynthesisUtterance(response.data.number);
            speechSynthesis.speak(utterance);
            setRolledNumber(response.data.number);
            rolledNumberCallback(response.data.number);
        })
    }
    return(
        <div className="dice-container">
            {rolledNumber ? <img src={images[rolledNumber - 1]} width="100" height="100"/> : nowMoving ? <button onClick={handleRoll}> Roll </button> : null}
        </div>
    )
}
export default Dice;