import React, { useEffect, useState, useRef } from 'react';
import './Map.css';
import axios from 'axios'
const Map = () => {
    //map of positions <1,92> and their equivalent of pixels in canvas
    const mapOfLocations = {
    };
    //obj schema: {color: [pos,pos,pos]}
    const [pawnPositions, setPawnPositions] = useState({
        
    });

    const paintPawn = (context, x, y, color) =>{
        context.fillStyle = color
        context.beginPath();
        context.arc(x, y, 12, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
    }
    const fetchData = () => {
        axios.get('http://localhost:3000/game',{withCredentials: true})
        .then(response => setPawnPositions(response.data.positions))
    }
    const canvasRef = useRef(null)

    useEffect(() => {
        //fetchData();
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        var image = new Image();
        image.src = 'https://img-9gag-fun.9cache.com/photo/a8GdpYZ_460s.jpg'
        image.onload = function() {
            context.drawImage(image, 0 , 0);
            /* pawnPositions.forEach( pawn => {
                paintPawn(context, pawn.x,pawn.y,'#ffa1a1')
            })
            */ 
        }

      }, []);

    return(
        <canvas className="canvas-container" width={480} height={480} ref={canvasRef}></canvas>
    )
}
export default Map