import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './game-board-components/Map'
import Dice from './game-board-components/Dice'
import Navbar from './Navbar'

const Gameboard = ({id, color}) => {
    const [pawns, setPawns] = useState([]);
    const [players, setPlayers] = useState([]);
    const [nowMoving, setNowMoving] = useState(false);
    const [started, setStarted] = useState(false);
    //fetching players data to display them in navbar
    const fetchData = () => {
        axios.get('http://localhost:3000/room/',{
            withCredentials:true,
            mode: 'cors',
        }).then((response)=>{
            while(response.data.players.length !== 4){
                response.data.players.push({
                    name: "...",
                })
            }
            if(id===response.data.players.find(player => player.nowMoving === true)?._id){
                setNowMoving(true);
            }else{
                setNowMoving(false);
            }
            setPlayers(response.data.players);
            setPawns(response.data.pawns);
            setStarted(response.data.started);
        })
    }
    useEffect(()=>{
        //sending ajax every 1 sec 
        setInterval(fetchData, 1000);
    },[]);
    return (
        <>
            <Navbar players={players} started={started}/>
            {nowMoving ? <Dice nowMoving={nowMoving}/> : null}
            <Map pawns={pawns} nowMoving={nowMoving} color={color}/>
        </>
    )

}

export default Gameboard;