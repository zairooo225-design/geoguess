import React, { useEffect, useRef } from 'react';
import { audioManager } from '../audio';

export function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      animFrame = requestAnimationFrame(draw);
      
      const analyser = audioManager.analyserNode;
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      // Draw mirrored from center for a cool effect, or just left to right
      // Let's do left to right, but drawing from the bottom
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 3; 
        
        ctx.fillStyle = `rgba(193, 103, 87, ${dataArray[i] / 255 * 0.4})`;
        
        // draw from bottom up
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-multiply" 
    />
  );
}
