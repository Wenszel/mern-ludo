import React from 'react';
import NameContainer from './navbar-components/NameContainer'
import ReadyButton from './navbar-components/ReadyButton'

const Navbar = ({ players, started, time }) => {
    return(
        <div className = "navbar-container">
            {players.map((player, index) =>
                <NameContainer key = {index} player = {player} time = {time}/>
            )}
            {started ?  null : <ReadyButton/>}
        </div>
    );
}
export default Navbar;