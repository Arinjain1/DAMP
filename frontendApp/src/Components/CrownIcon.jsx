import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { cssInterop } from 'nativewind';

// 1. Enable NativeWind classes on the Svg component
cssInterop(Svg, {
  className: {
    target: 'style',
  },
});

const CrownIcon = ({ size, color = '#000', className }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    // 2. Default sizing using standard props, can be overridden by className w-[x] h-[x]
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    // 3. Responsive default via className (approx 6% of viewport width) if no class provided
    className={`w-[6vw] h-[6vw] ${className}`}
  >
    <Path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </Svg>
);

export default CrownIcon;