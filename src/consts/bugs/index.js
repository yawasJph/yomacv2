const statusLabels = {
  pending: "Pending",
  in_review: "In Review",
  resolved: "Resolved",
};

export const REPORT_BUGS = {
  queryKey: "admin_bug_reports",
  table: "bug_reports",
  status: {
    pending: "Pending",
    in_review: "In_Review",
    resolved: "Resolved",
    default: "all",
  },
  statusLabels: {
    pending: "Pendiente",
    in_review: "En revision",
    resolved: "Resuelto",
    default: "Todos"
  },
  category: {
    bug: "Bug",
    suggestion: "Suggestion",
    default: "all",
  },
  categoryLabels: {
    bug: "Bug",
    suggestion: "Sugerencia",
    default: "Todos"
  },
};

