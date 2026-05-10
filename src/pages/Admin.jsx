import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, Truck, LogOut, Loader2, Upload, Download, Copy, Check, FileSpreadsheet, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ShipmentForm from "../components/admin/ShipmentForm";
import ShipmentTable from "../components/admin/ShipmentTable";
import BulkImport from "../components/admin/BulkImport";
import CsvImport from "../components/admin/CsvImport";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [deletingShipment, setDeletingShipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const expiry = parseInt(localStorage.getItem("admin_token_expiry") || "0");
    if (token !== "78TGYHBFNI76YTDGBU7FG56" || Date.now() > expiry) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_token_expiry");
      window.location.href = "/admin-login";
      return;
    }
    setAuthenticated(true);
    setLoading(false);
  }, []);

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
    enabled: authenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (newData) => {
      const { error } = await supabase.from("shipments").insert(newData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase.from("shipments").update({ ...data, updated_date: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      setShowForm(false);
      setEditingShipment(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("shipments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      setDeletingShipment(null);
    },
  });

  const handleSave = (formData) => {
    const { id, created_date, updated_date, ...cleanData } = formData;
    if (editingShipment) {
      updateMutation.mutate({ id: editingShipment.id, data: cleanData });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setShowForm(true);
  };

  const statusLabels = {
    pendente: "Pendente",
    em_transito: "Em Trânsito",
    saiu_para_entrega: "Saiu para Entrega",
    entregue: "Entregue",
    devolvido: "Devolvido",
  };

  const getExportText = () => {
    return shipments.map((s, i) => {
      const lastEvent = s.events?.length > 0 ? s.events[s.events.length - 1] : null;
      return [
        `--- Encomenda ${i + 1} ---`,
        `Código: ${s.tracking_code}`,
        `Destinatário: ${s.recipient_name}`,
        s.recipient_document ? `CPF/CNPJ: ${s.recipient_document}` : null,
        s.recipient_address ? `Telefone: ${s.recipient_address}` : null,
        s.product_name ? `Produto: ${s.product_name}` : null,
        s.product_value ? `Valor Pago: ${s.product_value}` : null,
        `Local: ${s.city} - ${s.state}`,
        s.recipient_email ? `E-mail: ${s.recipient_email}` : null,
        lastEvent ? `Último evento: ${lastEvent.description} (${lastEvent.location}, ${lastEvent.date})` : null,
      ].filter(Boolean).join("\n");
    }).join("\n\n");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getExportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredShipments = shipments.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.tracking_code?.toLowerCase().includes(q) ||
      s.recipient_name?.toLowerCase().includes(q) ||
      s.recipient_document?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-foreground text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold">Painel Admin</span>
              <p className="text-xs text-white/60">Jadlog - Gerenciamento</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_token_expiry");
              window.location.href = "/";
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", count: shipments.length, icon: Package },
            { label: "Pendentes", count: shipments.filter((s) => s.status === "pendente").length, icon: Package },
            { label: "Em Trânsito", count: shipments.filter((s) => s.status === "em_transito").length, icon: Truck },
            { label: "Entregues", count: shipments.filter((s) => s.status === "entregue").length, icon: Package },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border p-4">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.count}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nome ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowExport(true)} className="shrink-0" disabled={shipments.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Lista
          </Button>
          <Button variant="outline" onClick={() => setShowBulkImport(true)} className="shrink-0">
            <Upload className="w-4 h-4 mr-2" />
            Importar Lista
          </Button>
          <Button variant="outline" onClick={() => setShowCsvImport(true)} className="shrink-0">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Importar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteAll(true)}
            className="shrink-0 text-destructive border-destructive/40 hover:bg-destructive/10"
            disabled={shipments.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Apagar Tudo
          </Button>
          <Button onClick={() => { setEditingShipment(null); setShowForm(true); }} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Nova Encomenda
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ShipmentTable
            shipments={filteredShipments}
            onEdit={handleEdit}
            onDelete={setDeletingShipment}
            onBulkUpdate={(ids, data) => {
              ids.forEach((id) => updateMutation.mutate({ id, data }));
            }}
            onBulkDelete={(ids) => {
              ids.forEach((id) => deleteMutation.mutate(id));
            }}
          />
        )}
      </div>

      {showForm && (
        <ShipmentForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingShipment(null);
          }}
          onSave={handleSave}
          editingShipment={editingShipment}
        />
      )}

      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Exportar Lista de Encomendas</DialogTitle>
          </DialogHeader>
          <textarea
            readOnly
            value={getExportText()}
            className="w-full h-72 text-xs font-mono border rounded-lg p-3 bg-muted resize-none focus:outline-none"
          />
          <Button onClick={handleCopy} className="w-full">
            {copied ? <><Check className="w-4 h-4 mr-2" />Copiado!</> : <><Copy className="w-4 h-4 mr-2" />Copiar tudo</>}
          </Button>
        </DialogContent>
      </Dialog>

      <CsvImport
        open={showCsvImport}
        onOpenChange={setShowCsvImport}
        onImported={() => queryClient.invalidateQueries({ queryKey: ["shipments"] })}
      />

      <BulkImport
        open={showBulkImport}
        onOpenChange={setShowBulkImport}
        onImported={() => queryClient.invalidateQueries({ queryKey: ["shipments"] })}
      />

      <AlertDialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar toda a lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os <strong>{shipments.length} registros</strong> serão removidos permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={deletingAll}
              onClick={async (e) => {
                e.preventDefault();
                setDeletingAll(true);
                const ids = shipments.map((s) => s.id);
                await supabase.from("shipments").delete().in("id", ids);
                queryClient.invalidateQueries({ queryKey: ["shipments"] });
                setDeletingAll(false);
                setShowDeleteAll(false);
              }}
            >
              {deletingAll ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Apagando…</> : "Apagar Tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingShipment} onOpenChange={() => setDeletingShipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir encomenda?</AlertDialogTitle>
            <AlertDialogDescription>
              O código <strong>{deletingShipment?.tracking_code}</strong> será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deletingShipment.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
