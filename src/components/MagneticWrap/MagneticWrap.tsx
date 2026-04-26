"use client";

import React, { useRef, useCallback } from "react";

interface MagneticWrapProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

const MagneticWrap: React.FC<MagneticWrapProps> = ({
  children,
  strength = 0.3,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)", willChange: "transform" }}
    >
      {children}
    </div>
  );
};

export default MagneticWrap;
