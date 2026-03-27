export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* مكان الـ Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 hidden md:block">
        <div className="p-6 font-bold text-2xl text-purple-600 border-b">
          Mn Bety Admin
        </div>
        <div className="p-4 text-gray-500"> sidebar content </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h2 className="text-lg font-semibold text-gray-800">لوحة التحكم</h2>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}