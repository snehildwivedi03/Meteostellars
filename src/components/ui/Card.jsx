export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`flex flex-col space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
