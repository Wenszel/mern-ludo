import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../App';
import lock from '../../../images/login-page/lock.png';
import refresh from '../../../images/login-page/refresh.png';
import ReactLoading from 'react-loading';

import './ServerList.css';
import NameInput from '../NameInput/NameInput';

const ServerList = () => {
    const socket = useContext(SocketContext);
    const [rooms, setRooms] = useState([]);
    const [joining, setJoining] = useState(false);
    const [clickedRoom, setClickedRoom] = useState(null);
    useEffect(() => {
        socket.emit('room:rooms');
        socket.on('room:rooms', data => {
            data = JSON.parse(data);
            setRooms(data);
        });
    }, [socket]);

    const getRooms = () => {
        setRooms(null);
        socket.emit('room:rooms');
    };

    const handleJoinClick = room => {
        setClickedRoom(room);
        setJoining(true);
    };

    return (
        <div className='lp-container'>
            <div className='title-container'>
                <h1>Server List</h1>
                <div className='refresh'>
                    <img src={refresh} alt='refresh' onClick={getRooms}></img>
                </div>
            </div>
            <div className='server-container content-container'>
                {rooms ? (
                    <table className='rooms'>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Server</th>
                                <th>#/#</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room, index) => (
                                <tr key={index}>
                                    <td>{room.private ? <img src={lock} alt='private' /> : null}</td>
                                    <td className='room-name'>{room.name}</td>
                                    <td>{`${room.players.length}/4`}</td>
                                    <td>{room.isStarted ? 'started' : 'waiting'}</td>
                                    <td>
                                        <button onClick={() => handleJoinClick(room)}>Join</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ alignSelf: 'center' }}>
                        <ReactLoading type='spinningBubbles' color='white' height={50} width={50} />
                    </div>
                )}
            </div>
            {joining ? <NameInput roomId={clickedRoom._id} isRoomPrivate={clickedRoom.private} /> : null}
        </div>
    );
};
export default ServerList;
