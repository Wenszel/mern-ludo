import React, { useEffect, useState } from 'react';
import NameContainer from './navbar-components/NameContainer'
import ReadyButton from './navbar-components/ReadyButton'
import './Navbar.css';
import axios from 'axios';
const Navbar = () => {
    
    const [players, setPlayers] = useState([]);

    useEffect(()=>{
        //fetching players data 
        axios.get('http://localhost:3000/room/',{
            withCredentials:true,
            mode: 'cors',
        }).then((response)=>{
            while(response.data.players.length !== 4){
                response.data.players.push({
                    name: "...",
                    color: "grey"
                })
            }
            setPlayers(response.data.players);
        })
    },[]);

    return(
        <div className="navbar-container">
            {players.map( (player, index) =>
                <NameContainer key={index} player = {player}/>
            )}
            <ReadyButton/>
        </div>
    );
}
export default Navbar;