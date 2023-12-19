import lock from '../../../../images/login-page/lock.png';
import styles from './ServersTable.module.css';

const ServerListTable = ({ rooms, handleJoinClick }) => {
    return (
        <table className={styles.rooms}>
            <thead>
                <tr>
                    <th className={styles.firstColumn}></th>
                    <th>Server</th>
                    <th>#/#</th>
                    <th>Status</th>
                    <th className={styles.lastColumn}></th>
                </tr>
            </thead>
            <tbody>
                {rooms.map((room, index) => {
                    return room.started ? null : (
                        <tr key={index}>
                            <td>{room.private ? <img src={lock} alt='private' /> : null}</td>
                            <td className={styles.roomName}>{room.name}</td>
                            <td>{`${room.players.length}/4`}</td>
                            <td>{room.isStarted ? 'started' : 'waiting'}</td>
                            <td className={styles.lastColumn}>
                                <button onClick={() => handleJoinClick(room)}>Join</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default ServerListTable;
