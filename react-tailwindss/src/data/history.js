/** 示例数据，结构对齐状态页 History（按月份 → 按日分组 → 多条事件） */
export const historyMonths = [
  {
    id: "apr",
    label: "四月",
    groups: [
      {
        day: "11日",
        weekday: "周六",
        incidents: [
          {
            id: "i1",
            href: "#",
            status: "green",
            title: "Some users may experience issues accessing ChatGPT",
            time: "09:48",
            summary: "All impacted services have now fully recovered.",
          },
        ],
      },
      {
        day: "10日",
        weekday: "周五",
        incidents: [
          {
            id: "i2",
            href: "#",
            status: "yellow",
            title: "Issue with API platform login and account creation",
            time: "13:20",
            summary: "All impacted services have now fully recovered.",
          },
          {
            id: "i3",
            href: "#",
            status: "green",
            title: "Issues with share link creation on web UI",
            time: "12:46",
            summary: "All impacted services have now fully recovered.",
          },
        ],
      },
      {
        day: "09日",
        weekday: "周四",
        incidents: [
          {
            id: "i4",
            href: "#",
            status: "yellow",
            title: "Elevated Errors with Login",
            time: "01:44",
            summary: "All impacted services have now fully recovered.",
          },
        ],
      },
    ],
  },
  {
    id: "mar",
    label: "三月",
    groups: [
      {
        day: "31日",
        weekday: "周二",
        incidents: [
          {
            id: "i5",
            href: "#",
            status: "yellow",
            title:
              "Elevated failures for some users joining ChatGPT Enterprise and ChatGPT Edu workspaces via SSO.",
            time: "23:00",
            summary: "All impacted services have now fully recovered.",
          },
        ],
      },
    ],
  },
];

export const statusBarClass = {
  green: "bg-[#24C19A] dark:bg-[#1FA382]",
  yellow: "bg-[#FBBF24] dark:bg-[#F59E0B]",
  orange: "bg-[#F5785C] dark:bg-[#F25533]",
  red: "bg-[#F87171] dark:bg-[#EF4444]",
};
