import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/home";
  return (
    <div className="auth-page">
      <section className="auth-sheet">
        <p className="journal-kicker">A shared household food journal</p>
        <h1 className="font-display mt-2 text-4xl text-ink">Come back to the table</h1>
        <p className="mt-3 text-sm text-ink-soft">Enter your email and we’ll send a secure sign-in link. No password needed.</p>
        <SignInForm initialError={error} next={safeNext} />
      </section>
    </div>
  );
}
