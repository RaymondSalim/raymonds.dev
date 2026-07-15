import { IconProps } from '../common/interface/IconProps';

export default function Moon(props?: IconProps) {
  return (
    <svg
      className={props?.className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      height={props?.height ?? '24'}
      width={props?.width ?? '24'}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      />
    </svg>
  );
}
