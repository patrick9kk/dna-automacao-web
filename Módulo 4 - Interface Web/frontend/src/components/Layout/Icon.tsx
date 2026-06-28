import React from 'react';

interface Props {
  name: string;
  size?: number | string;
  color?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<Props> = ({ name, size = 20, color, style }) => (
  <span
    className="material-icons"
    style={{ fontSize: size, color, lineHeight: 1, verticalAlign: 'middle', userSelect: 'none', ...style }}
  >
    {name}
  </span>
);

export default Icon;
