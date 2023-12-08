import React, { useState, useEffect, useContext } from 'react';
import ReactLoading from 'react-loading';
import { PlayerDataContext, SocketContext } from '../../App';
import Map from './Map/Map';
import Navbar from '../Navbar/Navbar';

const Gameboard = () => {
    const socket = useContext(SocketContext);
    const context = useContext(PlayerDataContext);

    const [pawns, setPawns] = useState([]);
    const [players, setPlayers] = useState([]);

    const [rolledNumber, setRolledNumber] = useState(null);
    const [time, setTime] = useState();
    const [isReady, setIsReady] = useState();
    const [nowMoving, setNowMoving] = useState(false);
    const [started, setStarted] = useState(false);

    const [movingPlayer, setMovingPlayer] = useState('red');

    const checkWin = () => {
        // Player wins when all pawns with same color are inside end base
        if (pawns.filter(pawn => pawn.color === 'red' && pawn.position === 73).length === 4) {
            alert('Red Won');
        } else if (pawns.filter(pawn => pawn.color === 'blue' && pawn.position === 79).length === 4) {
            alert('Blue Won');
        } else if (pawns.filter(pawn => pawn.color === 'green' && pawn.position === 85).length === 4) {
            alert('Green Won');
        } else if (pawns.filter(pawn => pawn.color === 'yellow' && pawn.position === 91).length === 4) {
            alert('Yellow Won');
        }
    };

    useEffect(() => {
        socket.emit('room:data', context.roomId);
        socket.on('room:data', data => {
            data = JSON.parse(data);
            if (data.players == null) return;
            // Filling navbar with empty player nick container
            while (data.players.length !== 4) {
                data.players.push({ name: '...' });
            }
            // Checks if client is currently moving player by session ID
            const nowMovingPlayer = data.players.find(player => player.nowMoving === true);
            if (nowMovingPlayer) {
                if (nowMovingPlayer._id === context.playerId) {
                    setNowMoving(true);
                } else {
                    setNowMoving(false);
                }
                setMovingPlayer(nowMovingPlayer.color);
            }
            const currentPlayer = data.players.find(player => player._id === context.playerId);
            checkWin();
            setIsReady(currentPlayer.ready);
            setRolledNumber(data.rolledNumber);
            setPlayers(data.players);
            setPawns(data.pawns);
            setTime(data.nextMoveTime);
            setStarted(data.started);
        });
    }, [socket]);

    const rolledNumberCallback = number => {
        setRolledNumber(number);
    };

    return (
        <>
            {(players[0] && !started) || (time && started) ? (
                <div className='container'>
                    <Navbar
                        players={players}
                        started={started}
                        time={time}
                        isReady={isReady}
                        movingPlayer={movingPlayer}
                        rolledNumber={rolledNumber}
                        nowMoving={nowMoving}
                        rolledNumberCallback={rolledNumberCallback}
                    />
                    <Map pawns={pawns} nowMoving={nowMoving} rolledNumber={rolledNumber} />
                </div>
            ) : (
                <ReactLoading type='spinningBubbles' color='white' height={667} width={375} />
            )}
        </>
    );
};

export default Gameboard;
