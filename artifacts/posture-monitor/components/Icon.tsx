import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'history'
  | 'settings'
  | 'profile'
  | 'bluetooth'
  | 'sliders'
  | 'target'
  | 'clock'
  | 'bell'
  | 'smartphone'
  | 'user'
  | 'shield'
  | 'lock'
  | 'mail'
  | 'arrow-right'
  | 'log-out'
  | 'check'
  | 'chevron-down'
  | 'chevron-right'
  | 'trash'
  | 'sun'
  | 'coffee'
  | 'moon'
  | 'activity'
  | 'refresh'
  | 'cloud'
  | 'cpu'
  | 'crosshair'
  | 'x'
  | 'user-plus'
  | 'alert-circle'
  | 'trending-up';

type IconProps = {
  name: IconName;
  size?: number;
  color?: any;
};

export function Icon({ name, size = 20, color = '#36C69D' }: IconProps) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <Svg {...p}>
          <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Polyline points="9 22 9 12 15 12 15 22" />
        </Svg>
      );

    case 'history':
      return (
        <Svg {...p}>
          <Line x1="18" y1="20" x2="18" y2="10" />
          <Line x1="12" y1="20" x2="12" y2="4" />
          <Line x1="6" y1="20" x2="6" y2="14" />
        </Svg>
      );

    case 'settings':
    case 'sliders':
      return (
        <Svg {...p}>
          <Line x1="4" y1="21" x2="4" y2="14" />
          <Line x1="4" y1="10" x2="4" y2="3" />
          <Line x1="12" y1="21" x2="12" y2="12" />
          <Line x1="12" y1="8" x2="12" y2="3" />
          <Line x1="20" y1="21" x2="20" y2="16" />
          <Line x1="20" y1="12" x2="20" y2="3" />
          <Line x1="1" y1="14" x2="7" y2="14" />
          <Line x1="9" y1="8" x2="15" y2="8" />
          <Line x1="17" y1="16" x2="23" y2="16" />
        </Svg>
      );

    case 'profile':
    case 'user':
      return (
        <Svg {...p}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );

    case 'bluetooth':
      return (
        <Svg {...p}>
          <Polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
        </Svg>
      );

    case 'target':
    case 'crosshair':
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="22" y1="12" x2="18" y2="12" />
          <Line x1="6" y1="12" x2="2" y2="12" />
          <Line x1="12" y1="6" x2="12" y2="2" />
          <Line x1="12" y1="22" x2="12" y2="18" />
        </Svg>
      );

    case 'clock':
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="10" />
          <Polyline points="12 6 12 12 16 14" />
        </Svg>
      );

    case 'bell':
      return (
        <Svg {...p}>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );

    case 'smartphone':
      return (
        <Svg {...p}>
          <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <Line x1="12" y1="18" x2="12.01" y2="18" />
        </Svg>
      );

    case 'shield':
      return (
        <Svg {...p}>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </Svg>
      );

    case 'lock':
      return (
        <Svg {...p}>
          <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
      );

    case 'mail':
      return (
        <Svg {...p}>
          <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <Polyline points="22,6 12,13 2,6" />
        </Svg>
      );

    case 'arrow-right':
      return (
        <Svg {...p}>
          <Line x1="5" y1="12" x2="19" y2="12" />
          <Polyline points="12 5 19 12 12 19" />
        </Svg>
      );

    case 'log-out':
      return (
        <Svg {...p}>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Polyline points="16 17 21 12 16 7" />
          <Line x1="21" y1="12" x2="9" y2="12" />
        </Svg>
      );

    case 'check':
      return (
        <Svg {...p}>
          <Polyline points="20 6 9 17 4 12" />
        </Svg>
      );

    case 'chevron-down':
      return (
        <Svg {...p}>
          <Polyline points="6 9 12 15 18 9" />
        </Svg>
      );

    case 'chevron-right':
      return (
        <Svg {...p}>
          <Polyline points="9 18 15 12 9 6" />
        </Svg>
      );

    case 'trash':
      return (
        <Svg {...p}>
          <Polyline points="3 6 5 6 21 6" />
          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </Svg>
      );

    case 'sun':
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="5" />
          <Line x1="12" y1="1" x2="12" y2="3" />
          <Line x1="12" y1="21" x2="12" y2="23" />
          <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <Line x1="1" y1="12" x2="3" y2="12" />
          <Line x1="21" y1="12" x2="23" y2="12" />
          <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </Svg>
      );

    case 'coffee':
      return (
        <Svg {...p}>
          <Path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <Line x1="6" y1="1" x2="6" y2="4" />
          <Line x1="10" y1="1" x2="10" y2="4" />
          <Line x1="14" y1="1" x2="14" y2="4" />
        </Svg>
      );

    case 'moon':
      return (
        <Svg {...p}>
          <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </Svg>
      );

    case 'activity':
      return (
        <Svg {...p}>
          <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </Svg>
      );

    case 'refresh':
      return (
        <Svg {...p}>
          <Polyline points="23 4 23 10 17 10" />
          <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </Svg>
      );

    case 'cloud':
      return (
        <Svg {...p}>
          <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </Svg>
      );

    case 'cpu':
      return (
        <Svg {...p}>
          <Rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
          <Rect x="9" y="9" width="6" height="6" />
          <Line x1="9" y1="1" x2="9" y2="4" />
          <Line x1="15" y1="1" x2="15" y2="4" />
          <Line x1="9" y1="20" x2="9" y2="23" />
          <Line x1="15" y1="20" x2="15" y2="23" />
          <Line x1="20" y1="9" x2="23" y2="9" />
          <Line x1="20" y1="15" x2="23" y2="15" />
          <Line x1="1" y1="9" x2="4" y2="9" />
          <Line x1="1" y1="15" x2="4" y2="15" />
        </Svg>
      );

    case 'x':
      return (
        <Svg {...p}>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );

    case 'user-plus':
      return (
        <Svg {...p}>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle cx="8.5" cy="7" r="4" />
          <Line x1="20" y1="8" x2="20" y2="14" />
          <Line x1="23" y1="11" x2="17" y2="11" />
        </Svg>
      );

    case 'alert-circle':
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" y1="8" x2="12" y2="12" />
          <Line x1="12" y1="16" x2="12.01" y2="16" />
        </Svg>
      );

    case 'trending-up':
      return (
        <Svg {...p}>
          <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <Polyline points="17 6 23 6 23 12" />
        </Svg>
      );

    default:
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="10" />
        </Svg>
      );
  }
}
