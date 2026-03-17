"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

export default function Canvas({ config = {} }) {
  const containerRef = useRef(null);
  const [img] = useImage(config.imageUrl || "");
  const [dimensions, setDimensions] = useState({ width: 700, height: 500, scale: 1 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const padding = 40;
        const availableW = clientWidth - padding;
        const availableH = clientHeight - padding;
        
        // Base design is 700x500
        const scale = Math.min(availableW / 700, availableH / 500);
        setDimensions({
          width: 700 * scale,
          height: 500 * scale,
          scale: scale
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div className="bg-white shadow-2xl rounded-[2.5rem] p-2 border border-gray-50 overflow-hidden">
        <Stage 
          width={dimensions.width} 
          height={dimensions.height} 
          scaleX={dimensions.scale} 
          scaleY={dimensions.scale}
        >
          <Layer>
            <Rect
              x={350 - 250}
              y={250 - 160}
              width={500}
              height={320}
              fill={config.bgColor || "#E0F2FE"}
              cornerRadius={40}
            />
            {img && (
              <KonvaImage
                image={img}
                x={350 - (img.width * 0.2) / 2}
                y={250 - (img.height * 0.2) / 2 - 50}
                width={img.width * 0.2}
                height={img.height * 0.2}
              />
            )}
            <Text
              text={config.text}
              x={0}
              y={250 + 20}
              width={700}
              fontSize={80}
              fontFamily={config.fontFamily}
              fontStyle="bold"
              fill="#1F2937"
              align="center"
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

