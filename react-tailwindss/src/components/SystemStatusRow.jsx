import { useId, useState } from "react";
import { motion } from "framer-motion";
import {
  IconChevronDown,
  IconChevronUp,
  IconInfo,
  IconOperational,
} from "./Icons";
import UptimeChart from "./UptimeChart";

/** 与原站类似的缓动（偏 Material） */
const EASE = [0.4, 0, 0.2, 1];
const DURATION_PANEL = 0.28;
const DURATION_SUMMARY = 0.22;

/** 子行：对齐原站展开后每条 component 的 DOM 结构 */
function SubComponentRow({ name, uptime, chartSeed }) {
  return (
    <div>
      <div className="h-7 flex flex-grow items-center">
        <div className="shrink-0 flex items-center">
          <IconOperational className="w-4 h-4 mr-2" />
        </div>
        <div className="hidden md:flex space-x-2 flex-grow items-center min-w-0 text-sm">
          <div className="flex space-x-1.5 items-center min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 m-0 truncate">
              {name}
            </h3>
            <div
              className="flex flex-row items-center cursor-pointer group transition"
              aria-hidden
            />
          </div>
          <div className="flex-grow min-w-2" />
          <div className="ml-2 font-normal flex flex-row items-center gap-1 text-slate-400 shrink-0">
            <span className="whitespace-nowrap">{uptime}% uptime</span>
          </div>
        </div>
        <div className="flex md:hidden items-center text-sm min-w-0 flex-1">
          <h3 className="font-medium m-0 truncate">{name}</h3>
        </div>
      </div>
      <div className="hidden md:flex">
        <div className="w-full mt-1">
          <div className="text-slate-500">
            <UptimeChart seed={chartSeed} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SystemStatusRow({
  title,
  componentsLabel,
  uptime,
  chartSeed,
  showInfo = true,
  subcomponents = null,
}) {
  const expandable = Array.isArray(subcomponents) && subcomponents.length > 0;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleId = `${panelId}-toggle`;

  const childSeeds = expandable
    ? subcomponents.map((_, i) => (chartSeed + (i + 1) * 10007) >>> 0)
    : [];

  const toggle = () => {
    if (expandable) setOpen((v) => !v);
  };

  const hideParentSummary = expandable && open;

  const parentChartInner = (
    <>
      <div className="hidden md:flex w-full mt-1">
        <div className="text-slate-500 w-full">
          <UptimeChart seed={chartSeed} />
        </div>
      </div>
      <div className="md:hidden w-full mt-2">
        <div className="text-slate-500 w-full">
          <UptimeChart seed={chartSeed} />
        </div>
      </div>
    </>
  );

  return (
    <div className="p-4 md:pt-3 md:pb-3 text-sm">
      <div>
        <div className="h-7 flex flex-grow items-center">
          {expandable ? (
            <motion.div
              className="flex shrink-0 items-center overflow-hidden"
              initial={false}
              animate={
                hideParentSummary
                  ? { opacity: 0, width: 0, marginRight: 0 }
                  : { opacity: 1, width: 24, marginRight: 0 }
              }
              transition={{ duration: DURATION_SUMMARY, ease: EASE }}
              aria-hidden={hideParentSummary}
            >
              <IconOperational className="w-4 h-4 mr-2 shrink-0" />
            </motion.div>
          ) : (
            <div className="flex shrink-0 items-center">
              <IconOperational className="w-4 h-4 mr-2" />
            </div>
          )}
          <div className="hidden md:flex space-x-2 flex-grow items-center min-w-0">
            <div className="flex space-x-1.5 items-center min-w-0">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate m-0">
                {title}
              </h3>
              {showInfo && !hideParentSummary ? (
                <span
                  className="transition text-slate-300 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300 mt-[1px] hidden md:inline-flex"
                  aria-hidden
                >
                  <IconInfo />
                </span>
              ) : null}
              {hideParentSummary ? (
                <div
                  className="flex flex-row items-center cursor-pointer group transition"
                  aria-hidden
                />
              ) : null}
            </div>
            {expandable ? (
              <button
                id={toggleId}
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex items-center cursor-pointer group transition text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 shrink-0 bg-transparent border-0 p-0 font-inherit text-sm"
              >
                <span className="hidden md:inline">{componentsLabel}</span>
                <span className="flex items-center justify-center w-3 h-6 mt-[2px] ml-1">
                  {open ? (
                    <IconChevronUp className="text-slate-300 dark:text-slate-500 transition group-hover:text-slate-900 dark:group-hover:text-slate-300" />
                  ) : (
                    <IconChevronDown className="text-slate-300 dark:text-slate-500 transition group-hover:text-slate-900 dark:group-hover:text-slate-300" />
                  )}
                </span>
              </button>
            ) : (
              <span className="flex items-center text-slate-500 shrink-0">
                <span className="hidden md:inline">{componentsLabel}</span>
              </span>
            )}
            <div className="flex-grow min-w-2" />
            {!hideParentSummary ? (
              <div className="ml-2 font-normal flex flex-row items-center gap-1 text-slate-400 shrink-0">
                <span className="whitespace-nowrap">{uptime}% uptime</span>
              </div>
            ) : (
              <div className="ml-2 font-normal flex flex-row items-center gap-1 text-slate-400 shrink-0" />
            )}
          </div>
          <div className="flex md:hidden items-center min-w-0 flex-1 justify-between gap-2">
            <button
              type="button"
              onClick={expandable ? toggle : undefined}
              disabled={!expandable}
              aria-expanded={expandable ? open : undefined}
              aria-controls={expandable ? panelId : undefined}
              aria-label={
                expandable
                  ? `${open ? "收起" : "展开"} ${title} 子组件`
                  : undefined
              }
              className={`flex items-center gap-2 min-w-0 text-left bg-transparent border-0 p-0 font-inherit ${
                expandable ? "cursor-pointer" : ""
              }`}
            >
              <h3 className="font-medium truncate m-0">{title}</h3>
              {expandable ? (
                <span className="flex items-center justify-center shrink-0 text-slate-400">
                  {open ? <IconChevronUp /> : <IconChevronDown />}
                </span>
              ) : null}
            </button>
            {!hideParentSummary ? (
              <span className="text-slate-400 text-xs shrink-0 whitespace-nowrap">
                {uptime}%
              </span>
            ) : null}
          </div>
        </div>

        {/* 父级汇总条：展开后高度 + 透明度过渡，overflow 裁剪（对齐 DevTools 里的 w-full + height + opacity） */}
        {expandable ? (
          <motion.div
            className="w-full"
            initial={false}
            animate={{
              height: hideParentSummary ? 0 : "auto",
              opacity: hideParentSummary ? 0 : 1,
            }}
            transition={{ duration: DURATION_SUMMARY, ease: EASE }}
            style={{ overflow: "hidden", overflowY: "hidden" }}
            aria-hidden={hideParentSummary}
          >
            {parentChartInner}
          </motion.div>
        ) : (
          <div className="w-full">{parentChartInner}</div>
        )}

        {/* 子列表：始终挂载以便测量高度，用 height 0 ↔ auto + opacity 做过渡 */}
        {expandable ? (
          <motion.div
            id={panelId}
            role="region"
            initial={false}
            animate={{
              height: open ? "auto" : 0,
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: DURATION_PANEL, ease: EASE }}
            style={{ overflow: "hidden", overflowY: "hidden" }}
            aria-hidden={!open}
          >
            <div className="flex flex-col space-y-2 pt-2">
              {subcomponents.map((sc, i) => (
                <SubComponentRow
                  key={sc.name}
                  name={sc.name}
                  uptime={sc.uptime}
                  chartSeed={childSeeds[i]}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
