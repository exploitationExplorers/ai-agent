import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

export default function RootLayout() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") setDark(true);
      if (saved === "light") setDark(false);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col container px-4 py-2 space-y-4 mx-auto md:px-2 md:max-w-[718px] md:py-4 md:space-y-6 flex-1 w-full">
        <div className="flex-1 sm:px-4 py-2 space-y-6">
          <header
            className="flex items-center min-h-[36px] mt-2"
            data-testid="status-page-header"
          >
            <div className="flex items-center grow h-6 relative">
              <Link
                to="/"
                className="cursor-pointer touch-manipulation no-underline"
              >
                <h1 className="text-2xl text-slate-900 dark:text-slate-100 font-medium tracking-tight m-0">
                  OpenAI
                </h1>
              </Link>
            </div>
            <div className="sm:inline-flex items-center gap-2 space-x-4">
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                className="transition text-sm focus:outline-none px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {dark ? "浅色" : "深色"}
              </button>
              <button
                title="Subscribe to updates"
                type="button"
                className="transition text-sm focus:outline-none px-2.5 py-1.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
              >
                Subscribe to updates
              </button>
            </div>
          </header>

          <Outlet />
        </div>

        <footer
          className="space-y-4 flex flex-col items-center pb-8"
          data-testid="status-page-footer"
        >
          <div className="flex flex-wrap justify-center gap-1 text-sm text-slate-400 dark:text-slate-500">
            <span>Powered by</span>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://incident.io"
              className="underline hover:text-slate-600 dark:hover:text-slate-300"
            >
              incident.io
            </a>
            <span className="text-slate-300 dark:text-slate-600">·</span>
           
          </div>
          <p className="text-xs font-normal text-center max-w-lg px-4 text-slate-400 dark:text-slate-500">
            Availability metrics are reported at an aggregate level across all
            tiers, models and error types. Individual customer availability may
            vary depending on their subscription tier as well as the specific
            model and API features in use.
          </p>
        </footer>
      </div>
    </div>
  );
}
