import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './LoginPage';

jest.mock('./JoinServer/JoinServer', () => () => <div data-testid="join-server" />);
jest.mock('./AddServer/AddServer', () => () => <div data-testid="add-server" />);

describe('LoginPage component', () => {
  it('should renders JoinServer component ', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('join-server')).toBeInTheDocument();
  });

  it('should renders AddServer component', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('add-server')).toBeInTheDocument();
  });
});
