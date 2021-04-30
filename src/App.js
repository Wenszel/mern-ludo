import React, { useEffect, useState, createContext } from 'react';
import axios from 'axios';

import { Beforeunload } from 'react-beforeunload';
import { BrowserRouter as Router , Route , Redirect, Switch } from 'react-router-dom';

import Gameboard  from './components/Gameboard'
import NameInput from './components/NameInput';

export const PlayerDataContext = createContext();

function App() {
  const [playerData, setPlayerData] = useState();
  const [redirect, setRedirect] = useState();

  useEffect(() => {
    axios.get('http://localhost:3000/player', {
      withCredentials:true,
    })
    .then(response => {
      setPlayerData(response.data)
      response.data.roomId!=null ? setRedirect(true) : setRedirect(false);
    });
  },[]);

  const handleExit = e => {
    e.preventDefault();
    window.addEventListener('unload', () => {
      axios.post('http://localhost:3000/player/exit', {withCredentials:true, })
    });
    } 
  
  const idCallback = () => {
    axios.get('http://localhost:3000/player/', {
      withCredentials:true,
    })
    .then(response => {
      setPlayerData(response.data);
      console.log(response.data);
      setRedirect(true);
    })
  }

  return (
    <Router>
      {redirect ?  <Redirect to="/game"/> : <Redirect to="/login"/>}
      <Switch>
        <Route exact path = "/">
          LOADING...
        </Route>
          <Route path="/login">
            <NameInput idCallback = {idCallback}/>
          </Route>
          <Route path="/game">
            {playerData ? 
            <Beforeunload onBeforeunload={handleExit}>
              <PlayerDataContext.Provider value={playerData}>
                <Gameboard/>
              </PlayerDataContext.Provider>
            </Beforeunload> : null}
          </Route>
        </Switch>
    </Router>
  );
}

export default App;
