import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router , Redirect } from 'react-router-dom';
import NameInput from './components/NameInput';

function App() {
  useEffect(()=>{
    axios.get('http://localhost:3000', {
      withCredentials:true,
      mode: 'cors'
    })
    .then((response)=> response.id!=null ? setRedirect(true): null);
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
    </Router>
  );
}

export default App;
