import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { SocketContext } from '../../App';

/*
    Component responsible for:
    - displaying the player's name
    - informing players about the readiness of other players by changing the color of container from gray to the player's color
    - counting time to the end of the move 

    Props: 
    - player (object):
        The player to whom the container belongs
        Player's properties used in this component:
            - ready (boolean):
                is the player ready for the start of the game, if so, change color from gray to the player's color
                when the game is started all players are ready not matter if they clicked ready button before
            - nowMoving (boolean) is this player move now, if true display timer
            - name (string)
    - time (number) - time remaining until the move is made in milliseconds
*/

const NameContainer = ({ player, time }) => {
    const [remainingTime, setRemainingTime] = useState();
    const socket = useContext(SocketContext);

    // Function responsible for counting down to the end of time every second
    const countdown = () => {
        // If the time if over emit information to server
        if (remainingTime <= 0) {
            return socket.emit('game:skip');
        }
        setRemainingTime(Math.ceil((time - Date.now()) / 1000));
    };

    useEffect(() => {
        // Starts the countdown from the beginning if the server returned information about skipping the turn
        socket.on('game:skip', () => {
            setRemainingTime(15);
        });
        setRemainingTime(Math.ceil((time - Date.now()) / 1000));
        const interval = setInterval(countdown, 1000);
        return () => clearInterval(interval);
    }, [countdown]);

    return (
        <div
            className='name-container'
            style={player.ready ? { backgroundColor: player.color } : { backgroundColor: 'lightgrey' }}
        >
            <p>{player.name}</p>
            {player.nowMoving ? <div className='timer'> {remainingTime} </div> : null}
        </div>
    );
};

NameContainer.propTypes = {
    player: PropTypes.object,
    time: PropTypes.number,
};

export default NameContainer;
