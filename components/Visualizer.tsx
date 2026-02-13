
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VisualizerProps {
  isPlaying: boolean;
  color?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, color = "#a855f7" }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 300;
    const height = 100;
    const barCount = 40;
    const data = Array.from({ length: barCount }, () => Math.random() * 50);

    svg.selectAll("*").remove();

    const bars = svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (width / barCount))
      .attr("y", d => height - d)
      .attr("width", (width / barCount) - 2)
      .attr("height", d => d)
      .attr("fill", color)
      .attr("rx", 2);

    let animationId: number;
    const update = () => {
      if (isPlaying) {
        bars.data(data.map(() => Math.random() * 80 + 10))
          .transition()
          .duration(100)
          .attr("y", d => height - d)
          .attr("height", d => d);
      } else {
        bars.data(data.map(() => 5))
          .transition()
          .duration(500)
          .attr("y", height - 5)
          .attr("height", 5);
      }
      animationId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, color]);

  return (
    <svg ref={svgRef} width="100%" height="100" viewBox="0 0 300 100" className="opacity-80" />
  );
};

export default Visualizer;
