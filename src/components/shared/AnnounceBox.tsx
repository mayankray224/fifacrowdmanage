import React from "react";

interface AnnounceBoxProps {
  message: string;
  priority?: "polite" | "assertive";
}

export default function AnnounceBox({ message, priority = "polite" }: AnnounceBoxProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only absolute w-1 h-1 p-0 -m-1 overflow-hidden clip-rect border-0"
      style={{
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
