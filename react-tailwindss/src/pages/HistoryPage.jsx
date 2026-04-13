import { Link } from "react-router-dom";
import { historyMonths, statusBarClass } from "../data/history";
import { ChevronLeft, ChevronRight } from "../components/Icons";

export default function HistoryPage() {
  return (
    <>
      <div className="flex flex-col gap-6 text-sm">
        <div className="w-full h-px bg-slate-100 dark:bg-slate-700" />
        <nav>
          <Link
            to="/"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 hover:dark:text-slate-100 cursor-pointer touch-manipulation no-underline"
          >
            OpenAI
          </Link>
          <span className="text-slate-600 dark:text-slate-300"> / </span>
          <span className="text-slate-900 dark:text-slate-50 font-medium">
            History
          </span>
        </nav>
      </div>

      <section className="flex flex-col gap-6">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-2">
          <div className="flex md:items-center justify-between md:flex-row flex-col md:gap-2 gap-4 items-start">
            <div className="flex items-center space-x-4">
              <h2 className="text-slate-900 dark:text-slate-50 text-base font-semibold m-0">
                History
              </h2>
              <div className="hidden md:flex items-center text-sm font-normal space-x-1 mt-[1px] text-slate-500">
                <button
                  type="button"
                  className="p-0.5 rounded text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300 bg-transparent border-0 cursor-pointer"
                  aria-label="上一时间段"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="select-none flex justify-center whitespace-nowrap text-slate-400 dark:text-slate-500">
                  2026年1月<span className="px-1">-</span>2026年4月
                </div>
                <span
                  className="p-0.5 rounded text-slate-100 dark:text-slate-700 cursor-not-allowed inline-flex"
                  aria-hidden
                >
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {historyMonths.map((month) => (
          <div key={month.id} className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 m-0">
              {month.label}
            </h3>
            {month.groups.map((g) => (
              <div
                key={`${month.id}-${g.day}`}
                className="border-b border-slate-50 dark:border-slate-800 pb-4"
              >
                <div className="flex gap-3">
                  <div className="flex items-stretch gap-1 shrink-0 py-3 w-12">
                    <div className="text-slate-900 dark:text-slate-50 text-sm font-semibold self-start">
                      {g.day}
                    </div>
                    <div className="text-slate-400 dark:text-slate-300 text-xs font-medium self-start mt-[3px]">
                      {g.weekday}
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 grow">
                    {g.incidents.map((inc) => (
                      <a
                        key={inc.id}
                        href={inc.href}
                        className="flex gap-3 hover:bg-slate-50 hover:dark:bg-slate-800 rounded-lg py-3 cursor-pointer touch-manipulation no-underline"
                      >
                        <div
                          className={`w-1 ml-3 shrink-0 rounded-[1px] ${statusBarClass[inc.status]}`}
                        />
                        <div className="flex flex-col gap-1 grow min-w-0">
                          <div className="flex justify-between gap-3">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-50 self-start">
                              {inc.title}
                            </div>
                            <div className="text-xs font-medium text-slate-400 dark:text-slate-500 self-start mt-[3px] pr-3 shrink-0">
                              {inc.time}
                            </div>
                          </div>
                          <div className="text-sm font-normal text-slate-600 dark:text-slate-300 break-words">
                            <p className="mb-[10px] last:mb-0 whitespace-pre-line m-0">
                              {inc.summary}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    </>
  );
}
