import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_transito", label: "Em Trânsito" },
  { value: "saiu_para_entrega", label: "Saiu para Entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "devolvido", label: "Devolvido" },
  { value: "numero_incorreto", label: "Número da Residência Incorreto" },
  { value: "nao_havia_destinatario", label: "Não havia ninguém no local" },
  { value: "entregador_nao_atendido", label: "Entregador não foi atendido" },
  { value: "personalizado", label: "✏️ Personalizado..." },
];

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function generateTrackingCode() {
  const num = Math.floor(100000000 + Math.random() * 900000000);
  return `JD${num}BR`;
}

export default function ShipmentForm({ open, onOpenChange, onSave, editingShipment }) {
  const isEdit = !!editingShipment;
  const [form, setForm] = useState(
    editingShipment || {
      tracking_code: generateTrackingCode(),
      recipient_name: "",
      recipient_document: "",
      city: "",
      state: "",
      status: "pendente",
      events: [],
    }
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventChange = (index, field, value) => {
    const newEvents = [...(form.events || [])];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setForm((prev) => ({ ...prev, events: newEvents }));
  };

  const addEvent = () => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setForm((prev) => ({
      ...prev,
      events: [
        ...(prev.events || []),
        { status: prev.status, description: "", location: `${prev.city} / ${prev.state}`, date: dateStr },
      ],
    }));
  };

  const removeEvent = (index) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Encomenda" : "Nova Encomenda"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Código de Rastreio</Label>
            <Input value={form.tracking_code} onChange={(e) => handleChange("tracking_code", e.target.value)} />
          </div>
          <div>
            <Label>Nome do Destinatário</Label>
            <Input value={form.recipient_name} onChange={(e) => handleChange("recipient_name", e.target.value)} required />
          </div>
          <div>
            <Label>CPF / CNPJ</Label>
            <Input value={form.recipient_document} onChange={(e) => handleChange("recipient_document", e.target.value)} />
          </div>
          <div>
            <Label>Nome da Rua</Label>
            <Input value={form.street_name || ""} onChange={(e) => handleChange("street_name", e.target.value)} placeholder="Ex: Rua das Flores" />
          </div>
          <div>
            <Label>Número da Residência</Label>
            <Input value={form.street_number || ""} onChange={(e) => handleChange("street_number", e.target.value)} placeholder="Ex: 123" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cidade</Label>
              <Input value={form.city} onChange={(e) => handleChange("city", e.target.value)} required />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.state} onValueChange={(v) => handleChange("state", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Events */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Eventos de Rastreio</Label>
              <Button type="button" variant="outline" size="sm" onClick={addEvent}>
                <Plus className="w-4 h-4 mr-1" /> Evento
              </Button>
            </div>
            <div className="space-y-3">
              {(form.events || []).map((event, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => removeEvent(idx)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={STATUS_OPTIONS.some(s => s.value === event.status) ? event.status : "personalizado"}
                        onValueChange={(v) => handleEventChange(idx, "status", v === "personalizado" ? "" : v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(!STATUS_OPTIONS.some(s => s.value === event.status) || event.status === "personalizado" || event.status === "") && (
                        <Input
                          className="h-8 text-xs mt-1"
                          placeholder="Digite o status personalizado..."
                          value={event.status === "personalizado" ? "" : event.status}
                          onChange={(e) => handleEventChange(idx, "status", e.target.value)}
                        />
                      )}
                    </div>
                    <div>
                      <Label className="text-xs">Data/Hora</Label>
                      <Input className="h-8 text-xs" value={event.date} onChange={(e) => handleEventChange(idx, "date", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Input className="h-8 text-xs" value={event.description} onChange={(e) => handleEventChange(idx, "description", e.target.value)} placeholder="Ex: Pedido cadastrado" />
                  </div>
                  <div>
                    <Label className="text-xs">Local</Label>
                    <Input className="h-8 text-xs" value={event.location} onChange={(e) => handleEventChange(idx, "location", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            {isEdit ? "Salvar Alterações" : "Criar Encomenda"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}