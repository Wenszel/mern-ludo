import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import './TimerAnimation.js';

const AnimatedOverlay = ({ time }) => {
    const [animationDelay, setAnimationDelay] = useState();

    useEffect(() => {
        setAnimationDelay(15 - Math.ceil((time - Date.now()) / 1000));
    }, [time]);

    return (
        <CSSTransition
            in={true}
            timeout={0}
            classNames='overlay'
            style={{ 'animation-delay': `-${animationDelay}s` }}
            unmountOnExit
        >
            <div className='overlay'></div>
        </CSSTransition>
    );
};

export default AnimatedOverlay;
