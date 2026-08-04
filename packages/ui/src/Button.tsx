import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        background: '#0066cc',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
