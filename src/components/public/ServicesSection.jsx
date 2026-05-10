import React from "react";
import { Truck, ShoppingCart, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Truck,
    title: "Package",
    description: "Entregas porta a porta em todo o Brasil.",
  },
  {
    icon: ShoppingCart,
    title: ".COM",
    description: "Solução ideal para e-commerces de qualquer tamanho.",
  },
  {
    icon: Home,
    title: "Pickup",
    description: "Mais de 5 mil pontos de coleta espalhados pelo país.",
  },
];

export default function ServicesSection() {
  return (
    <section id="servicos" className="px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-primary font-medium mb-1">Conheça Nossos</p>
          <h2 className="text-2xl font-bold">Produtos e Serviços</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
            Somos o caminho para qualquer que seja a sua necessidade logística.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-base mb-1">{service.title}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}