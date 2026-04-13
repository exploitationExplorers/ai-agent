export function IconOperational({ className = "w-4 h-4" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 text-icon-operational dark:text-emerald-500 ${className}`}
      aria-hidden
    >
      <path
        d="M8 0C3.589 0 0 3.589 0 8C0 12.411 3.589 16 8 16C12.411 16 16 12.411 16 8C16 3.589 12.411 0 8 0ZM11.947 5.641C10.088 7.023 8.512 8.931 7.264 11.31C7.135 11.557 6.879 11.712 6.6 11.712C6.323 11.715 6.062 11.555 5.933 11.305C5.358 10.188 4.715 9.28 3.968 8.529C3.676 8.236 3.677 7.76 3.971 7.468C4.263 7.176 4.739 7.176 5.032 7.471C5.605 8.047 6.122 8.699 6.595 9.443C7.834 7.398 9.329 5.717 11.053 4.436C11.385 4.19 11.855 4.258 12.102 4.591C12.349 4.923 12.28 5.394 11.947 5.641Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconInfo({ className = "w-4 h-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}

export function IconChevronDown({ className = "w-2.5 h-1.5" }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M9 0.980774L5.25 5.01924L1.5 0.980774"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 展开态（与原站 path 一致，箭头朝上） */
export function IconChevronUp({ className = "w-2.5 h-1.5" }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M9 5.01923L5.25 0.980765L1.5 5.01923"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCalendarHistory({ className = "h-5 w-5" }) {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M6.75 5.5A.75.75 0 0 1 6 4.75v-2a.75.75 0 0 1 1.5 0v2a.75.75 0 0 1-.75.75ZM13.25 5.5a.75.75 0 0 1-.75-.75v-2a.75.75 0 0 1 1.5 0v2a.75.75 0 0 1-.75.75Z"
      />
      <path
        fill="currentColor"
        d="M14.75 4h-9.5A2.752 2.752 0 0 0 2.5 6.75v8.5A2.752 2.752 0 0 0 5.25 18h9.5a2.752 2.752 0 0 0 2.75-2.75v-8.5A2.752 2.752 0 0 0 14.75 4Zm0 12.5h-9.5c-.689 0-1.25-.561-1.25-1.25V9h12v6.25c0 .689-.561 1.25-1.25 1.25Z"
      />
    </svg>
  );
}

export function ChevronLeft({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M15.75 19.5L8.25 12l7.5-7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRight({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
