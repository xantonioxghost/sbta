import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { SpineType } from '@/lib/exercises';

type SpineVisualProps = {
  type: SpineType;
  size?: number;
  color?: string;
  active?: boolean;
};

export function SpineVisual({ type, size = 44, color = '#00E5FF', active = false }: SpineVisualProps) {
  const strokeColor = active ? color : '#7E96B8';
  const dotColor = active ? color : '#7E96B8';

  // SVG viewBox is 0 0 60 100
  const renderSpinePath = () => {
    switch (type) {
      case 'kyphosis':
        // Hunchback: upper spine curves back (right), head forward
        return (
          <>
            {/* Spine Line */}
            <Path
              d="M 24 15 C 42 30, 42 50, 26 75 C 24 80, 24 88, 25 90"
              fill="none"
              stroke={strokeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Vertebrae dots */}
            <Circle cx="24" cy="15" r="3.5" fill={dotColor} />
            <Circle cx="35" cy="30" r="3.5" fill={dotColor} />
            <Circle cx="38" cy="45" r="3.5" fill={dotColor} />
            <Circle cx="32" cy="60" r="3.5" fill={dotColor} />
            <Circle cx="26" cy="75" r="3.5" fill={dotColor} />
            <Circle cx="25" cy="90" r="3.5" fill={dotColor} />
            {/* Head Indicator */}
            <Circle cx="20" cy="10" r="6" fill="none" stroke={strokeColor} strokeWidth="2" />
          </>
        );

      case 'lordosis':
        // Swayback: deep inward arch in lower back
        return (
          <>
            <Path
              d="M 28 15 C 26 30, 10 50, 32 75 C 34 82, 30 88, 28 90"
              fill="none"
              stroke={strokeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Circle cx="28" cy="15" r="3.5" fill={dotColor} />
            <Circle cx="26" cy="30" r="3.5" fill={dotColor} />
            <Circle cx="16" cy="48" r="3.5" fill={dotColor} />
            <Circle cx="24" cy="65" r="3.5" fill={dotColor} />
            <Circle cx="32" cy="75" r="3.5" fill={dotColor} />
            <Circle cx="28" cy="90" r="3.5" fill={dotColor} />
            <Circle cx="28" cy="10" r="6" fill="none" stroke={strokeColor} strokeWidth="2" />
          </>
        );

      case 'text_neck':
        // Forward Head: neck shoots forward to the right
        return (
          <>
            <Path
              d="M 40 18 C 30 25, 26 40, 28 65 C 28 80, 26 88, 26 90"
              fill="none"
              stroke={strokeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Circle cx="40" cy="18" r="3.5" fill={dotColor} />
            <Circle cx="32" cy="24" r="3.5" fill={dotColor} />
            <Circle cx="27" cy="40" r="3.5" fill={dotColor} />
            <Circle cx="28" cy="60" r="3.5" fill={dotColor} />
            <Circle cx="27" cy="78" r="3.5" fill={dotColor} />
            <Circle cx="26" cy="90" r="3.5" fill={dotColor} />
            {/* Head jutting forward */}
            <Circle cx="46" cy="14" r="6" fill="none" stroke={strokeColor} strokeWidth="2" />
          </>
        );

      case 'scoliosis':
        // S-curve side-to-side
        return (
          <>
            <Path
              d="M 30 15 C 44 32, 16 58, 30 78 C 30 84, 30 88, 30 90"
              fill="none"
              stroke={strokeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Circle cx="30" cy="15" r="3.5" fill={dotColor} />
            <Circle cx="39" cy="30" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="46" r="3.5" fill={dotColor} />
            <Circle cx="20" cy="60" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="78" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="90" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="10" r="6" fill="none" stroke={strokeColor} strokeWidth="2" />
          </>
        );

      case 'flat_back':
        // Flat, rigid vertical line
        return (
          <>
            <Path
              d="M 30 15 L 30 90"
              fill="none"
              stroke={strokeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Circle cx="30" cy="15" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="30" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="45" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="60" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="75" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="90" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="10" r="6" fill="none" stroke={strokeColor} strokeWidth="2" />
          </>
        );

      case 'normal':
      default:
        // Healthy gentle natural S-curve
        return (
          <>
            <Path
              d="M 30 15 C 24 28, 36 50, 26 72 C 28 82, 30 88, 30 90"
              fill="none"
              stroke={strokeColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Circle cx="30" cy="15" r="3.5" fill={dotColor} />
            <Circle cx="26" cy="30" r="3.5" fill={dotColor} />
            <Circle cx="33" cy="48" r="3.5" fill={dotColor} />
            <Circle cx="28" cy="64" r="3.5" fill={dotColor} />
            <Circle cx="28" cy="78" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="90" r="3.5" fill={dotColor} />
            <Circle cx="30" cy="10" r="6" fill="none" stroke={strokeColor} strokeWidth="2" />
          </>
        );
    }
  };

  return (
    <Svg width={size} height={size * (100 / 60)} viewBox="0 0 60 100">
      {renderSpinePath()}
    </Svg>
  );
}
