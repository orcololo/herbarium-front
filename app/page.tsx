import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3D27] via-[#234A30] to-[#2D5F3F] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaf-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 20C50 20 30 30 30 50C30 66.56 43.44 80 50 80C56.56 80 70 66.56 70 50C70 30 50 20 50 20Z" fill="white" />
              <path d="M50 20C50 20 50 50 32 68" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#leaf-pattern)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C16 4 6 10 6 20C6 25.52 10.48 30 16 30C21.52 30 26 25.52 26 20C26 10 16 4 16 4Z" fill="white" fillOpacity="0.9"/>
                <path d="M16 4C16 4 16 14 10 20" stroke="#1A3D27" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white text-lg font-bold tracking-tight">Folium</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 text-sm font-medium text-white/90 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="px-5 py-2.5 text-sm font-medium bg-white text-[#2D5F3F] rounded-full hover:bg-white/90 transition-colors shadow-sm">
              Criar conta
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="px-6 pt-16 pb-24 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Caderneta Botânica<br />
              <span className="text-[#A5D6A7]">de Campo Digital</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Registre espécimes, georreferencie coletas e sincronize dados em campo — mesmo sem internet. O Folium é a ferramenta completa para botânicos e herbários.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <a
                href="https://github.com/orcololo/field_book/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 bg-white text-[#1A3D27] rounded-full font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="#1A3D27"/>
                </svg>
                Baixar App (GitHub)
              </a>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-7 py-4 border-2 border-white/30 text-white rounded-full font-medium text-base hover:bg-white/10 transition-all"
              >
                Acessar painel web
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="w-64 h-[500px] bg-white/5 backdrop-blur-sm rounded-[40px] border border-white/10 p-3 shadow-2xl">
              <div className="w-full h-full rounded-[32px] bg-gradient-to-b from-[#E8F5E9] to-white flex flex-col items-center justify-center gap-4 p-6">
                <div className="w-16 h-16 rounded-full bg-[#3D7A52] flex items-center justify-center shadow-md">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4C16 4 6 10 6 20C6 25.52 10.48 30 16 30C21.52 30 26 25.52 26 20C26 10 16 4 16 4Z" fill="white" fillOpacity="0.9"/>
                    <path d="M16 4C16 4 16 14 10 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[#2D5F3F] font-bold text-lg">Folium</p>
                <p className="text-[#6D4C41] text-xs italic">Field Book</p>
                <div className="mt-4 space-y-2 w-full">
                  <div className="h-3 bg-[#E8F5E9] rounded-full w-full"></div>
                  <div className="h-3 bg-[#E8F5E9] rounded-full w-3/4"></div>
                  <div className="h-3 bg-[#E8F5E9] rounded-full w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 bg-black/10 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              Tudo que você precisa em campo
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 4 7 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 7 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2C12 2 12 10 8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                title="Registro de Espécimes"
                description="Cadastre coletas com dados taxonômicos, morfológicos, fotos e áudio — tudo em um só lugar."
              />
              <FeatureCard
                icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2V4M12 20V22M4 12H2M22 12H20M5.64 5.64L7.05 7.05M16.95 16.95L18.36 18.36M5.64 18.36L7.05 16.95M16.95 7.05L18.36 5.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                title="Funciona Offline"
                description="Colete dados sem conexão. O app sincroniza automaticamente quando você voltar à rede."
              />
              <FeatureCard
                icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                title="GPS e Georreferenciamento"
                description="Registre coordenadas, altitude e trilhas automaticamente durante sessões de coleta."
              />
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Comece a usar agora
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              Baixe o aplicativo no seu celular para coletas em campo, ou acesse o painel web para gerenciar seus dados.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/orcololo/field_book/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 bg-white text-[#1A3D27] rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="#1A3D27"/>
                </svg>
                Baixar App (GitHub)
              </a>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-4 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all"
              >
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">Folium Field Book</p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-white/50 text-sm hover:text-white/80 transition-colors">Entrar</Link>
              <Link href="/register" className="text-white/50 text-sm hover:text-white/80 transition-colors">Cadastrar</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-[#A5D6A7]/20 flex items-center justify-center text-[#A5D6A7] mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
