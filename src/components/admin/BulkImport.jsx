import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Upload, Copy, Check } from "lucide-react";
import { supabase } from "@/api/supabaseClient";
import { format } from "date-fns";
import { getCityStateFromPhone } from "@/lib/dddMap";

function generateTrackingCode() {
  const num = Math.floor(100000000 + Math.random() * 900000000);
  return `JD${num}BR`;
}

function parseCityState(location) {
  const clean = location.replace(/[\u{1F300}-\u{1FFFF}]/gu, "").replace(/\t.*$/, "").trim();
  const match = clean.match(/^(.+?)\/([A-Z]{2})$/);
  if (match) return { city: match[1].trim(), state: match[2].trim() };
  return { city: clean, state: "" };
}

function parsePrice(text) {
  if (!text) return "";
  const match = text.match(/R\$\s?[\d.,]+/);
  return match ? match[0].trim() : "";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(str) {
  return EMAIL_REGEX.test(str.trim());
}

function parseKeyValueBlocks(text) {
  // Parse blocks separated by blank lines OR by dashed lines (---...)
  const normalized = text.replace(/\r/g, "");
  const blocks = normalized.split(/\n\s*-{3,}\s*\n|\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const leads = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const obj = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
      const val = line.slice(colonIdx + 1).trim();
      obj[key] = val;
    }

    const name = obj["nome"] || obj["name"] || "";
    if (!name) continue;

    const email = obj["e-mail"] || obj["email"] || "";
    const cpf = obj["cpf"] || obj["cnpj"] || obj["documento"] || "";
    const phone = obj["telefone"] || obj["celular"] || obj["fone"] || "";
    const price = obj["valor total"] || obj["valor"] || obj["preco"] || obj["preço"] || "";
    const product = obj["produto 1"] || obj["produto"] || obj["descricao"] || obj["descrição"] || "";
    const purchase_date = obj["data de pagamento"] || obj["data de criacao"] || obj["data"] || "";

    const phoneStr = phone.trim();
    let city = "";
    let state = "";
    if (phoneStr) {
      const fromDdd = getCityStateFromPhone(phoneStr);
      if (fromDdd) { city = fromDdd.city; state = fromDdd.state; }
    }

    leads.push({ name, phone: phoneStr, cpf, city, state, product, price, email, address: "", purchase_date });
  }

  return leads;
}

