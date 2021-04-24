import React, { useEffect, useState, useRef } from 'react';
import positions from './positions';
import './Map.css';

const Map = ({ pawns }) => {
    const paintPawn = (context, x, y, color) =>{
        console.log(x,y,color);
        context.fillStyle = color
        context.beginPath();
        context.arc(x, y, 12, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
    }

    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        var image = new Image();
        image.src = 'https://img-9gag-fun.9cache.com/photo/a8GdpYZ_460s.jpg'
        image.onload = function() {
            context.drawImage(image, 0 , 0);
            pawns.forEach( pawn => {
                console.log("rysuje")
                console.log(positions[pawn.position]);
                paintPawn(context, positions[pawn.position].x, positions[pawn.position].y, pawn.color);
            })
        }
      }, [pawns]);
    return(
        <canvas className="canvas-container" width={480} height={480} ref={canvasRef}></canvas>
    )
}
export default Map