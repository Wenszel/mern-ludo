import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../App';
import refresh from '../../../images/login-page/refresh.png';
import NameInput from '../NameInput/NameInput';
import Overlay from '../../Overlay/Overlay';
import WindowLayout from '../WindowLayout/WindowLayout';
import ServersTable from './ServersTable/ServersTable';
import withLoading from '../../HOC/withLoading';
import useSocketData from '../../../hooks/useSocketData';
import styles from './JoinServer.module.css';

const JoinServer = () => {
    const socket = useContext(SocketContext);
    const [rooms, setRooms] = useSocketData('room:rooms');

    const [joining, setJoining] = useState(false);
    const [clickedRoom, setClickedRoom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        socket.emit('room:rooms');
        socket.on('room:rooms', () => {
            setIsLoading(false);
        });
    }, [socket]);

    const getRooms = () => {
        setRooms([]);
        socket.emit('room:rooms');
    };

    const handleJoinClick = room => {
        setClickedRoom(room);
        setJoining(true);
    };

    const ServersTableWithLoading = withLoading(ServersTable);

    return (
        <>
            <WindowLayout
                title='Join A Server'
                titleComponent={
                    <div className={styles.refresh}>
                        <img src={refresh} alt='refresh' onClick={getRooms} />
                    </div>
                }
                content={
                    <div className={styles.serversTableContainer}>
                        <ServersTableWithLoading
                            isLoading={isLoading}
                            rooms={rooms}
                            handleJoinClick={handleJoinClick}
                        />
                    </div>
                }
            />
            {joining ? (
                <Overlay handleOverlayClose={() => setJoining(false)}>
                    <NameInput roomId={clickedRoom._id} isRoomPrivate={clickedRoom.private} />
                </Overlay>
            ) : null}
        </>
    );
};
export default JoinServer;
