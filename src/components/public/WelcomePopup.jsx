import React, { useState, useEffect } from "react";

export default function WelcomePopup() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const handleBack = () => setOpen(false);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 cursor-pointer"
      onClick={() => setOpen(false)}
    >
      <img
        src="https://www.jadlog.com.br/jadlog/img/pop_golpesJadlog.png"
        alt="Aviso Jadlog"
        className="max-w-lg w-full rounded-xl shadow-2xl"
      />
    </div>
  );
}