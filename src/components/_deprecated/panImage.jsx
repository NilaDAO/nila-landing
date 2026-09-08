import React from "react";

export default function PanImage() {
  return (
    <div className="relative w-full h-224 overflow-hidden">
      <picture>
        <source
          media="(max-width: 768px)"
          srcSet="/img_mobile.jpeg"
        />
        <source
          media="(min-width: 769px)"
          srcSet="/img_desktop.jpeg"
        />
        <img
          src="/img_desktop.jpeg"
          className="absolute inset-0 w-full h-full object-cover animate-pan z-0 rotate-180"
          alt="nila.in"
          style={{ display: "block" }}
        />
      </picture>

      <style>
        {`
          @keyframes pan {
            0% { transform: translate(-15%, -10%) scale(1.3); }
            50% { transform: translate(16%, 10%) scale(1.3); }
            100% { transform: translate(-15%, -10%) scale(1.3); }
          }
          .animate-pan {
            animation: pan 150s linear infinite;
          }
        `}
      </style>
    </div>
  );
}
