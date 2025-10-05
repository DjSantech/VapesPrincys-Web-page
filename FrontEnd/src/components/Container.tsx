// src/components/Container.tsx
type Props = React.PropsWithChildren<{ className?: string }>;
export default function Container({ children, className = "" }: Props) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
