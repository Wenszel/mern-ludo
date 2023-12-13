import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedOverlay from './AnimatedOverlay';

describe('AnimatedOverlay component', () => {
    it('renders without crashing', () => {
        render(<AnimatedOverlay time={0} />);
    });

    it('applies animation delay based on time prop', () => {
        const timeNow = Date.now();
        const time = timeNow + 5000;
        render(<AnimatedOverlay time={time} />);
        const overlay = screen.getByTestId('animated-overlay');
        const expectedDelay = 15 - Math.ceil((time - timeNow) / 1000);

        expect(overlay).toHaveStyle({ animationDelay: `-${expectedDelay}s` });
    });
});
