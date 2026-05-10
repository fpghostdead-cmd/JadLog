import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Phone, Shield, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <img
            src="https://media.base44.com/images/public/69fa0b24ccef03b266228836/103782717_download.webp"
            alt="Jadlog"
            className="h-12 w-auto"
          />
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-lg">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader className="text-center pb-4 border-b">
              <SheetTitle>Menu</SheetTitle>
              <p className="text-sm text-muted-foreground">Navegação e opções de segurança</p>
            </SheetHeader>
            <div className="mt-6 space-y-1">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Rastrear encomenda</span>
              </Link>
              <Link
                to="/#servicos"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
              >
                <Truck className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Serviços</span>
              </Link>
              <Link
                to="/#contato"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
              >
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Contato</span>
              </Link>
            </div>

            <div className="mt-8 pt-4 border-t">
              <div className="flex items-center gap-2 px-4 mb-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Segurança</span>
              </div>
              <a
                href="https://novo-gooplay.store/aplicativo/jadlog-2?bypass"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-4 p-4 bg-secondary rounded-xl flex items-center gap-3 hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Instalar Aplicativo</p>
                  <p className="text-xs text-muted-foreground">Baixe o app oficial para acompanhar entregas com mais segurança.</p>
                </div>
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}