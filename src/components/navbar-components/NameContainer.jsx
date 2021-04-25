import React from 'react';
import './NameContainer.css';
const NameContainer = ( {player, time} ) => {
    const getRemainingTime = () => {
        return Math.floor((time - Date.now())/1000);
    }
    return (
        <div className="name-container" 
            style={ player.ready ? { backgroundColor: player.color} :  { backgroundColor: 'grey'} }>
            {player.name} 
            {player.nowMoving ? <div className="timer"> {getRemainingTime()} </div> : null}
        </div>
    )

}

export default NameContainer;