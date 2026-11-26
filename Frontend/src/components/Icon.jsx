const shapes = {
  plus: "M12 5v14M5 12h14",
  search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14M16 16l5 5",
  down: "m7 10 5 5 5-5",
  left: "m15 18-6-6 6-6",
  right: "m9 18 6-6-6-6",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
  file: "M14 2H6v20h12V8zM14 2v6h6M9 13h6M9 17h6",
  calendar: "M3 5h18v16H3zM16 3v4M8 3v4M3 11h18",
  cpu: "M5 5h14v14H5zM9 9h6v6H9zM9 1v4M15 1v4M9 19v4M15 19v4",
  code: "m8 6-5 6 5 6m8-12 5 6-5 6m-2-14-4 20",
  people:
    "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  chart: "M4 19V9h4v10m2 0V4h4v15m2 0v-7h4v7",
  headset: "M3 14v-3a9 9 0 0 1 18 0v3M3 14h4v6H3zM17 14h4v6h-4z",
  briefcase: "M3 7h18v14H3zM8 7V4h8v3M3 12h18",
  tools: "m14 6 4 4M3 21l10-10m1-7a5 5 0 0 0 6 6l-5 5-6-6 5-5",
};

export default function Icon({ name, size = 14, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={shapes[name] || shapes.code} />
    </svg>
  );
}
