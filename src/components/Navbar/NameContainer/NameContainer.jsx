import React from 'react';
import PropTypes from 'prop-types';
import AnimatedOverlay from './AnimatedOverlay/AnimatedOverlay';
import styles from './NameContainer.module.css';

const NameContainer = ({ player, time }) => {
    return (
        <div className={styles.container} style={{ backgroundColor: player.ready ? player.color : 'lightgrey' }}>
            <p>{player.name}</p>
            {player.nowMoving ? <AnimatedOverlay time={time} /> : null}
        </div>
    );
};

NameContainer.propTypes = {
    player: PropTypes.object,
    time: PropTypes.number,
    testId: PropTypes.string,
};

export default NameContainer;
