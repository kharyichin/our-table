import { SignInForm } from "@/components/auth/SignInForm";
import { AuthBookShell } from "@/components/auth/AuthBookShell";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/home";
  return (
    <AuthBookShell
      title="Come back to the table"
      introduction="Use your email to open the household cookbook. We’ll send one secure link—there’s no password to remember."
    >
      <SignInForm initialError={error} next={safeNext} />
    </AuthBookShell>
  );
}
