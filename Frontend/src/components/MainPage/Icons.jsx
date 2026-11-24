// Inline SVG icons (no icon library needed).
// Pass a Tailwind className to size / colour them, e.g. <CheckIcon className="h-3 w-3" />

function Icon({ className = "h-4 w-4", children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const CheckIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

export const XIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const AlertIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </Icon>
);

export const CloudUploadIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
    <path d="M12 12v9M8 16l4-4 4 4" />
  </Icon>
);

export const CopyIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

export const WandIcon = ({ className }) => (
  <Icon className={className}>
    <path d="m15 4 1-2M19 8l2-1M15 4l5 5L7 22l-5-5L15 4Z" />
  </Icon>
);

export const FileTextIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M8 13h8M8 17h8" />
  </Icon>
);
