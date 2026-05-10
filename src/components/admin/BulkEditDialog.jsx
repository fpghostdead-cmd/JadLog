import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "em_transito", label: "Em Trânsito" },
  { value: "saiu_para_entrega", label: "Saiu para Entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "devolvido", label: "Devolvido" },
];

export default function BulkEditDialog({ open, onOpenChange, selectedIds, onSave }) {
  const [status, setStatus] = useState("");

  const handleSave = () => {
    if (!status) return;
    onSave({ status });
    setStatus("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar em massa</DialogTitle>
          <p className="text-sm text-muted-foreground">{selectedIds.length} encomenda(s) selecionada(s)</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Novo Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status..." />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!status}>
            Aplicar a {selectedIds.length} encomenda(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}