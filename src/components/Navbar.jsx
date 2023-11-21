import React from 'react';
import Dice from './game-board-components/Dice';
import NameContainer from './navbar-components/NameContainer';
import ReadyButton from './navbar-components/ReadyButton';
import './Navbar.css';
import { useContext } from 'react';
import { PlayerDataContext } from '../App';
const Navbar = ({ players, started, time, isReady, rolledNumber, nowMoving, rolledNumberCallback, movingPlayer }) => {
    const context = useContext(PlayerDataContext);
    const colors = ['red', 'blue', 'green', 'yellow'];
    return (
        <>
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
                    {context.color !== player.color || started ? null : <ReadyButton isReady={isReady} />}
                </div>
            ))}
        </>
    );
};
export default Navbar;
