"use client";
import React, { useEffect, useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as AdminService from "@/services/admin.service";
import { AdminStats } from "@/types/admin";
import {
  Users, ShieldCheck, UserMinus, UserPlus,
  BarChart3, Calendar as CalendarIcon, Clock as  Activity,
 LayoutDashboard, Zap, ChevronRight
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
    <div className="flex h-screen items-center justify-center bg-[#F1F5F9]">
      <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const roleData = stats ? Object.entries(stats.byRole).map(([name, value]) => ({ name, value })) : [];
  const statusData = [
    { name: "Active", value: stats?.activeUsers || 0, color: "#EA580C" },
    { name: "Restricted", value: stats?.deletedUsers || 0, color: "#cbd5e1" },
  ];

  return (
    <div className="p-4 sm:p-5 bg-[#F8FAFC] min-h-screen text-slate-900 text-[13px]">

      {/* --- COMPACT HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
            <LayoutDashboard className="text-orange-500" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">System Monitor</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Node: Cluster-Alpha</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
            <Zap size={14} className="text-orange-500" /> Stats
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-md shadow-orange-100 flex items-center gap-2">
            <Activity size={14} /> Report
          </button>
        </div>
      </div>

      {/* --- 1. KPI COMPACT GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Members", val: stats?.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Verified", val: stats?.verifiedUsers, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Monthly", val: stats?.newThisMonth, icon: UserPlus, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Halted", val: stats?.deletedUsers, icon: UserMinus, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group relative">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 ${item.bg} ${item.color} rounded-lg flex items-center justify-center shrink-0`}>
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">{item.label}</p>
                <h3 className="text-lg font-black text-slate-900 tracking-tighter">
                  {item.val?.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- 2. ANALYTICS ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Compact Bar Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
              <BarChart3 size={14} className="text-orange-600" /> Platform Demographics
            </h2>
          </div>
          <div className="h-55 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#EA580C" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compact Pie Chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Integrity</h2>
          <div className="h-35 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius="60%" outerRadius="90%" dataKey="value" paddingAngle={5}>
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {statusData.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-bold p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span className="text-slate-500">{s.name}</span>
                </div>
                <span className="text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 3. CLOCK & CALENDAR ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* --- FUTURISTIC NEON CLOCK SECTION --- */}
        <div className="lg:col-span-7 bg-[#020617] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(234,88,12,0.15)] min-h-80 group">

          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-orange-600/20 rounded-full blur-[50px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>

          {/* Header of Clock Card */}
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]"></div>
              <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em]">Quantum Time Sync</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <div className="w-1 h-1 rounded-full bg-orange-500"></div>
            </div>
          </div>

          {/* Main Digital Display */}
          <div className="relative z-10 flex flex-col items-center justify-center py-4">
            <div className="relative">
              {/* Glow behind the text */}
              <div className="absolute inset-0 blur-3xl bg-orange-600/20 scale-150"></div>

              <div className="relative flex items-baseline gap-4">
                {/* Hours and Minutes */}
                <h2 className="text-7xl sm:text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                </h2>

                {/* Animated Seconds */}
                <div className="flex flex-col items-start">
                  <span className="text-3xl font-black text-orange-500 animate-pulse tabular-nums shadow-orange-500/50 drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]">
                    {currentTime.toLocaleTimeString('en-US', { second: '2-digit' })}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">SEC</span>
                </div>
              </div>
            </div>

            {/* Full Date with Icon */}
            <div className="mt-6 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <CalendarIcon size={14} className="text-slate-400" />
              <p className="text-slate-300 font-bold text-sm tracking-wide">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Footer Stats Inside Clock */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-6 border-t border-white/5">
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Timezone</p>
              <p className="text-[11px] text-white font-bold">{Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]}</p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Stability</p>
              <div className="flex items-center justify-center gap-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-0.5 h-2 bg-orange-500 rounded-full"></div>)}
                  <div className="w-0.5 h-2 bg-slate-700 rounded-full"></div>
                </div>
                <span className="text-[11px] text-white font-bold">98%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Uptime</p>
              <p className="text-[11px] text-emerald-500 font-bold">Active</p>
            </div>
          </div>

          {/* Corner Decoration */}
          <div className="absolute bottom-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="text-white -rotate-45" size={20} />
          </div>
        </div>

        {/* Small Modern Calendar */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
            <CalendarIcon size={14} className="text-orange-600" />
            <h2 className="font-black text-slate-500 uppercase text-[10px] tracking-widest">System Calendar</h2>
          </div>
          <div className="compact-calendar">
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  setDate(value);
                }
              }}
              value={date}
              className="border-none w-full"
              prev2Label={null}
              next2Label={null}
            />
          </div>
        </div>

      </div>

      <style jsx global>{`
        .compact-calendar .react-calendar { background: transparent; font-size: 11px; }
        .react-calendar__navigation { margin-bottom: 1rem; height: 30px; }
        .react-calendar__navigation button { font-weight: 800; font-size: 12px; border-radius: 8px; }
        .react-calendar__month-view__weekdays { font-weight: 900; font-size: 9px; color: #94A3B8; }
        .react-calendar__tile { padding: 0.6rem 0.2rem !important; border-radius: 8px; font-weight: 700; }
        .react-calendar__tile--active { background: #0F172A !important; color: white !important; }
        .react-calendar__tile--now { background: #FFF7ED !important; color: #EA580C !important; }
        abbr[title] { text-decoration: none !important; }
      `}</style>
    </div>
  );
}