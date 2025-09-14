import React from 'react';

interface BarcodeGeneratorProps {
  value: string;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ value }) => {
  // This is a simplified placeholder for barcode generation.
  // A real implementation would use a library or a more complex SVG generation logic for a specific standard (like EAN-13, Code 128).
  // This version creates a visually representative, but not scannable, pattern.
  const generateSimpleBars = (data: string) => {
    const bars = [];
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      // Create some variation for visual effect
      const width = 1 + (charCode % 3); // width can be 1, 2, or 3
      bars.push({ width, color: i % 2 === 0 ? 'black' : 'black' }); // Alternating colors not needed for barcode
      // Add a spacer
      bars.push({ width: 1, color: 'white' });
    }
    return bars;
  };
  
  const bars = generateSimpleBars(value);
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width, 0);
  let currentX = 0;

  return (
    <svg
      width="100%"
      height="60"
      viewBox={`0 0 ${totalWidth} 60`}
      preserveAspectRatio="xMidYMid meet"
      aria-label={`Barcode for ${value}`}
    >
      {bars.map((bar, index) => {
        const x = currentX;
        currentX += bar.width;
        if (bar.color === 'black') {
          return <rect key={index} x={x} y="0" width={bar.width} height="60" fill="black" />;
        }
        return null;
      })}
    </svg>
  );
};

export default BarcodeGenerator;
