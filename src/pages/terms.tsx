import Link from 'next/link';

/** Legal text is not yet published; this page states that plainly instead of showing a blank screen. */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-sifter-dark text-sifter-text p-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-sifter-text-muted hover:text-sifter-text transition-colors">
          Back to Sifter
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Terms and conditions</h1>
        <div className="mt-6 rounded-xl border border-sifter-border bg-sifter-card p-6">
          <p className="text-sifter-text-muted">
            The terms for using Sifter have not been published yet. This page will carry them once they are.
          </p>
        </div>
      </div>
    </div>
  );
}
