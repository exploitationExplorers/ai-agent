import { Link } from "react-router-dom";
import { IconOperational, ChevronLeft, ChevronRight, IconCalendarHistory } from "../components/Icons";
import SystemStatusRow from "../components/SystemStatusRow";
import {
  apisSubcomponents,
  chatgptSubcomponents,
  codexSubcomponents,
  soraSubcomponents,
  fedrampSubcomponents,
} from "../data/componentLists";

function DateRangeNav() {
  return (
    <div className="hidden md:flex items-center text-sm font-normal space-x-1 mt-[1px] text-slate-500">
      <button
        type="button"
        className="p-0.5 rounded text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300 bg-transparent border-0 cursor-pointer"
        aria-label="Previous range"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="select-none flex justify-center whitespace-nowrap text-slate-400 dark:text-slate-500">
        2026年1月<span className="px-1">-</span>2026年4月
      </div>
      <span
        className="p-0.5 rounded text-slate-200 dark:text-slate-700 cursor-not-allowed inline-flex"
        aria-hidden
      >
        <ChevronRight className="w-4 h-4" />
      </span>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <div
        data-testid="heads-up"
        className="rounded-lg p-px shadow-sm dark:shadow-none bg-gradient-to-b from-emerald-500/25 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-900/20"
      >
        <div className="relative rounded-[7px] bg-white dark:bg-slate-900">
          <div className="rounded-t-[7px] text-base font-medium px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center text-slate-900 dark:text-slate-50 py-0.5 list-none">
              <IconOperational className="w-4 h-4 mr-2" />
              We’re fully operational
            </div>
          </div>
          <div className="text-slate-900 dark:text-slate-100">
            <div className="text-sm">
              <div className="text-slate-900 dark:text-slate-50 p-4">
                We’re not aware of any issues affecting our systems.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        data-testid="system-status"
        className="rounded-lg p-px shadow-sm dark:shadow-none border border-slate-200/90 dark:border-slate-700/80"
      >
        <div className="relative rounded-[7px] bg-white dark:bg-slate-900">
          <div className="rounded-t-[7px] text-base font-medium px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex md:items-center justify-between md:flex-row flex-col md:gap-2 gap-4 items-start">
              <div className="flex items-center space-x-4">
                <h2 className="text-slate-900 dark:text-slate-50 text-base font-medium m-0">
                  System status
                </h2>
                <DateRangeNav />
              </div>
            </div>
          </div>
          <div className="text-slate-900 dark:text-slate-100">
            <div className="divide-y divide-solid text-sm divide-slate-50 dark:divide-slate-800">
              <SystemStatusRow
                title="APIs"
                componentsLabel="12 components"
                uptime="99.99"
                chartSeed={0x51a11}
                showInfo
                subcomponents={apisSubcomponents}
              />
              <SystemStatusRow
                title="ChatGPT"
                componentsLabel="12 components"
                uptime="99.85"
                chartSeed={0x9b001}
                showInfo
                subcomponents={chatgptSubcomponents}
              />
              <SystemStatusRow
                title="Codex"
                componentsLabel="5 components"
                uptime="100"
                chartSeed={0xc0d31}
                showInfo={false}
                subcomponents={codexSubcomponents}
              />
              <SystemStatusRow
                title="Sora"
                componentsLabel="5 components"
                uptime="99.95"
                chartSeed={0x50a2}
                showInfo
                subcomponents={soraSubcomponents}
              />
              <SystemStatusRow
                title="FedRAMP"
                componentsLabel="1 component"
                uptime="100"
                chartSeed={0xf3d}
                showInfo={false}
                subcomponents={fedrampSubcomponents}
              />
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/history"
        className="flex justify-center cursor-pointer touch-manipulation no-underline"
      >
        <span
          title="View history"
          className="transition text-sm focus:outline-none px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 flex gap-1 items-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <IconCalendarHistory />
          <span className="text-sm mt-0.5">View history</span>
        </span>
      </Link>
    </>
  );
}
