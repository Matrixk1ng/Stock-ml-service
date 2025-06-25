import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  borderClass?: string;
}

export default function Card({ title, children, borderClass = "border border-black rounded-xl" }: CardProps) {
  return (
    <div className={`bg-white shadow p-6 ${borderClass}`}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
} 