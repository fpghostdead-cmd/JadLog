import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const carouselImages = [
  "https://media.base44.com/images/public/69fa0b24ccef03b266228836/84a0ab52d_carousel-pickup-BTzaf9mz.webp",
  "https://media.base44.com/images/public/69fa0b24ccef03b266228836/e80d903a5_carousel-entregas-iVihIp3M.webp",
  "https://media.base44.com/images/public/69fa0b24ccef03b266228836/92340a493_carousel-predict-CTqVRtes.webp",
];

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/rastreio?code=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Search bar */}
      <div style={{ background: "#BA1E34", color: "#FFF", paddingTop: "12px" }} className="w-full">
        <div className="flex flex-wrap items-center px-3 pb-3">
          {/* Icon + Title */}
          <div className="flex items-center gap-2 mr-4">
            <img
              src="https://www.jadlog.com.br/jadlog/img/icon_header.png"
              alt="Ícone rastreio"
              className="h-10 w-auto"
            />
            <p style={{ color: "#FFF", fontSize: "10.2px", marginTop: "7px" }}>
              <b>RASTREIE SUA ENCOMENDA</b>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-0 mt-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="CNPJ OU REMESSA"
              maxLength={14}
              style={{ fontSize: "0.7em" }}
              className="h-[30px] px-2 text-foreground placeholder:text-gray-400 border-0 outline-none"
            />
            <button
              type="submit"
              style={{ background: "#dc0032", borderRadius: 0, border: "none", height: "30px", marginRight: "5px" }}
              className="px-4 text-white font-bold text-sm"
            >
              <b>Procurar</b>
            </button>
          </form>
        </div>
      </div>

      {/* Carousel below search */}
      <div className="w-full relative overflow-hidden" style={{ minHeight: "180px" }}>
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {carouselImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Banner ${i + 1}`}
              className="w-full shrink-0 object-cover"
              style={{ minWidth: "100%" }}
            />
          ))}
        </div>
        {/* Dots over carousel */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {carouselImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}