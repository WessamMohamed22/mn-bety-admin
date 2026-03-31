"use client";
import React, { useEffect, useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as AdminService from "@/services/admin.service";
import { AdminStats } from "@/types/admin";
import { 
  Users, ShieldCheck, UserMinus, UserPlus, 
  TrendingUp, PieChart as PieIcon, BarChart3, 
  Calendar as CalendarIcon, Clock as ClockIcon, Activity, ChevronRight
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await AdminService.getPlatformStats();
        setStats(res.data.stats);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  const roleData = stats ? Object.entries(stats.byRole).map(([name, value]) => ({ name, value })) : [];
  const statusData = [
    { name: "Active", value: stats?.activeUsers || 0, color: "#EA580C" },
    { name: "Deleted", value: stats?.deletedUsers || 0, color: "#1E293B" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] min-h-screen text-slate-900 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Dashboard Console</h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium">Real-time platform insights and user metrics.</p>
        </div>
        <button className="w-full sm:w-auto bg-slate-900 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group text-sm">
          <Activity size={18} className="group-hover:rotate-12 transition-transform" />
          SYSTEM REPORT
        </button>
      </div>

      {/* --- 1. STATS GRID (RESPONSIVE) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {[
          { label: "Total Users", val: stats?.totalUsers, icon: <Users />, color: "text-blue-600", bg: "bg-blue-100/50" },
          { label: "Verified", val: stats?.verifiedUsers, icon: <ShieldCheck />, color: "text-emerald-600", bg: "bg-emerald-100/50" },
          { label: "New Growth", val: stats?.newThisMonth, icon: <UserPlus />, color: "text-orange-600", bg: "bg-orange-100/50" },
          { label: "Suspended", val: stats?.deletedUsers, icon: <UserMinus />, color: "text-rose-600", bg: "bg-rose-100/50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {React.cloneElement(item.icon as React.ReactElement, { size: 22 })}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{item.val?.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      {/* --- 2. ANALYTICS ROW (RESPONSIVE) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Main Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-4xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2">
              <BarChart3 size={18} className="text-orange-600" /> User Distribution
            </h2>
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            </div>
          </div>
          <div className="h-62.5 sm:h-87.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#EA580C" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col items-center">
          <h2 className="text-sm font-black uppercase self-start mb-6 tracking-tight">Integrity Ratio</h2>
          <div className="h-62.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius="70%" outerRadius="90%" dataKey="value" paddingAngle={10}>
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-slate-50">
              <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Active</p>
                  <p className="text-lg font-black text-orange-600">{stats?.activeUsers}</p>
              </div>
              <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Suspended</p>
                  <p className="text-lg font-black text-slate-900">{stats?.deletedUsers}</p>
              </div>
          </div>
        </div>
      </div>

      {/* --- 3. LIVE SECTION: CALENDAR & GLASS CLOCK (RESPONSIVE) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-4xl border border-slate-100 shadow-sm order-2 lg:order-1">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon size={18} className="text-orange-600" />
            <h2 className="text-sm font-black uppercase tracking-tight">System Calendar</h2>
          </div>
          <div className="custom-calendar-responsive">
            <Calendar onChange={setDate} value={date} className="border-none w-full" />
          </div>
        </div>

        {/* High-End Glass Clock */}
        <div className="lg:col-span-7 relative overflow-hidden bg-[#0F172A] rounded-4xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between order-1 lg:order-2 min-h-75">
          {/* Animated Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[100px]"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Live Sync</span>
            </div>
            <ClockIcon size={20} className="text-slate-500" />
          </div>

          <div className="relative z-10 flex flex-col items-center sm:items-start py-8">
            <div className="flex items-baseline gap-3">
              <span className="text-6xl sm:text-8xl font-black tracking-tighter text-white">
                {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-orange-500 text-3xl sm:text-5xl font-black tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { second: '2-digit' })}
              </span>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Timezone</p>
                    <p className="text-xs font-black text-white">{Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1].replace('_', ' ')}</p>
                </div>
                <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Date</p>
                    <p className="text-xs font-black text-white">{currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-center border-t border-white/5 pt-6 mt-4">
              <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 w-3/4 animate-pulse"></div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase italic">Uptime: 99.9%</span>
              </div>
              <ChevronRight className="text-white/20" size={20} />
          </div>
        </div>

      </div>

      {/* --- GLOBAL STYLES --- */}
      <style jsx global>{`
        .react-calendar { width: 100% !important; border: none !important; font-family: inherit !important; background: transparent !important; }
        .react-calendar__tile--active { background: #EA580C !important; border-radius: 12px !important; color: white !important; font-weight: 800; }
        .react-calendar__tile:hover { background: #FFF7ED !important; border-radius: 12px !important; color: #EA580C !important; }
        .react-calendar__navigation button { font-size: 1.1rem; font-weight: 800; color: #0F172A; }
        .react-calendar__month-view__weekdays__weekday { text-decoration: none !important; font-size: 0.7rem; font-weight: 900; color: #94A3B8; text-transform: uppercase; }
        abbr[title] { text-decoration: none !important; }
      `}</style>
    </div>
  );
}