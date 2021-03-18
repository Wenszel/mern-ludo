import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router , Route , Redirect, Switch } from 'react-router-dom';

import Navbar from './components/Navbar'
import NameInput from './components/NameInput';

function App() {
  useEffect(()=>{
    axios.get('http://localhost:3000', {
      withCredentials:true,
      mode: 'cors'
    })
    .then((response)=> response.id!=null ? setRedirect(true) : null);
  })
  const [id, setId] = useState('')
  const [redirect, setRedirect] = useState(false)
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
      {redirect ?  <Redirect to="/game"></Redirect> : <NameInput idCallback = {idCallback}/>}
      <Switch>
          <Route path="/game">
            <Navbar></Navbar>
          </Route>
        </Switch>
    </Router>
  );
}

export default App;
