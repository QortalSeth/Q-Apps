import { IconTypes } from "./IconTypes";

export const PlaylistSVG: React.FC<IconTypes> = ({
  color,
  height,
  width,
  className,
  onClickFunc
}) => {
  return (
    <svg  onClick={onClickFunc}
    className={className}
    fill={color}
    height={height}
    width={width} xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960" ><path d="M120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Zm520 520v-320l240 160-240 160Z"/></svg>
    
  );
};
