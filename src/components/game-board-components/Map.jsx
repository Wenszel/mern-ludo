import React, { useEffect, useRef } from 'react';
import positions from './positions';
import './Map.css';

const Map = ({ pawns, nowMoving, color }) => {
    const paintPawn = (context, x, y, color, id) =>{
        const circle = new Path2D();
        circle.arc(x, y, 12, 0, 2 * Math.PI);
        context.strokeStyle ='black';
        context.stroke(circle);
        context.fillStyle = color;
        context.fill(circle);
        const currentPawnIndex = pawns.findIndex( pawn => pawn._id === id);
        pawns[currentPawnIndex].circle = circle;
    }

    const canvasRef = useRef(null);
    
    const handleCanvasClick = event => {
        if(!nowMoving){
            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
            const rect = canvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
            for(const pawn of pawns){
                if (context.isPointInPath(pawn.circle, x, y)) {
                    alert(pawn._id);
                }
            }
        }
    }
    const handleMouseMove = event => {
        if(!nowMoving){ 
            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
            const rect = canvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
            document.querySelector("body").style.cursor = "default";
            for (const pawn of pawns){
                if(pawn.circle){
                    // Checks if current mouse location in above canvas pawn and if this pawn is same color as player
                    if (context.isPointInPath(pawn.circle, x, y) && pawn.color === color) {
                        document.querySelector("body").style.cursor = "pointer";
                        break;
                    }
                }   
            }
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        var image = new Image();
        image.src = 'https://img-9gag-fun.9cache.com/photo/a8GdpYZ_460s.jpg'
        image.onload = function() {
            context.drawImage(image, 0 , 0);
            pawns.forEach( pawn => {
                paintPawn(context, positions[pawn.position].x, positions[pawn.position].y, pawn.color, pawn._id);
            })
        }
      }, [pawns]);
    return(
        <canvas 
            className="canvas-container" 
            width={480} 
            height={480} 
            ref={canvasRef} 
            onClick={handleCanvasClick} 
            onMouseMove={handleMouseMove}
        />
    )
}
export default Map