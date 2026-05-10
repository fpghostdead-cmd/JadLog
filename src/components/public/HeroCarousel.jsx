import React, { useState, useEffect } from "react";

const images = [
  "https://media.base44.com/images/public/69fa0b24ccef03b266228836/84a0ab52d_carousel-pickup-BTzaf9mz.webp",
  "https://media.base44.com/images/public/69fa0b24ccef03b266228836/e80d903a5_carousel-entregas-iVihIp3M.webp",
  "https://media.base44.com/images/public/69fa0b24ccef03b266228836/92340a493_carousel-predict-CTqVRtes.webp",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Banner ${i + 1}`}
            className="w-full shrink-0 object-cover"
          />
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}