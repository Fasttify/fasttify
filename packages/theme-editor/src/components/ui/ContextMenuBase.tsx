import { ReactNode, useRef } from 'react';

interface ContextMenuBaseProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  children: ReactNode;
  className?: string;
  menuRef?: React.RefObject<HTMLDivElement>;
}

export const ContextMenuBase = ({
  isOpen,
  onClose,
  position,
  children,
  className = 'min-w-40',
  menuRef,
}: ContextMenuBaseProps) => {
  const defaultMenuRef = useRef<HTMLDivElement>(null);
  const ref = menuRef || defaultMenuRef;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay para cerrar al hacer click fuera */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menú contextual */}
      <div
        ref={ref}
        className={`fixed bg-white border border-gray-300 rounded-md shadow-xl z-50 ${className}`}
        style={{
          left: position.x,
          top: position.y,
        }}>
        {children}
      </div>
    </>
  );
};
