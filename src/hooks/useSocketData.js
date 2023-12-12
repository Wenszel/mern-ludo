import { useState, useContext } from 'react';
import { SocketContext } from '../App';

const useSocketData = port => {
    const socket = useContext(SocketContext);
    const [data, setData] = useState(null);
    socket.on(port, data => {
        setData(data);
    });
    return [data, setData];
};

export default useSocketData;
