import React, { useEffect, useState } from 'react';
import axios from 'axios';
const Navbar = () => {
    
    const [players, setPlayers] = useState([]);
    useEffect(()=>{
        //fetching names, time and other data
        axios.get('http://localhost:3001/room/',{
            withCredentials:true,
            mode: 'cors',
        }).then((response)=>{

            setPlayers(response.data.players);
            console.log(response.data.players);
        })
    }
    ,[]);
    return(
        <div>
            {players.map((name)=>
                <p key={name.player}>{name.player}</p>
            )}
        </div>
    );
}
export default Navbar;