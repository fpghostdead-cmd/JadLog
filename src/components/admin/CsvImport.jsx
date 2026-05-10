import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { getCityStateFromPhone } from "@/lib/dddMap";

function generateTrackingCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = () => Math.floor(Math.random() * 9000 + 1000);
  const let2 = () => letters[Math.floor(Math.random() * 26)] + letters[Math.floor(Math.random() * 26)];
  return `JD${nums()}${let2()}${nums()}BR`;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if ((line[i] === "," || line[i] === ";") && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
}

export default function CsvImport({ open, onOpenChange, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setError("Arquivo inválido ou vazio.");
        return;
      }
      const hdrs = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
      setHeaders(hdrs);
      const rows = lines.slice(1, 6).map((l) => parseCsvLine(l));
      setPreview(rows);
    };
    reader.readAsText(f, "UTF-8");
  };

  const normalizeRow = (hdrs, cols) => {
    const row = {};
    hdrs.forEach((h, i) => { row[h] = cols[i] || ""; });

    const phone = row.recipient_document || row.telefone || row.celular || row.fone || row.cpf || row.cnpj || row.documento || "";
    let city = row.city || row.cidade || "";
    let state = row.state || row.estado || row.uf || "";
    if (!city && phone) {
      const fromDdd = getCityStateFromPhone(phone);
      if (fromDdd) { city = fromDdd.city; state = fromDdd.state; }
    }

    return {
      tracking_code: row.tracking_code || row.codigo || row.rastreio || row.remessa || generateTrackingCode(),
      recipient_name: row.recipient_name || row.nome || row.destinatario || row.nome_destinatario || "",
      recipient_document: row.recipient_document || row.cpf || row.cnpj || row.documento || "",
      recipient_email: row.recipient_email || row.email || "",
      recipient_address: row.recipient_address || row.endereco || row.endereço || "",
      city,
      state,
      product_name: row.product_name || row.produto || row.descricao || "",
      product_value: row.product_value || row.valor || "",
      purchase_date: row.purchase_date || row.data_compra || row.data || "",
      status: row.status || "pendente",
    };
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target.result;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const hdrs = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
      const rows = lines.slice(1);

      const toImport = [];
      let failed = 0;

      for (const line of rows) {
        if (!line.trim()) continue;
        const cols = parseCsvLine(line);
        const data = normalizeRow(hdrs, cols);
        if (!data.recipient_name && !data.tracking_code) { failed++; continue; }
        toImport.push(data);
      }

      const { error } = await supabase.from("shipments").insert(toImport);
      if (error) throw error;
      const success = toImport.length;

      setResult({ success, failed });
      setImporting(false);
      onImported();
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setResult(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Importar CSV / Excel
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Faça upload de um arquivo <strong>.csv</strong>. As colunas reconhecidas são:
              <br />
              <span className="font-mono text-xs">nome, cidade, estado, cpf, produto, valor, status, tracking_code…</span>
            </p>

            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current.click()}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              {file ? (
                <p className="font-semibold text-sm">{file.name}</p>
              ) : (
                <p className="text-muted-foreground text-sm">Clique para selecionar um arquivo CSV</p>
              )}
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {preview.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <table className="text-xs w-full">
                  <thead className="bg-muted">
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-1.5 truncate max-w-[120px]">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground px-3 py-2">Pré-visualização das primeiras 5 linhas</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleImport} disabled={!file || importing}>
                {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importando…</> : <>Importar</>}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="font-bold text-lg">Importação concluída!</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-green-600 font-semibold">{result.success} importados</span>
                {result.failed > 0 && <span className="text-destructive font-semibold"> · {result.failed} ignorados</span>}
              </p>
            </div>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}