import React from 'react';
import NameContainer from './navbar-components/NameContainer'
import ReadyButton from './navbar-components/ReadyButton'
import './Navbar.css';
const Navbar = ( { players, started }) => {
    return(
        <div className="navbar-container">
            {players.map( (player, index) =>
                <NameContainer key={index} player = {player}/>
            )}
            {started ?  null : <ReadyButton/>}
        </div>
    );
}
export default Navbar;