import React from 'react';

const NameContainer = ({ player, time, color }) => {
    const getRemainingTime = () => {
        return Math.round((time - Date.now()) / 1000) + 1;
    };
    return (
        <div
            className={`name-container ${color}`}
            style={player.ready ? { backgroundColor: color } : { backgroundColor: 'lightgrey' }}
        >
            {player.name}
            {player.nowMoving ? <div className='timer'> {getRemainingTime()} </div> : null}
        </div>
    );
};

export default NameContainer;
