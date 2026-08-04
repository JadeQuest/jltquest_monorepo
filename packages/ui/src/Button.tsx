export interface ButtonProps {
  children?: any;
  onClick?: () => void;
  style?: any;
  className?: string;
  [key: string]: any;
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
