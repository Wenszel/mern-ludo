import React from 'react';
import PropTypes from 'prop-types';
import AnimatedOverlay from './AnimatedOverlay';

const NameContainer = ({ player, time }) => {
    return (
        <div
            className='name-container'
            style={player.ready ? { backgroundColor: player.color } : { backgroundColor: 'lightgrey' }}
        >
            <p>{player.name}</p>
            {player.nowMoving ? <AnimatedOverlay time={time} /> : null}
        </div>
    );
};

NameContainer.propTypes = {
    player: PropTypes.object,
    time: PropTypes.number,
};

export default NameContainer;
