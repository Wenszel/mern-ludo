import React, { useEffect, useState, useRef } from 'react';
import positions from './positions';
import './Map.css';

const Map = ({ pawns }) => {
    //let pawnsOnMap = [];
    let paths = [];
    const paintPawn = (context, x, y, color) =>{
        const circle = new Path2D();
        circle.arc(x, y, 12, 0, 2 * Math.PI);
        context.strokeStyle ='black';
        context.stroke(circle);
        context.fillStyle = color
        context.fill(circle);
        paths.push(circle);
       // pawnsOnMap.push(circle);
    }

    const canvasRef = useRef(null)
    const handleCanvasClick = event =>{
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        var rect = canvas.getBoundingClientRect(),   // get abs. position of canvas
        x = event.clientX - rect.left,             // adjust mouse-position
        y = event.clientY - rect.top;
        paths.forEach((path) => {
            if (context.isPointInPath(path, x, y)) {
              alert("clicked")
            }

        });
    }
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        var image = new Image();
        image.src = 'https://img-9gag-fun.9cache.com/photo/a8GdpYZ_460s.jpg'
        image.onload = function() {
            context.drawImage(image, 0 , 0);
            pawns.forEach( pawn => {
                paintPawn(context, positions[pawn.position].x, positions[pawn.position].y, pawn.color);
            })
        }
      }, [pawns]);
    return(
        <canvas className="canvas-container" width={480} height={480} ref={canvasRef} onClick={handleCanvasClick}></canvas>
    )
}
export default Map