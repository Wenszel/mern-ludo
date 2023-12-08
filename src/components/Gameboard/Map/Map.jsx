import React, { useEffect, useRef, useState, useContext } from 'react';
import { PlayerDataContext, SocketContext } from '../../../App';

import mapImage from '../../../images/map.jpg';
import positions from '../positions';
import pawnImages from '../../../constants/pawnImages';
import canPawnMove from './canPawnMove';
import getPositionAfterMove from './getPositionAfterMove';

const Map = ({ pawns, nowMoving, rolledNumber }) => {
    const player = useContext(PlayerDataContext);
    const socket = useContext(SocketContext);
    const canvasRef = useRef(null);

    const [hintPawn, setHintPawn] = useState();

    const paintPawn = (context, x, y, color) => {
        const touchableArea = new Path2D();
        touchableArea.arc(x, y, 12, 0, 2 * Math.PI);
        const image = new Image();
        image.src = pawnImages[color];
        image.onload = function () {
            context.drawImage(image, x - 17, y - 14, 35, 30);
        };
        return touchableArea;
    };

    const handleCanvasClick = event => {
        if (hintPawn) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect(),
                cursorX = event.clientX - rect.left,
                cursorY = event.clientY - rect.top;
            for (const pawn of pawns) {
                if (ctx.isPointInPath(pawn.touchableArea, cursorX, cursorY)) {
                    socket.emit('game:move', pawn._id);
                }
            }
            setHintPawn(null);
        }
    };

    const handleMouseMove = event => {
        if (nowMoving && rolledNumber) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect(),
                x = event.clientX - rect.left,
                y = event.clientY - rect.top;
            canvas.style.cursor = 'default';
            for (const pawn of pawns) {
                if (pawn.touchableArea) {
                    if (
                        ctx.isPointInPath(pawn.touchableArea, x, y) &&
                        player.color === pawn.color &&
                        canPawnMove(pawn, rolledNumber)
                    ) {
                        const pawnPosition = getPositionAfterMove(pawn, rolledNumber);
                        if (pawnPosition) {
                            canvas.style.cursor = 'pointer';
                            setHintPawn({ id: pawn._id, position: pawnPosition, color: 'grey' });
                            break;
                        }
                    } else {
                        setHintPawn(null);
                    }
                } else {
                    setHintPawn(null);
                }
            }
        } else {
            setHintPawn(null);
        }
    };
    const rerenderCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.src = mapImage;
        image.onload = function () {
            ctx.drawImage(image, 0, 0);
            pawns.forEach((pawn, index) => {
                pawns[index].touchableArea = paintPawn(
                    ctx,
                    positions[pawn.position].x,
                    positions[pawn.position].y,
                    pawn.color
                );
            });
            if (hintPawn) {
                paintPawn(ctx, positions[hintPawn.position].x, positions[hintPawn.position].y, hintPawn.color);
            }
        };
    };
    useEffect(() => {
        rerenderCanvas();
    }, [hintPawn, pawns, rerenderCanvas]);

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
