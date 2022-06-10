import React from 'react';
import Dice from './game-board-components/Dice';
import NameContainer from './navbar-components/NameContainer';
import ReadyButton from './navbar-components/ReadyButton';
import './Navbar.css';

const Navbar = ({ players, started, time, isReady, rolledNumber, nowMoving, rolledNumberCallback, movingPlayer }) => {
    const colors = ['red', 'blue', 'green', 'yellow'];
    return (
        <div className='navbar-container'>
            {players.map((player, index) => (
                <div className={`player-container ${colors[index]}`} key={index}>
                    <NameContainer player={player} time={time} />
                    <Dice
                        movingPlayer={movingPlayer}
                        rolledNumber={rolledNumber}
                        nowMoving={nowMoving}
                        color={colors[index]}
                        rolledNumberCallback={rolledNumberCallback}
                    />
                </div>
            ))}
            {started ? null : <ReadyButton isReady={isReady} />}
        </div>
    );
};
export default Navbar;
