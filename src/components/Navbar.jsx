import React from 'react';
import NameContainer from './navbar-components/NameContainer';
import ReadyButton from './navbar-components/ReadyButton';
import './Navbar.css';

const Navbar = ({ players, started, time, isReady }) => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    return (
        <div className='navbar-container'>
            {players.map((player, index) => (
                <NameContainer key={index} player={player} color={colors[index]} time={time} />
            ))}
            {started ? null : <ReadyButton isReady={isReady} />}
        </div>
    );
};
export default Navbar;
