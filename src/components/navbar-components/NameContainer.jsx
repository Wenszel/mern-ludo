import React from 'react';
import './NameContainer.css'
const NameContainer = ( {player} ) => {
    
    return (
        <div className="name-container" style={{backgroundColor: player.color}}>
             {player.name} 
        </div>
    )

}

export default NameContainer;