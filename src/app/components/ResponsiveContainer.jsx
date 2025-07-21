// hack-ai/app/src/components/ResponsiveContainer.jsx
export default function ResponsiveContainer({ children, className = "" }) {
    return (
      <div className={`w-full px-4 py-4 md:px-6 lg:px-8 ${className}`}>
        {children}
      </div>
    );
  }