import React, { useContext } from 'react';
import { SocketContext } from '../../../App';
import images from '../../../constants/diceImages';

const Dice = ({ rolledNumber, nowMoving, color, movingPlayer }) => {
    const socket = useContext(SocketContext);

    const handleRoll = () => {
        socket.emit('game:roll');
    };

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
