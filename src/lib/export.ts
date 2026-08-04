export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: { key: keyof T; label: string }[]
): void {
  if (!data.length) return;

  const columns = headers || Object.keys(data[0]).map((key) => ({
    key,
    label: String(key).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  const csvRows = [
    columns.map((c) => c.label).join(","),
    ...data.map((row) =>
      columns
        .map((c) => {
          const value = row[c.key];
          if (value === null || value === undefined) return "";
          const str = String(value);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportLeadsToCSV(leads: Array<{
  id: string;
  name: string;
  phone: string;
  email?: string;
  budget: string;
  area: string;
  status: string;
  assigned: string;
  date?: string;
  source?: string;
  requirement?: string;
}>): void {
  exportToCSV(leads, "leads", [
    { key: "id", label: "Lead ID" },
    { key: "name", label: "Customer Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "budget", label: "Budget" },
    { key: "area", label: "Preferred Area" },
    { key: "status", label: "Status" },
    { key: "assigned", label: "Assigned To" },
    { key: "date", label: "Date" },
    { key: "source", label: "Source" },
    { key: "requirement", label: "Requirement" },
  ]);
}

export function exportUsersToCSV(users: Array<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  created: string;
}>): void {
  exportToCSV(users, "users", [
    { key: "id", label: "User ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "created", label: "Created" },
  ]);
}

export function exportDashboardStatsToCSV(stats: {
  total_leads: number;
  today_leads: number;
  hot_leads: number;
  total_properties: number;
  total_projects: number;
  total_users: number;
  revenue_mtd: string;
}): void {
  const data = [
    { metric: "Total Leads", value: stats.total_leads },
    { metric: "Today's Leads", value: stats.today_leads },
    { metric: "Hot Leads", value: stats.hot_leads },
    { metric: "Total Properties", value: stats.total_properties },
    { metric: "Total Projects", value: stats.total_projects },
    { metric: "Total Users", value: stats.total_users },
    { metric: "Revenue (MTD)", value: stats.revenue_mtd },
  ];
  exportToCSV(data, "dashboard_stats", [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
  ]);
}