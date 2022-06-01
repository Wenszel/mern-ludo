import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../App';
const NameContainer = ({ player, time, color }) => {
    const [remainingTime, setRemainingTime] = useState();
    const socket = useContext(SocketContext);

    const countdown = () => {
        if (remainingTime <= 0) {
            socket.emit('game:skip');
        } else {
            setRemainingTime(Math.ceil((time - Date.now()) / 1000));
        }
    };
    useEffect(() => {
        socket.on('game:skip', () => {
            setRemainingTime(15);
        });
        const interval = setInterval(countdown, 1000);
        return () => clearInterval(interval);
    }, [countdown]);
    return (
        <div
            className={`name-container ${color}`}
            style={player.ready ? { backgroundColor: color } : { backgroundColor: 'lightgrey' }}
        >
            <p>{player.name}</p>
            {player.nowMoving ? <div className='timer'> {remainingTime} </div> : null}
        </div>
    );
};

export default NameContainer;