function parseLeads(text) {
  const leads = [];
  const normalized = text.replace(/\r/g, "");
  const allLines = normalized.split("\n").map((l) => l.trim()).filter(Boolean);

  // Detect key:value format (e.g. "Nome: Fulano")
  const kvLines = allLines.filter((l) => /^[A-Za-zÀ-ú\s]+:/.test(l) && l.includes(":"));
  if (kvLines.length >= 3) {
    return parseKeyValueBlocks(text);
  }

  // Detect two-column format: name\temail or name\nemail alternating
  // Check if text looks like a name+email list (many lines with emails)
  const emailLines = allLines.filter((l) => isEmail(l));
  const isTwoColumnEmail = emailLines.length >= 3;

  if (isTwoColumnEmail) {
    // Try tab-separated first (Name\tEmail per line)
    const tabSeparated = allLines.some((l) => l.includes("\t") && isEmail(l.split("\t")[1]?.trim()));
    if (tabSeparated) {
      for (const line of allLines) {
        const parts = line.split("\t");
        const name = parts[0]?.trim();
        const email = parts[1]?.trim();
        if (name && name.toLowerCase() !== "nome" && email && isEmail(email)) {
          leads.push({ name, phone: "", city: "", state: "", product: "", price: "", email, address: "", purchase_date: "" });
        }
      }
    } else {
      // Alternating lines: name, email, name, email...
      // Skip header lines like "E-mail", "Nome"
      const filtered = allLines.filter((l) => l.toLowerCase() !== "e-mail" && l.toLowerCase() !== "nome" && l.toLowerCase() !== "email");
      let i = 0;
      while (i < filtered.length) {
        const a = filtered[i];
        const b = filtered[i + 1];
        if (a && b && !isEmail(a) && isEmail(b)) {
          leads.push({ name: a, phone: "", city: "", state: "", product: "", price: "", email: b, address: "", purchase_date: "" });
          i += 2;
        } else if (a && isEmail(a)) {
          // just an email line, skip (header or orphan)
          i++;
        } else {
          i++;
        }
      }
    }
    return leads;
  }

  let i = 0;
  while (i < allLines.length) {
    const line = allLines[i];
    const segments = line.split("\t");
    const locSegment = segments.find((s) => /^[A-ZÀ-Üa-zà-ü\s]+(\/[A-Z]{2})$/.test(s.trim()));

    if (locSegment) {
      const name = segments.find(
        (s) =>
          /^[A-ZÀ-Üa-zà-ü]/.test(s.trim()) &&
          !/R\$/.test(s) &&
          !/unid/.test(s) &&
          !/Mop|Pendente|Enviar|⏳|👁/.test(s) &&
          s !== locSegment &&
          s.trim().length > 3
      );
      const phone = segments.find((s) => /^\(?\d{2}\)?[\s-]?\d{4,5}[-]?\d{4}/.test(s.trim()));
      const emailSeg = segments.find((s) => isEmail(s.trim()));
      const priceSegment = segments.find((s) => /R\$/.test(s));
      const price = parsePrice(priceSegment || "");
      const { city, state } = parseCityState(locSegment);

      if (name && city) {
        const phoneStr = (phone || "").trim();
        let finalCity = city;
        let finalState = state;
        if (!finalCity && phoneStr) {
          const fromDdd = getCityStateFromPhone(phoneStr);
          if (fromDdd) { finalCity = fromDdd.city; finalState = fromDdd.state; }
        }
        leads.push({ name: name.trim(), phone: phoneStr, city: finalCity, state: finalState, product: "", price, email: emailSeg?.trim() || "", address: "", purchase_date: "" });
      }
      i++;
      continue;
    }

    if (/^\d+$/.test(line)) {
      const name = allLines[i + 1] || "";
      const phone = allLines[i + 2] || "";
      const product = allLines[i + 3] || "";
      let cityLine = "";
      let price = "";
      let email = "";

      for (let j = i + 1; j < Math.min(i + 10, allLines.length); j++) {
        const candidate = allLines[j];
        if (isEmail(candidate) && !email) email = candidate;
        const cleanCandidate = candidate.split("\t")[0].trim();
        if (/^[A-ZÀ-Üa-zà-ü].+\/[A-Z]{2}$/.test(cleanCandidate)) { cityLine = cleanCandidate; break; }
        const tabSeg = candidate.split("\t").find((s) => /^[A-ZÀ-Üa-zà-ü].+\/[A-Z]{2}$/.test(s.trim()));
        if (tabSeg) { cityLine = tabSeg.trim(); break; }
        if (/R\$/.test(candidate) && !price) price = parsePrice(candidate);
      }

      if (name && cityLine) {
        const { city, state } = parseCityState(cityLine);
        const phoneStr = phone.trim();
        let finalCity = city;
        let finalState = state;
        if (!finalCity && phoneStr) {
          const fromDdd = getCityStateFromPhone(phoneStr);
          if (fromDdd) { finalCity = fromDdd.city; finalState = fromDdd.state; }
        }
        leads.push({ name: name.trim(), phone: phoneStr, city: finalCity, state: finalState, product: product.trim(), price, email, address: "", purchase_date: "" });
      }
    }

    i++;
  }

  const seen = new Set();
  return leads.filter((l) => {
    const key = `${l.name}|${l.city}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildExportText(results) {
  return results
    .filter((r) => r.success)
    .map((r, i) => {
      const l = r.lead;
      return [
        `--- Encomenda ${i + 1} ---`,
        `Nome: ${l.name}`,
        l.email ? `E-mail: ${l.email}` : null,
        l.cpf ? `CPF/CNPJ: ${l.cpf}` : null,
        l.phone ? `Telefone: ${l.phone}` : null,
        l.purchase_date ? `Data de Compra: ${l.purchase_date}` : null,
        l.product ? `Produto: ${l.product}` : null,
        l.price ? `Valor Pago: ${l.price}` : null,
        l.address ? `Endereço: ${l.address}` : null,
        `Cidade/UF: ${l.city} / ${l.state}`,
        `Rastreio: ${r.tracking_code}`,
      ].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

export default function BulkImport({ open, onOpenChange, onImported }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [step, setStep] = useState("input");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleParse = () => {
    const leads = parseLeads(text);
    const withTracking = leads.map((l) => ({ ...l, tracking_code: generateTrackingCode() }));
    setParsed(withTracking);
    setStep("preview");
  };

  const handleImport = async () => {
    setImporting(true);
    const now = new Date();
    const dateStr = format(now, "dd/MM/yyyy, HH:mm:ss");
    const importResults = [];

    for (const lead of parsed) {
      try {
        const { error } = await supabase.from("shipments").insert({
          tracking_code: lead.tracking_code,
          recipient_name: lead.name,
          recipient_document: lead.cpf || lead.phone,
          recipient_email: lead.email || "",
          recipient_address: lead.phone || "",
          city: lead.city,
          state: lead.state,
          product_name: lead.product || "",
          product_value: lead.price || "",
          purchase_date: lead.purchase_date || "",
          status: "pendente",
          events: [{ status: "pendente", description: "Pedido cadastrado", location: `${lead.city} / ${lead.state}`, date: dateStr }],
        });
        if (error) throw error;
        importResults.push({ lead, tracking_code: lead.tracking_code, success: true });
      } catch (e) {
        importResults.push({ lead, tracking_code: lead.tracking_code, success: false, error: e.message });
      }
    }

    setResults(importResults);
    setStep("done");
    setImporting(false);
    onImported();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildExportText(results));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setText(""); setParsed([]); setStep("input"); setResults([]); setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Importar Leads em Lote
          </DialogTitle>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cole a lista de leads. O sistema detectará automaticamente nome, telefone, produto, valor, cidade e estado — e gerará o código de rastreio automaticamente.
            </p>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={`1\nEdivania de Sousa Martins\n(62) 99427-1171\nMop Elétrico\n2x unid.\nR$ 156,68\tPalmeiras de Goiás/GO\t⏳ Pendente`} className="h-64 font-mono text-sm" />
            <Button className="w-full" onClick={handleParse} disabled={!text.trim()}>Analisar e Gerar Rastreios</Button>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground"><strong>{parsed.length}</strong> lead(s) identificado(s) com rastreios gerados. Revise e confirme.</p>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {parsed.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">Nenhum lead reconhecido. Tente colar novamente.</div>}
              {parsed.map((lead, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    {lead.product && <p className="text-xs text-muted-foreground">{lead.product}{lead.price && ` · ${lead.price}`}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className="text-xs">{lead.city}/{lead.state}</Badge>
                    <span className="font-mono text-xs text-primary font-semibold">{lead.tracking_code}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>Voltar</Button>
              <Button className="flex-1" onClick={handleImport} disabled={importing || parsed.length === 0}>
                {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importando...</> : `Criar ${parsed.length} Encomenda(s)`}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Importação concluída! {results.filter((r) => r.success).length} de {results.length} criado(s).</p>
            <div className="border rounded-lg divide-y max-h-56 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{r.lead.name}</p>
                    <p className="text-xs text-muted-foreground">{r.lead.city}/{r.lead.state}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.success ? (
                      <><span className="font-mono text-xs font-semibold text-primary">{r.tracking_code}</span><CheckCircle className="w-4 h-4 text-green-600" /></>
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("export")}>Ver Exportação Completa</Button>
              <Button className="flex-1" onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        )}

        {step === "export" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Lista completa com nome, e-mail, rastreio, CPF, data de compra, produto, valor pago e endereço.</p>
            <textarea readOnly value={buildExportText(results)} className="w-full h-72 text-xs font-mono border rounded-lg p-3 bg-muted resize-none focus:outline-none" />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("done")}>Voltar</Button>
              <Button className="flex-1" onClick={handleCopy}>
                {copied ? <><Check className="w-4 h-4 mr-2" />Copiado!</> : <><Copy className="w-4 h-4 mr-2" />Copiar tudo</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}