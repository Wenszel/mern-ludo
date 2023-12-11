import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import Overlay from './Overlay';
import userEvent from '@testing-library/user-event';

describe('Overlay component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders Overlay component', () => {
        const { container } = render(<Overlay handleOverlayClose={() => {}} />);
        expect(container).toBeInTheDocument();
    });

    it('renders children inside Overlay', () => {
        const { getByTestId } = render(
            <Overlay handleOverlayClose={() => {}}>
                <div data-testid='test-child' />
            </Overlay>
        );
        expect(getByTestId('test-child')).toBeInTheDocument();
    });

    it('calls handleOverlayClose on Escape key press', async () => {
        const handleOverlayCloseMock = jest.fn();
        render(<Overlay handleOverlayClose={handleOverlayCloseMock} />);

        await userEvent.type(document.body, '{Escape}');

        expect(handleOverlayCloseMock).toHaveBeenCalled();
    });
});
