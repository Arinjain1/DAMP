import React from 'react';
import { View, Text } from 'react-native';

const Badge = ({ children, color = 'blue', className }) => {
  // We split styles because View handles Layout/BG and Text handles Font color
  const colorStyles = {
    blue: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
    },
    green: {
      container: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
    },
    yellow: {
      container: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
    },
    red: {
      container: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
    },
    purple: {
      container: 'bg-purple-50 border-purple-200',
      text: 'text-purple-700',
    },
    gray: {
      container: 'bg-gray-100 border-gray-200',
      text: 'text-gray-700',
    },
  };

  const activeColor = colorStyles[color] || colorStyles.gray;

  return (
    <View
      className={`
        flex-row self-start items-center justify-center
        border rounded-md
        px-[2vw] py-[0.5vh]
        ${activeColor.container} 
        ${className}
      `}
    >
      <Text
        className={`
          font-bold 
          text-[3vw] leading-[3.5vw]
          ${activeColor.text}
        `}
      >
        {children}
      </Text>
    </View>
  );
};

export default Badge;