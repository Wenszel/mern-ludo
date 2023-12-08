import React, { useMemo } from 'react';
import { CSSTransition } from 'react-transition-group';
import './TimerAnimation.js';

const AnimatedOverlay = ({ time }) => {
    const animationDelay = useMemo(() => 15 - Math.ceil((time - Date.now()) / 1000), [time]);

    return (
        <CSSTransition
            in={true}
            timeout={0}
            classNames='overlay'
            style={{ animationDelay: `-${animationDelay}s` }}
            unmountOnExit
        >
            <div className='overlay'></div>
        </CSSTransition>
    );
};

export default AnimatedOverlay;
