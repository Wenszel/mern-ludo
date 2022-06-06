import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../App';
import one from '../../images/dice/1.png';
import two from '../../images/dice/2.png';
import three from '../../images/dice/3.png';
import four from '../../images/dice/4.png';
import five from '../../images/dice/5.png';
import six from '../../images/dice/6.png';
import roll from '../../images/dice/roll.png';

const Dice = ({ rolledNumberCallback, rolledNumber, nowMoving, color, movingPlayer }) => {
    const socket = useContext(SocketContext);
    const [images] = useState([one, two, three, four, five, six, roll]);
    const handleRoll = () => {
        socket.emit('game:roll');
    };
    useEffect(() => {
        socket.on('game:roll', number => {
            rolledNumberCallback(number);
        });
    }, []);
    return (
        <div className={`dice-container dice-${color}`}>
            {movingPlayer === color ? (
                rolledNumber ? (
                    <img src={images[rolledNumber - 1]} alt={rolledNumber} width='100' height='100' />
                ) : nowMoving ? (
                    <img src={images[6]} className='roll' alt='roll' width='100' height='100' onClick={handleRoll} />
                ) : null
            ) : null}
        </div>
    );
};
export default Dice;
