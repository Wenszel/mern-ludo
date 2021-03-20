import React, { useEffect, useRef } from 'react';
import './Map.css';
const Map = () => {

    const canvasRef = useRef(null)
    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        var image = new Image();
        image.src = 'https://img-9gag-fun.9cache.com/photo/a8GdpYZ_460s.jpg'
        image.onload = function() {
            context.drawImage(image, 0 , 0);
        }
      }, []);

    return(
        <canvas className="canvas-container" width={480} height={480} ref={canvasRef}></canvas>
    )
}
export default Map