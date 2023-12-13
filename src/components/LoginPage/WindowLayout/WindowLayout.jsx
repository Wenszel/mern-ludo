import styles from './WindowLayout.module.css';

const WindowLayout = ({ title, titleComponent, content }) => {
    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <h1>{title}</h1>
                {titleComponent}
            </div>
            <div className={styles.content}>{content}</div>
        </div>
    );
};

export default WindowLayout;
