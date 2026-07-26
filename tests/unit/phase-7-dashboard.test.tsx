import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { AdminOverview } from "@/features/admin/analytics/model";
import { AdminDashboard } from "@/features/admin/analytics/dashboard";
import { AdminShell } from "@/features/admin/admin-shell";

vi.mock("recharts", () => ({
  Area: () => null,
  CartesianGrid: () => null,
  Line: () => null,
  LineChart: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

const emptyOverview: AdminOverview = {
  range: "30d",
  totals: {
    visitors: 0,
    pageViews: 0,
    contactSubmissions: 0,
    cvDownloads: 0,
  },
  trend: Array.from({ length: 30 }, (_, index) => ({
    bucket: `2026-07-${String(index + 1).padStart(2, "0")}`,
    pageViews: 0,
    visitors: 0,
  })),
  breakdowns: {
    pages: [],
    sources: [],
    countries: [],
    devices: [],
    browsers: [],
  },
  recentEvents: [],
};

describe("Phase 7 admin dashboard", () => {
  it("renders real DTO totals, default range, chart label, and empty states without samples", () => {
    render(<AdminDashboard overview={emptyOverview} />);

    expect(screen.getByRole("heading", { name: "Portfolio pulse." })).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Visitors and page views trend" })).toBeInTheDocument();
    expect(screen.getByText("Unique visitors").previousElementSibling).toHaveTextContent("0");
    expect(screen.getByText("Page views").previousElementSibling).toHaveTextContent("0");
    expect(screen.getByText("CV downloads").previousElementSibling).toHaveTextContent("0");
    expect(screen.getByText("Contact inquiries").previousElementSibling).toHaveTextContent("0");
    expect(screen.getByText("No activity recorded for this range yet.")).toBeInTheDocument();
    expect(screen.queryByText("1,284")).not.toBeInTheDocument();
    expect(screen.queryByText("sample data")).not.toBeInTheDocument();
  });

  it("renders range links using only approved range values", () => {
    render(<AdminDashboard overview={emptyOverview} />);

    const ranges = screen.getByRole("navigation", { name: "Dashboard range" });
    expect(within(ranges).getByRole("link", { name: "24h" })).toHaveAttribute(
      "href",
      "/admin?range=24h",
    );
    expect(within(ranges).getByRole("link", { name: "30d" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByText("bogus")).not.toBeInTheDocument();
  });

  it("keeps public navigation out of the private admin shell and exposes logout", () => {
    render(
      <AdminShell unreadCount={0}>
        <p>Private content</p>
      </AdminShell>,
    );

    expect(screen.getByRole("navigation", { name: "Admin views" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
    expect(screen.queryByText("Services")).not.toBeInTheDocument();
  });
});
