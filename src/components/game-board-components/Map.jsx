import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { PlayerDataContext, SocketContext } from '../../App';
import positions from './positions';

const Map = ({ pawns, nowMoving, rolledNumber }) => {
    const context = useContext(PlayerDataContext);
    const socket = useContext(SocketContext);
    const [hintPawn, setHintPawn] = useState();
    const paintPawn = (context, x, y, color) => {
        const circle = new Path2D();
        circle.arc(x, y, 12, 0, 2 * Math.PI);
        context.strokeStyle = 'black';
        context.stroke(circle);
        context.fillStyle = color;
        context.fill(circle);
        return circle;
    };

    const canvasRef = useRef(null);

    // Return true when pawn can move
    const checkIfPawnCanMove = useCallback(
        pawn => {
            // If is in base
            if ((rolledNumber === 1 || rolledNumber === 6) && pawn.position === pawn.basePos) {
                return true;
                // Other situations: pawn is on map or pawn is in end positions
            } else if (pawn.position !== pawn.basePos) {
                switch (pawn.color) {
                    case 'red':
                        if (pawn.position + rolledNumber <= 73) return true;
                        break;
                    case 'blue':
                        if (pawn.position + rolledNumber <= 79) return true;
                        break;
                    case 'green':
                        if (pawn.position + rolledNumber <= 85) return true;
                        break;
                    case 'yellow':
                        if (pawn.position + rolledNumber <= 91) return true;
                        break;
                    default:
                        return false;
                }
            } else {
                return false;
            }
        },
        [rolledNumber]
    );

    const handleCanvasClick = event => {
        // If hint pawn exist it means that pawn can move
        if (hintPawn) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect(),
                x = event.clientX - rect.left,
                y = event.clientY - rect.top;
            for (const pawn of pawns) {
                if (ctx.isPointInPath(pawn.circle, x, y)) {
                    socket.emit('game:move', { pawnId: pawn._id });
                }
            }
        }
    };
    const getHintPawnPosition = pawn => {
        // Based on color (because specific color have specific base and end positions)
        let { position } = pawn;
        switch (context.color) {
            case 'red':
                // When in base
                if (position >= 0 && position <= 3) {
                    return 16;
                    // Next to end
                } else if (position <= 66 && position + rolledNumber >= 67) {
                    return position + rolledNumber + 1; // 1 is difference between last position on map and first on end
                    // Normal move
                } else {
                    return position + rolledNumber;
                }
            case 'blue':
                // When in base
                if (position >= 4 && position <= 7) {
                    return 55;
                    // Next to red base
                } else if (position <= 67 && position + rolledNumber > 67) {
                    return position + rolledNumber - 52;
                    // Next to base
                } else if (position <= 53 && position + rolledNumber >= 54) {
                    return position + rolledNumber + 20;
                    // Normal move
                } else {
                    return position + rolledNumber;
                }
            case 'green':
                // When in base
                if (position >= 8 && position <= 11) {
                    return 42;
                    // Next to red base
                } else if (position <= 67 && position + rolledNumber > 67) {
                    return position + rolledNumber - 52;
                    // Next to base
                } else if (position <= 40 && position + rolledNumber >= 41) {
                    return position + rolledNumber + 39;
                    // Normal move
                } else {
                    return position + rolledNumber;
                }
            case 'yellow':
                // When in base
                if (position >= 12 && position <= 15) {
                    return 29;
                    // Next to red base
                } else if (position <= 67 && position + rolledNumber > 67) {
                    return position + rolledNumber - 52;
                    // Next to base
                } else if (position <= 27 && position + rolledNumber >= 28) {
                    return position + rolledNumber + 58;
                    // Normal move
                } else {
                    return position + rolledNumber;
                }
            default:
                return position;
        }
    };
    const handleMouseMove = event => {
        if (nowMoving && rolledNumber) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            // Gets x and y cords of mouse on canvas
            const rect = canvas.getBoundingClientRect(),
                x = event.clientX - rect.left,
                y = event.clientY - rect.top;
            canvas.style.cursor = 'default';
            for (const pawn of pawns) {
                if (pawn.circle) {
                    /*
                        This condition checks if mouse location is:
                        1) on pawn
                        2) is color of pawn same as player's
                        3) if pawn can move
                        And then sets cursor to pointer and paints hint pawn - where will be pawn after click
                    */
                    if (
                        ctx.isPointInPath(pawn.circle, x, y) &&
                        context.color === pawn.color &&
                        checkIfPawnCanMove(pawn)
                    ) {
                        const pawnPosition = getHintPawnPosition(pawn);
                        // Checks if pawn can make a move
                        if (pawnPosition) {
                            canvas.style.cursor = 'pointer';
                            setHintPawn({ id: pawn._id, position: pawnPosition, color: 'grey' });
                            break;
                        }
                    } else {
                        setHintPawn(null);
                    }
                }
            }
        }
    };
    const rerenderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.src = 'https://img-9gag-fun.9cache.com/photo/a8GdpYZ_460s.jpg';
        image.onload = function () {
            ctx.drawImage(image, 0, 0);
            pawns.forEach((pawn, index) => {
                if (nowMoving && rolledNumber && pawn.color === context.color && checkIfPawnCanMove(pawn)) {
                    pawns[index].circle = paintPawn(
                        ctx,
                        positions[pawn.position].x,
                        positions[pawn.position].y,
                        'white'
                    );
                } else {
                    pawns[index].circle = paintPawn(
                        ctx,
                        positions[pawn.position].x,
                        positions[pawn.position].y,
                        pawn.color
                    );
                }
            });
            if (hintPawn) {
                paintPawn(ctx, positions[hintPawn.position].x, positions[hintPawn.position].y, hintPawn.color);
            }
        };
    }, [checkIfPawnCanMove, context.color, hintPawn, nowMoving, pawns, rolledNumber]);

    // Rerender canvas when pawns have changed
    useEffect(() => {
        rerenderCanvas();
    }, [hintPawn, pawns, rerenderCanvas]);

    useEffect(() => {
        socket.on('game:move', () => {
            setHintPawn(null);
        });
    }, [socket]);
    return (
        <canvas
            className='canvas-container'
            width={460}
            height={460}
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
        />
    );
};
export default Map;
