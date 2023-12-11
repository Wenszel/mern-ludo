import styles from './Overlay.module.css';
import useKeyPress from '../../hooks/useKeyPress';

const Overlay = ({ children, handleOverlayClose }) => {
    useKeyPress('Escape', handleOverlayClose);

    return <div className={styles.container}>{children}</div>;
};
export default Overlay;
