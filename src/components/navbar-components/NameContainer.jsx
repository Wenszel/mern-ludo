import React from 'react';
import './NameContainer.css'
const NameContainer = ( {player} ) => {
    return (
        <div className="name-container" 
            style={ player.ready ? { backgroundColor: player.color} :  { backgroundColor: 'grey'} }>
             {player.name} 
        </div>
    )

}

export default NameContainer;