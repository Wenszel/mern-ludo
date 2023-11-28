import './LoginPage.css';
import AddServer from './AddServer/AddServer';
import ServerList from './ServerList/ServerList';
import NameInput from './NameInput/NameInput';
const LoginPage = () => {
    return (
        <>
            <div className='login-page-container'>
                <ServerList />
                <AddServer />
            </div>
        </>
    );
};

export default LoginPage;
