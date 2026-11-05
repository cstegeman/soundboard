import { useEffect, useRef } from 'react';
import { analyser } from '../utils/audio';

const Visualizer = () => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const data = new Uint8Array(analyser.frequencyBinCount);
    const color = getComputedStyle(canvas).color;
    let frame;

    const draw = () => {
      const { clientWidth: width, clientHeight: height } = canvas;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      const barWidth = width / data.length;
      data.forEach((value, i) => {
        const barHeight = (value / 255) * height;
        ctx.fillRect(i * barWidth, height - barHeight, Math.max(barWidth - 1, 1), barHeight);
      });
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={ref} className="visualizer" aria-hidden="true" />;
};

export default Visualizer;
