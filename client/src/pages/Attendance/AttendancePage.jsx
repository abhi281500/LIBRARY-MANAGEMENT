import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  toggleCheckInOut,
  getDailyAttendance,
} from "../../services/attendance.service.js";
import {
  UserCheck,
  QrCode,
  ScanLine,
  Clock,
  Armchair,
  Search,
  Calendar,
  CheckCircle2,
  LogOut,
  LogIn,
  Users,
  Sparkles,
  Zap,
  RotateCw,
  HelpCircle,
  Hourglass,
  Flame,
} from "lucide-react";

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);

  const [inputVal, setInputVal] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | CHECKED_IN | CHECKED_OUT
  const [searchQuery, setSearchQuery] = useState("");
  const [lastAction, setLastAction] = useState(null);

  // Auto-focus input on page load for barcode/QR scanner gun
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 1. Fetch Daily Attendance
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["daily-attendance", selectedDate, statusFilter],
    queryFn: () =>
      getDailyAttendance({
        date: selectedDate,
        status: statusFilter,
      }),
    refetchInterval: 30000, // auto refresh every 30s
  });

  const stats = data?.stats || {
    currentlyInside: 0,
    totalCheckInsToday: 0,
    totalStudyHoursToday: "0",
  };

  const attendanceList = data?.attendance || [];

  // 2. Toggle Check-in / Check-out Mutation
  const toggleMutation = useMutation({
    mutationFn: toggleCheckInOut,
    onSuccess: (res) => {
      setLastAction(res);
      setInputVal("");
      inputRef.current?.focus();

      if (res.action === "CHECKED_IN") {
        toast.success(`Check-In: Welcome ${res.student?.user?.name || "Student"}!`, {
          icon: "🟢",
          duration: 4000,
        });
      } else {
        toast.success(
          `Check-Out: ${res.student?.user?.name || "Student"} studied for ${res.durationText}!`,
          {
            icon: "🔵",
            duration: 4000,
          }
        );
      }

      queryClient.invalidateQueries({ queryKey: ["daily-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Student not found or invalid scan");
      inputRef.current?.focus();
    },
  });

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    toggleMutation.mutate({
      identifier: inputVal.trim(),
      mode: "QR_SCAN",
    });
  };

  const handleDirectCheckOut = (student) => {
    if (!student?._id) return;
    toggleMutation.mutate({
      identifier: student._id,
      mode: "MANUAL",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    const d = new Date(timeStr);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  };

  const filteredList = attendanceList.filter((item) => {
    if (!searchQuery) return true;
    const name = item.student?.user?.name?.toLowerCase() || "";
    const adm = item.student?.admissionNumber?.toLowerCase() || "";
    const seat = String(item.seat?.seatNumber || "");
    const q = searchQuery.toLowerCase();
    return name.includes(q) || adm.includes(q) || seat.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <UserCheck className="w-8 h-8 text-emerald-600" />
              Live Attendance & Check-In
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time student check-in/out console, QR identity scanner, and daily study hours log.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => refetch()}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 shadow-sm transition-all"
              title="Refresh Attendance Feed"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. TOP LIVE ATTENDANCE KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Currently Inside */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Currently In Library
              </span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">
                {stats.currentlyInside}
              </span>
              <span className="text-xs font-bold text-emerald-800">Students Inside</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Live active reading hall occupants</p>
          </div>

          {/* Total Check-ins Today */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Check-Ins
              </span>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {stats.totalCheckInsToday}
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                Sessions Logged
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Cumulative visits recorded today</p>
          </div>

          {/* Cumulative Study Hours */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Study Time
              </span>
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {stats.totalStudyHoursToday}
              </span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                Hours Studied
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Total student focus hours logged today</p>
          </div>

        </div>

        {/* 2. FAST SCANNER & CHECK-IN CONSOLE */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 shadow-2xl text-white">
          <div className="max-w-3xl mx-auto space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ScanLine className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Rapid QR & Admission Check-In / Out
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scan Digital ID Card QR, barcode gun, or type Admission Number.
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                <Zap className="w-3 h-3" /> Scanner Ready
              </span>
            </div>

            {/* Check-In Input Form */}
            <form onSubmit={handleScanSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Scan QR token or type Admission No (e.g. LIB-2026-0042)..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  disabled={toggleMutation.isPending}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3.5 pl-12 pr-4 text-sm font-bold text-white placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={toggleMutation.isPending || !inputVal.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50 shrink-0"
              >
                {toggleMutation.isPending ? "Processing..." : "Process Scan ↵"}
              </button>
            </form>

            {/* Instant Action Feedback Display */}
            {lastAction && (
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                  lastAction.action === "CHECKED_IN"
                    ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
                    : "bg-indigo-950/50 border-indigo-500/40 text-indigo-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white ${
                      lastAction.action === "CHECKED_IN"
                        ? "bg-emerald-600"
                        : "bg-indigo-600"
                    }`}
                  >
                    {lastAction.student?.user?.name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {lastAction.student?.user?.name}
                      <span className="text-xs font-normal text-slate-300 ml-2 font-mono">
                        ({lastAction.student?.admissionNumber})
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {lastAction.action === "CHECKED_IN" ? (
                        <>
                          🟢 <strong>Checked In</strong> at {formatTime(lastAction.checkInTime)}{" "}
                          {lastAction.seat && `• Desk #${lastAction.seat.seatNumber} (${lastAction.shift})`}
                        </>
                      ) : (
                        <>
                          🔵 <strong>Checked Out</strong> at {formatTime(lastAction.checkOutTime)} •{" "}
                          <strong>Session Study Time: {lastAction.durationText}</strong>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-black uppercase px-3 py-1 rounded-xl border ${
                    lastAction.action === "CHECKED_IN"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  }`}
                >
                  {lastAction.action === "CHECKED_IN" ? "Checked In" : "Checked Out"}
                </span>
              </div>
            )}

          </div>
        </div>

        {/* 3. TODAY'S ATTENDANCE LOG TABLE & TABS */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          {/* Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Records ({attendanceList.length})
              </button>
              <button
                onClick={() => setStatusFilter("CHECKED_IN")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "CHECKED_IN"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Currently Inside ({stats.currentlyInside})
              </button>
              <button
                onClick={() => setStatusFilter("CHECKED_OUT")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "CHECKED_OUT"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Checked Out
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student, admission #, seat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-500">
              Loading attendance records...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <UserCheck className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Attendance Records Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                Scan student ID cards above to begin logging daily study sessions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-4">Desk Allotted</th>
                    <th className="py-3 px-4">Check-In Time</th>
                    <th className="py-3 px-4">Check-Out Time</th>
                    <th className="py-3 px-4">Study Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredList.map((item) => {
                    const user = item.student?.user || {};
                    const isInside = item.status === "CHECKED_IN";
                    const hours = Math.floor((item.durationMinutes || 0) / 60);
                    const mins = (item.durationMinutes || 0) % 60;
                    const durationText =
                      item.durationMinutes > 0
                        ? `${hours}h ${mins}m`
                        : isInside
                        ? "Studying Now..."
                        : "< 1 min";

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                              {user.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {user.name || "Student"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                ADM: {item.student?.admissionNumber || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {item.seat ? (
                            <span className="inline-flex items-center gap-1 text-slate-900">
                              <Armchair className="w-3.5 h-3.5 text-indigo-600" />
                              Desk #{item.seat.seatNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {formatTime(item.checkIn)}
                        </td>

                        <td className="py-3.5 px-4">
                          {isInside ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="font-medium text-slate-600">
                              {formatTime(item.checkOut)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {durationText}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isInside
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isInside ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                            {isInside ? "In Hall" : "Checked Out"}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          {isInside && (
                            <button
                              onClick={() => handleDirectCheckOut(item.student)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition-all"
                              title="Manual Check-Out"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Check Out
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
