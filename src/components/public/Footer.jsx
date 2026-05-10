import React from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contato" className="bg-foreground text-white mt-12">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-4">
          <img
            src="https://media.base44.com/images/public/69fa0b24ccef03b266228836/103782717_download.webp"
            alt="Jadlog"
            className="h-12 w-auto brightness-0 invert"
          />
        </div>
        <p className="text-white/70 text-sm mb-8">
          Entregas rápidas, econômicas e seguras para todo o Brasil.
        </p>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-primary font-semibold text-sm mb-3">Atendimento</h4>
            <p className="text-white/70 text-sm">SAC: 0800 000 0000</p>
            <p className="text-white/70 text-sm">contato@jadlog.com.br</p>
          </div>
          <div>
            <h4 className="text-primary font-semibold text-sm mb-3">Links</h4>
            <div className="space-y-1">
              <Link to="/" className="block text-white/70 text-sm hover:text-white transition-colors">
                Rastrear encomenda
              </Link>
              <Link to="/#servicos" className="block text-white/70 text-sm hover:text-white transition-colors">
                Serviços
              </Link>
              <Link to="/admin" className="block text-white/70 text-sm hover:text-white transition-colors">
                Painel administrativo
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs">© 2026 Jadlog. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}