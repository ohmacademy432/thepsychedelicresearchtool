function App() {
  return (
    <div className="flex min-h-screen flex-col bg-parchment text-charcoal">
      <header className="border-b border-sage/40 bg-parchment-soft">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <h1 className="font-serif text-xl font-semibold text-forest sm:text-2xl">
            OHM Academy <span className="text-sage-deep">— Facilitator Screening Tool</span>
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-charcoal-soft">
          Project scaffolded. Phase 1 lookup UI coming next.
        </p>
      </main>

      <footer className="border-t border-sage/40 bg-parchment-soft">
        <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-charcoal-soft sm:px-6">
          Harm-reduction reference only. Not medical advice. Every flagged interaction requires licensed clinician sign-off.
        </div>
      </footer>
    </div>
  )
}

export default App
