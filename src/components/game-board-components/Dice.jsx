import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../App';
import one from '../../images/dice/1.png';
import two from '../../images/dice/2.png';
import three from '../../images/dice/3.png';
import four from '../../images/dice/4.png';
import five from '../../images/dice/5.png';
import six from '../../images/dice/6.png';

const Dice = ({ rolledNumberCallback, nowMoving }) => {
    const socket = useContext(SocketContext);
    const [rolledNumber, setRolledNumber] = useState();
    const [images] = useState([one, two, three, four, five, six]);
    const handleRoll = () => {
        socket.emit('game:roll');
    };
    useEffect(() => {
        socket.on('game:roll', number => {
            const utterance = new SpeechSynthesisUtterance(number);
            speechSynthesis.speak(utterance);
            setRolledNumber(number);
            rolledNumberCallback(number);
        });
    }, []);
    return (
        <div className='dice-container'>
            {rolledNumber ? (
                <img src={images[rolledNumber - 1]} alt={rolledNumber} width='100' height='100' />
            ) : nowMoving ? (
                <button onClick={handleRoll}> Roll </button>
            ) : null}
        </div>
    );
};
export default Dice;
