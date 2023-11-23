import React, { useContext, useEffect, useState } from 'react';
import NameInput from './NameInput/NameInput';
import { SocketContext } from '../../App';
import './LoginPage.css';
import userImage from '../../images/login-page/user.png';
const LoginPage = () => {
    const socket = useContext(SocketContext);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(async () => {
        socket.emit('room:rooms');
        socket.on('room:rooms', data => {
            data = JSON.parse(data);
            console.log(data);
            setRooms(data);
        });
    }, []);

    return (
        <div className='login-page-container'>
            <h1>Select room:</h1>
            <div className='rooms'>
                {rooms.map(room => {
                    return (
                        <div
                            className={selectedRoom && selectedRoom == room._id ? 'room-selected room' : 'room'}
                            onClick={() => {
                                if (selectedRoom && selectedRoom == room._id) {
                                    setSelectedRoom(null);
                                } else {
                                    setSelectedRoom(room._id);
                                }
                            }}
                            key={room.id}
                        >
                            <div>
                                <p>{room.name}</p>
                                {room.players.map(player => player.name + ' ')}
                            </div>

                            <div className='number-of-players'>
                                <img src={userImage} alt='' />
                                <span> {room.players.length}/4 </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <NameInput />
        </div>
    );
};
export default LoginPage;
