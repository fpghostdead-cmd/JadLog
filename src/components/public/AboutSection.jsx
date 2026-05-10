import React from "react";

export default function AboutSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-10 space-y-16">

      {/* Bloco 1 - Somos a Jadlog */}
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="md:w-1/2 rounded-2xl overflow-hidden shrink-0">
          <img
            src="https://www.jadlog.com.br/jadlog/img/ft_home01.jpg"
            alt="Entregador Jadlog"
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
            Somos a Jadlog,<br />
            <span className="text-primary">sua encomenda no<br />melhor caminho</span>
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> Somos transportadores. Somos pessoas.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> Somos mais de 5.000 colaboradores diretos e indiretos.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> Somos 7.000 veículos, caminhões e carretas que coletam e entregam sua encomenda.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> Somos o comércio do seu lado, com 4.000 parceiros Pickup.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> Somos parte do Grupo europeu líder em entrega de encomendas e soluções para comércio eletrônico, o Geopost.</li>
          </ul>
          <a
            href="https://novo-gooplay.store/aplicativo/jadlog-2?bypass"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Saiba mais
          </a>
        </div>
      </div>

      {/* Bloco 2 - Produtos e Serviços */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Conheça Nossos</p>
        <h3 className="text-2xl font-bold text-foreground">Produtos e Serviços</h3>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Somos o caminho para qualquer que seja a sua necessidade logística.
        </p>
      </div>

      {/* Bloco 3 - Seja um franqueado */}
      <div className="flex flex-col md:flex-row-reverse gap-8 items-center bg-secondary rounded-2xl p-8">
        <div className="md:w-1/2 rounded-2xl overflow-hidden shrink-0">
          <img
            src="https://www.jadlog.com.br/jadlog/img/outdoor02.png"
            alt="Seja um franqueado Jadlog"
            className="w-full object-contain"
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
            Seja um franqueado Jadlog e encontre{" "}
            <span className="text-primary">novos caminhos para seu sucesso profissional.</span>
          </h2>
          <a
            href="https://novo-gooplay.store/aplicativo/jadlog-2?bypass"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Saiba mais
          </a>
        </div>
      </div>

      {/* Bloco 4 - Últimas Notícias */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">Últimas Notícias da Jadlog</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Conteúdo exclusivo para manter você sempre informado sobre tudo que acontece por aqui e no mercado.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Jadlog expande operações no nordeste do Brasil", date: "Mai 2026" },
            { title: "Geopost anuncia novos investimentos em tecnologia logística", date: "Abr 2026" },
            { title: "Jadlog bate recorde de entregas em 2025", date: "Mar 2026" },
          ].map((news, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow space-y-2">
              <span className="text-xs text-primary font-semibold uppercase">{news.date}</span>
              <p className="font-semibold text-sm text-foreground leading-snug">{news.title}</p>
              <a href="https://novo-gooplay.store/aplicativo/jadlog-2?bypass" target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-medium hover:underline">Leia mais →</a>
            </div>
          ))}
        </div>
      </div>

      {/* Bloco 5 - Clientes */}
      <div className="space-y-4 text-center">
        <h3 className="text-2xl font-bold text-foreground">Conheça alguns clientes da Jadlog</h3>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Siga o caminho de quem já trabalha conosco e encontre as melhores soluções logísticas.
        </p>
        <div className="rounded-xl overflow-hidden border">
          <img
            src="https://www.jadlog.com.br/jadlog/img/home_clientes01.jpg"
            alt="Clientes Jadlog"
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* Bloco 6 - JadNews Banner */}
      <div>
        <a
          href="https://novo-gooplay.store/aplicativo/jadlog-2?bypass"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://www.jadlog.com.br/portal/assets/img/cint_jadnews.jpg"
            alt="JadNews"
            className="w-full object-contain rounded-xl"
          />
        </a>
      </div>

    </section>
  );
}