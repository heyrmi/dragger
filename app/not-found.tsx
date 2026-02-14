import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="font-mono text-6xl font-bold text-text-secondary">404</div>
      <h1 className="font-heading text-xl font-bold">Page not found</h1>
      <p className="text-text-secondary">
        Nothing to see here. Maybe it went up in smoke.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-sm bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-hover transition-colors active:scale-[0.98]"
      >
        Go home
      </Link>
    </div>
  );
}
