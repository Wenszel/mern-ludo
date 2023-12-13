import React from 'react';
import Dice from './Dice/Dice';
import NameContainer from './NameContainer/NameContainer';
import ReadyButton from './ReadyButton/ReadyButton';
import { PLAYER_COLORS } from '../../constants/colors';
import { useContext } from 'react';
import { PlayerDataContext } from '../../App';
import styles from './Navbar.module.css';

const Navbar = ({ players, started, time, isReady, rolledNumber, nowMoving, movingPlayer }) => {
    const context = useContext(PlayerDataContext);

    const diceProps = {
        rolledNumber,
        nowMoving,
        movingPlayer,
    };

    return (
        <>
            {players.map((player, index) => (
                <div className={`${styles.playerContainer} ${styles[PLAYER_COLORS[index]]}`} key={index}>
                    <NameContainer player={player} time={time} />
                    {started ? <Dice playerColor={PLAYER_COLORS[index]} {...diceProps} /> : null}
                    {context.color === player.color && !started ? <ReadyButton isReady={isReady} /> : null}
                </div>
            ))}
        </>
    );
};

export default Navbar;
