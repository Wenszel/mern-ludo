import AddServer from './AddServer/AddServer';
import JoinServer from './JoinServer/JoinServer';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    return (
        <div className={styles.container}>
            <JoinServer />
            <AddServer />
        </div>
    );
};

export default LoginPage;
