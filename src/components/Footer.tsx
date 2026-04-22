export function Footer() {
  return (
    <footer className="border-t border-sage/40 bg-parchment-soft">
      <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-charcoal-soft sm:px-6">
        Clinical research companion for licensed facilitators and clinicians.
        AI-generated research — verify with clinical review before making
        treatment decisions. &copy; The Psychedelic Nurse &middot;{" "}
        <a
          href="https://www.thepsychedelicnurse.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-sage/60 underline-offset-2 hover:text-forest"
        >
          thepsychedelicnurse.org
        </a>
      </div>
    </footer>
  );
}
