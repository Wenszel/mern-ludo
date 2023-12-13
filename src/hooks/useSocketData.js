import { useState, useContext } from 'react';
import { SocketContext } from '../App';

const useSocketData = port => {
    const socket = useContext(SocketContext);
    const [data, setData] = useState(null);
    socket.on(port, res => {
        let parsedData;
        try {
            parsedData = JSON.parse(res);
        } catch (error) {
            parsedData = res;
        }
        setData(parsedData);
    });
    return [data, setData];
};

export default useSocketData;
