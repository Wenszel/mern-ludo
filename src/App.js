import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Beforeunload } from 'react-beforeunload';
import { BrowserRouter as Router , Route , Redirect, Switch } from 'react-router-dom';

import Gameboard  from './components/Gameboard'
import Navbar from './components/Navbar'
import NameInput from './components/NameInput';

function App() {

  const [id, setId] = useState('')
  const [redirect, setRedirect] = useState()

  useEffect(() => {
    axios.get('http://localhost:3000', {
      withCredentials:true,
      mode: 'cors'
    })
    .then( response => {
      response.data.roomId!=null ? setRedirect(true) : setRedirect(false);
    });
  })

  const handleExit = e => {
    e.preventDefault();
    window.addEventListener('unload', () => {
      axios.post('http://localhost:3000/player/exit', {withCredentials:true, mode: 'cors'})
    });
    } 
  
  const idCallback = (id)=>{
    setId(id);
    
    axios.get('http://localhost:3000', {
      withCredentials:true,
      mode: 'cors',
      headers: { "Content-Type": "application/json" },
    })
    .then(()=> setRedirect(true))
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
            <Beforeunload onBeforeunload={handleExit}>
              <Navbar/>
              <Gameboard/>
            </Beforeunload>
          </Route>
        </Switch>
    </Router>
  );
}

export default App;
