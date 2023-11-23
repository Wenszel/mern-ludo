import React, { useEffect, useState, createContext } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import ReactLoading from 'react-loading';
import Gameboard from './components/Gameboard';
import LoginPage from './components/LoginPage/LoginPage';

export const PlayerDataContext = createContext();
export const SocketContext = createContext();

function App() {
    const [playerData, setPlayerData] = useState();
    const [playerSocket, setPlayerSocket] = useState();
    const [redirect, setRedirect] = useState();

    useEffect(() => {
        const socket = io('http://localhost:8080', { withCredentials: true });
        socket.on('player:data', data => {
            data = JSON.parse(data);
            setPlayerData(data);
            data.roomId != null ? setRedirect(true) : setRedirect(false);
        });
        setPlayerSocket(socket);
    }, []);

    return (
        <SocketContext.Provider value={playerSocket}>
            <Router>
                {redirect ? <Redirect to='/game' /> : <Redirect to='/login' />}
                <Switch>
                    <Route exact path='/'>
                        LOADING...
                    </Route>
                    <Route path='/login'>
                        {playerSocket ? (
                            <LoginPage />
                        ) : (
                            <ReactLoading type='spinningBubbles' color='white' height={667} width={375} />
                        )}
                    </Route>
                    <Route path='/game'>
                        {playerData ? (
                            <PlayerDataContext.Provider value={playerData}>
                                <Gameboard />
                            </PlayerDataContext.Provider>
                        ) : null}
                    </Route>
                </Switch>
            </Router>
        </SocketContext.Provider>
    );
}

export default App;
