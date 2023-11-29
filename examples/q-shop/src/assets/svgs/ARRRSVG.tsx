import { IconTypes } from "./IconTypes";

export const ARRRSVG: React.FC<IconTypes> = ({ color, height, width }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      id="Layer_1"
      x="0px"
      y="0px"
      viewBox="0 0 2000 2000"
      style={{ width, height }}
      xmlSpace="preserve"
    >
      <linearGradient
        id="SVGID_1_"
        gradientUnits="userSpaceOnUse"
        x1="0"
        y1="-2"
        x2="2000"
        y2="-2"
        gradientTransform="matrix(1 0 0 1 0 1002)"
      >
        <stop offset="0"></stop>
        <stop offset="1"></stop>
      </linearGradient>
      <path
        fill={color}
        d="M1000,0C447.6,0,0,447.6,0,1000s447.6,1000,1000,1000s1000-447.6,1000-1000S1552.4,0,1000,0z M548.6,741.5  c0-123.6,100.2-223.1,224.6-223.1h512.4c58.6,0,114.9,23,156.7,64.1l-262.2,131.9h-361c-40.7,0-73.1,29.4-73.1,64.8v160.5  l-196.7,102.5V741.5L548.6,741.5z M1507.9,1075.4c0,123.6-100.2,223.1-223.1,223.1H745.3v190.7c0,32.4-24.1,58.8-52.8,65.6  l-67.1,1.5h-76.9v-331.6l257-134.1h431.8c40.7,0,74.6-29.4,74.6-65.6V828.9l195.9-98.7L1507.9,1075.4L1507.9,1075.4z"
      ></path>
    </svg>
  );
};
