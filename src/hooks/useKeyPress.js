import { useEffect } from 'react';
export default function useKeyPress(targetKey, callback) {
    const keyPressHandler = ({ key }) => {
        if (key === targetKey) {
            callback();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', keyPressHandler);
        return () => {
            window.removeEventListener('keydown', keyPressHandler);
        };
    }, [keyPressHandler]);
}
