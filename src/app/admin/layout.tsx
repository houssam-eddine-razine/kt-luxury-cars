import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <DashboardSidebar />

      <div className="lg:pl-64">
        <DashboardTopbar />

        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}