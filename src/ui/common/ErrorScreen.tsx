/** Friendly fallback if a page crashes (instead of a blank/technical screen). */
import { Link, useRouteError } from 'react-router-dom';

export default function ErrorScreen() {
  const error = useRouteError();
  console.error(error);
  return (
    <main className="flex min-h-full items-center justify-center bg-sky-100 p-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-sm space-y-3 rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <p className="text-5xl" aria-hidden>🌊</p>
        <h1 className="text-xl font-extrabold">Oops, a wave knocked something over.</h1>
        <p className="text-slate-600 dark:text-slate-300">Please reload the page. If it keeps happening, let us know at heapspark.com.</p>
        <div className="flex justify-center gap-2">
          <button className="min-h-12 rounded-full bg-spark-500 px-5 font-bold text-white" onClick={() => location.reload()}>Reload</button>
          <Link to="/" className="flex min-h-12 items-center rounded-full bg-slate-100 px-5 font-bold dark:bg-slate-800" reloadDocument>Back to the island</Link>
        </div>
      </div>
    </main>
  );
}
