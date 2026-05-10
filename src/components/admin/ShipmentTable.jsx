import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Copy, Trash } from "lucide-react";
import { toast } from "sonner";
import BulkEditDialog from "./BulkEditDialog";

const statusLabels = {
  pendente: "Pendente",
  em_transito: "Em Trânsito",
  saiu_para_entrega: "Saiu p/ Entrega",
  entregue: "Entregue",
  devolvido: "Devolvido",
};

const statusVariants = {
  pendente: "bg-muted text-foreground",
  em_transito: "bg-primary/10 text-primary",
  saiu_para_entrega: "bg-amber-100 text-amber-700",
  entregue: "bg-green-100 text-green-700",
  devolvido: "bg-destructive/10 text-destructive",
};

export default function ShipmentTable({ shipments, onEdit, onDelete, onBulkUpdate, onBulkDelete }) {
  const [selected, setSelected] = useState([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const toggleOne = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === shipments.length ? [] : shipments.map((s) => s.id));

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const allChecked = shipments.length > 0 && selected.length === shipments.length;
  const someChecked = selected.length > 0 && selected.length < shipments.length;

  return (
    <>
      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 mb-3">
          <span className="text-sm font-medium text-primary">{selected.length} selecionado(s)</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowBulkEdit(true)}>
              <Pencil className="w-3 h-3 mr-1" /> Editar em massa
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => { onBulkDelete(selected); setSelected([]); }}
            >
              <Trash className="w-3 h-3 mr-1" /> Remover selecionados
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelected([])}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary">
              <TableHead className="w-10">
                <Checkbox
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked; }}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead className="hidden md:table-cell">Cidade/UF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhuma encomenda cadastrada.
                </TableCell>
              </TableRow>
            )}
            {shipments.map((s) => (
              <TableRow key={s.id} className={`hover:bg-secondary/50 ${selected.includes(s.id) ? "bg-primary/5" : ""}`}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(s.id)}
                    onCheckedChange={() => toggleOne(s.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm">{s.tracking_code}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(s.tracking_code)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{s.recipient_name}</p>
                    {s.recipient_document && (
                      <p className="text-xs text-muted-foreground">{s.recipient_document}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {s.city} / {s.state}
                </TableCell>
                <TableCell>
                  <div>
                    <Badge className={`${statusVariants[s.status]} border-0 text-xs`}>
                      {statusLabels[s.status] || s.status}
                    </Badge>
                    {s.recipient_email && (
                      <p className="text-xs text-muted-foreground mt-1">{s.recipient_email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(s)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(s)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BulkEditDialog
        open={showBulkEdit}
        onOpenChange={setShowBulkEdit}
        selectedIds={selected}
        onSave={(data) => {
          onBulkUpdate(selected, data);
          setSelected([]);
          setShowBulkEdit(false);
        }}
      />
    </>
  );
}