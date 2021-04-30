import React, { useState, useEffect, useContext } from 'react';
import { PlayerDataContext } from '../App'
import axios from 'axios';
import Map from './game-board-components/Map'
import Dice from './game-board-components/Dice'
import Navbar from './Navbar'

const Gameboard = () => {
    // Context data
    const context = useContext(PlayerDataContext);
    // Render data
    const [pawns, setPawns] = useState([]);
    const [players, setPlayers] = useState([]);
    // Game logic data
    const [rolledNumber, setRolledNumber] = useState(null);
    const [time, setTime] = useState();
    const [nowMoving, setNowMoving] = useState(false);
    const [started, setStarted] = useState(false);
    // Fetching game data
    const fetchData = () => {
        axios.get('http://localhost:3000/room/',{
            withCredentials:true,
            mode: 'cors',
        }).then((response)=>{
            // Filling navbar with empty player nick container
            while(response.data.players.length !== 4){
                response.data.players.push({name: "...",});
            };
            // Checks if client is currently moving player by session ID
            const nowMovingPlayer = response.data.players.find(player => player.nowMoving === true);
            if(nowMovingPlayer){
                if(nowMovingPlayer._id === context.playerId){
                    setNowMoving(true);
                }else{
                    setRolledNumber(null);
                    setNowMoving(false);
                }
            }
            setPlayers(response.data.players);
            setPawns(response.data.pawns);
            setTime(response.data.nextMoveTime);
            setStarted(response.data.started);
        })
    }
    const checkWin = () => {
        if(pawns.filter(pawn => pawn.color === 'red' && pawn.position === 73).length === 4){
            alert("Red Won")
        }else if(pawns.filter(pawn => pawn.color === 'blue' && pawn.position === 79).length === 4){
            alert("Blue Won")
        }else if(pawns.filter(pawn => pawn.color === 'green' && pawn.position === 85).length === 4){
            alert("Green Won")
        }else if(pawns.filter(pawn => pawn.color === 'yellow' && pawn.position === 91).length === 4){
            alert("Yellow Won")
        }
    }
    useEffect(() => {    
        //sending ajax every 1 sec 
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    },[]);
    // Callback to handle dice rolling between dice and map component
    const rolledNumberCallback = (number) => {
        setRolledNumber(number);
    }

    return (
        <>
            <Navbar players={players} started={started} time={time}/>
            {nowMoving ? <Dice nowMoving={nowMoving} rolledNumberCallback={rolledNumberCallback}/> : null}
            <Map pawns={pawns} nowMoving={nowMoving} rolledNumber={rolledNumber}/>
        </>
    )

}

export default Gameboard;