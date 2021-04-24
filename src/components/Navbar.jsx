import React from 'react';
import NameContainer from './navbar-components/NameContainer'
import ReadyButton from './navbar-components/ReadyButton'
import './Navbar.css';
const Navbar = ( { players }) => {
    return(
        <div className="navbar-container">
            {players.map( (player, index) =>
                <NameContainer key={index} player = {player}/>
            )}
            <ReadyButton/>
        </div>
    );
}
export default Navbar;