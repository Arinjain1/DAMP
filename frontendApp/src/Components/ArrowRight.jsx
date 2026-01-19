import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { cssInterop } from 'nativewind';

// Enable class styling for Svg
cssInterop(Svg, {
  className: {
    target: 'style',
  },
});

const ArrowRight = ({ size, color = '#000', className }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-[6vw] h-[6vw] ${className}`}
  >
    <Path d="M5 12h14" />
    <Path d="m12 5 7 7-7 7" />
  </Svg>
);

export default ArrowRight;