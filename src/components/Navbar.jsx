import React, { useEffect, useState } from 'react';
import NameContainer from './navbar-components/NameContainer'
import ReadyButton from './navbar-components/ReadyButton'
import './Navbar.css';
import axios from 'axios';
const Navbar = () => {
    
    const [players, setPlayers] = useState([]);

    useEffect(()=>{
        //fetching players data 
        axios.get('http://localhost:3001/room/',{
            withCredentials:true,
            mode: 'cors',
        }).then((response)=>{
            setPlayers(response.data.players);
        })
    },[]);

    return(
        <div className="navbar-container">
            {players.map((player)=>
                <NameContainer key={player.name} player = {player}/>
            )}
            <ReadyButton/>
        </div>
    );
}
export default Navbar;