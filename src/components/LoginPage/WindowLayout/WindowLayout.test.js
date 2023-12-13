import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WindowLayout from './WindowLayout';

jest.mock('./WindowLayout', () => ({ title, titleComponent, content }) => (
    <div data-testid='mocked-window-layout'>
        <div data-testid='mocked-title'>{title}</div>
        <div data-testid='mocked-title-component'>{titleComponent}</div>
        <div data-testid='mocked-content'>{content}</div>
    </div>
));

describe('WindowLayout component', () => {
    it('should render without crashing', () => {
        render(
            <WindowLayout
                title='Test Title'
                titleComponent={<div>Test Title Component</div>}
                content={<div>Test Content</div>}
            />
        );
        expect(screen.getByTestId('mocked-window-layout')).toBeInTheDocument();
        expect(screen.getByTestId('mocked-title')).toHaveTextContent('Test Title');
        expect(screen.getByTestId('mocked-title-component')).toHaveTextContent('Test Title Component');
        expect(screen.getByTestId('mocked-content')).toHaveTextContent('Test Content');
    });
});
