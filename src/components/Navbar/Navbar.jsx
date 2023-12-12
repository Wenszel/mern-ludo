import React from 'react';
import Dice from './Dice/Dice';
import NameContainer from './NameContainer/NameContainer';
import ReadyButton from './ReadyButton/ReadyButton';
import './Navbar.css';
import { PLAYER_COLORS } from '../../constants/colors';
import { useContext } from 'react';
import { PlayerDataContext } from '../../App';

const Navbar = ({ players, started, time, isReady, rolledNumber, nowMoving, movingPlayer }) => {
    const context = useContext(PlayerDataContext);

    return (
        <>
            {players.map((player, index) => (
                <div className={`player-container ${PLAYER_COLORS[index]}`} key={index}>
                    <NameContainer player={player} time={time} />
                    <Dice
                        movingPlayer={movingPlayer}
                        rolledNumber={rolledNumber}
                        nowMoving={nowMoving}
                        color={PLAYER_COLORS[index]}
                    />
                    {context.color === player.color || (!started && <ReadyButton isReady={isReady} />)}
                </div>
            ))}
        </>
    );
};

export default Navbar;
