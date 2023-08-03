import { IconTypes } from "./IconTypes";

export const DoubleArrowDownSVG: React.FC<IconTypes> = ({
  color,
  height,
  width,
  className
}) => {
  return (
    <svg
      fill={color}
      height={height}
      width={width}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
    >
      <path d="M480-200 240-440l42-42 198 198 198-198 42 42-240 240Zm0-253L240-693l42-42 198 198 198-198 42 42-240 240Z" />
    </svg>
  );
};
