import { useEffect, useCallback } from 'react';
export default function useKeyPress(targetKey, callback) {
    const keyPressHandler = useCallback(
        ({ key }) => {
            if (key === targetKey) {
                callback();
            }
        },
        [targetKey, callback]
    );

    useEffect(() => {
        window.addEventListener('keydown', keyPressHandler);
        return () => {
            window.removeEventListener('keydown', keyPressHandler);
        };
    }, [keyPressHandler]);
}
