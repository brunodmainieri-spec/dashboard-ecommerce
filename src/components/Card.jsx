// Shell "glass" reutilizável — replica o card do design-system:
// rounded-3xl, backdrop-blur, gradiente from-white/10 to-white/0 e borda hairline em gradiente.
export default function Card({ className = '', children, accent, style }) {
  if (accent) {
    // Card de destaque com fundo saturado (KPIs principais)
    return (
      <section
        className={`rounded-3xl p-5 border border-white/15 shadow-lg ${className}`}
        style={{ backgroundColor: accent, ...style }}
      >
        {children}
      </section>
    )
  }
  return (
    <section
      className={`glass-border rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/0 backdrop-blur-lg p-5 shadow-lg shadow-black/20 ${className}`}
      style={{ '--border-radius-before': '24px', ...style }}
    >
      {children}
    </section>
  )
}
