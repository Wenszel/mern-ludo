import React, { useContext } from 'react';
import { SocketContext } from '../../../App';
import images from '../../../constants/diceImages';
import styles from './Dice.module.css';

const Dice = ({ rolledNumber, nowMoving, playerColor, movingPlayer }) => {
    const socket = useContext(SocketContext);

    const handleClick = () => {
        socket.emit('game:roll');
    };

    const isCurrentPlayer = movingPlayer === playerColor;
    const hasRolledNumber = rolledNumber !== null;

    return (
        <div className={styles.container}>
            {isCurrentPlayer &&
                (hasRolledNumber ? (
                    <img src={images[rolledNumber - 1]} alt={rolledNumber} />
                ) : (
                    nowMoving && <img src={images[6]} alt='roll' onClick={handleClick} />
                ))}
        </div>
    );
};

export default Dice;
