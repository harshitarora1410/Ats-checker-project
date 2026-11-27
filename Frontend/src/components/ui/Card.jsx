// card/base — white, 1px gray-200 border, radius 12
export default function Card({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white ${className}`} {...rest}>
      {children}
    </div>
  );
}
