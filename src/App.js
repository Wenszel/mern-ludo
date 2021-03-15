import React, { useState } from 'react';
import { BrowserRouter as Router , Redirect } from 'react-router-dom';
import NameInput from './components/NameInput';

function App() {
  const [id, setId] = useState('')
  const [redirect, setRedirect] = useState(false)
  const idCallback = (id)=>{
    setId(id);
    setRedirect(true);
  }
  return (
    <Router>
      {redirect ?  <Redirect to="/game"></Redirect> : <NameInput idCallback = {idCallback}/>}
    </Router>
  );
}

export default App;
