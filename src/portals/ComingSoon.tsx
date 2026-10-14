/** Placeholder for portals that arrive in later build steps. */
import { Link } from 'react-router-dom';

export default function ComingSoon({ title, step }: { title: string; step: string }) {
  return (
    <main className="flex min-h-full items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-slate-900">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Arrives in build step ({step}).</p>
        <Link to="/" className="mt-4 inline-block rounded-full bg-spark-500 px-5 py-3 font-semibold text-white">
          Back to the island
        </Link>
      </div>
    </main>
  );
}
