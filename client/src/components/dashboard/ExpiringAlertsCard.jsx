import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getExpiringSoonBookings } from "../../services/dashboard.service.js";
import { getWhatsAppTemplates } from "../../services/library.service.js";
import {
  formatTemplateMessage,
  sendWhatsAppMessage,
  DEFAULT_TEMPLATES,
} from "../../utils/whatsappHelper.js";
import {
  BellRing,
  MessageCircle,
  Clock,
  Armchair,
  ChevronRight,
  Settings,
  Send,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function ExpiringAlertsCard() {
  const [sentMap, setSentMap] = useState({});

  // 1. Fetch Expiring Soon Bookings
  const { data: expiryData, isLoading, isError } = useQuery({
    queryKey: ["expiringSoonBookings"],
    queryFn: () => getExpiringSoonBookings(3),
  });

  // 2. Fetch WhatsApp Template & UPI Configuration
  const { data: templateData } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: getWhatsAppTemplates,
  });

  const expiringBookings = expiryData?.expiringBookings || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500">Checking active seat expiries...</p>
      </div>
    );
  }

  if (isError || expiringBookings.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">All Student Memberships Active</h4>
            <p className="text-xs text-slate-500">No student seats expiring in the next 3 days. All allocations are in good standing.</p>
          </div>
        </div>

        <Link
          to="/settings/whatsapp"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs transition-all"
        >
          <Settings className="w-3.5 h-3.5" /> WhatsApp Templates
        </Link>
      </div>
    );
  }

  const handleSendReminder = (booking) => {
    const student = booking.student;
    const user = student?.user;
    if (!user?.phone) return;

    const templateStr =
      templateData?.templates?.RENEWAL_DUE || DEFAULT_TEMPLATES.RENEWAL_DUE;

    const diffDays = Math.ceil(
      (new Date(booking.endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const daysLeftText =
      diffDays < 0
        ? `expired ${Math.abs(diffDays)} days ago`
        : diffDays === 0
        ? "expires today"
        : `${diffDays} days`;

    const formattedEndDate = new Date(booking.endDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const message = formatTemplateMessage(templateStr, {
      studentName: user.name || "Student",
      admissionNo: student.admissionNumber || "N/A",
      seatNumber: booking.seat?.seatNumber || "N/A",
      shift: booking.shift || "FULL_DAY",
      expiryDate: formattedEndDate,
      daysLeft: daysLeftText,
      amount: booking.amount ? String(booking.amount) : "1,200",
      libraryName: templateData?.libraryName || "Study Library",
      libraryPhone: templateData?.libraryPhone || "",
      upiId: templateData?.upiId || "",
    });

    const success = sendWhatsAppMessage(user.phone, message);
    if (success) {
      setSentMap((prev) => ({ ...prev, [booking._id]: true }));
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-5 sm:p-6 shadow-sm">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-amber-200/70 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              Action Required: Expiring Memberships ({expiringBookings.length})
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Due in ≤ 3 Days
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              Send personalized WhatsApp reminders with 1-click to collect renewal fees on time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/settings/whatsapp"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-xs hover:bg-slate-50 transition-all"
            title="Edit WhatsApp Templates & UPI ID"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-600" />
            Edit Templates
          </Link>

          <Link
            to="/bookings"
            className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-all"
          >
            View All Desks <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid of Expiring Students */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {expiringBookings.map((b) => {
          const user = b.student?.user || {};
          const studentName = user.name || "Unknown Student";
          const studentPhone = user.phone || "";
          const seatNo = b.seat?.seatNumber || "N/A";
          const floor = b.seat?.floor || 1;
          const shift = b.shift || "FULL_DAY";
          const isSent = !!sentMap[b._id];

          const diffDays = Math.ceil(
            (new Date(b.endDate) - new Date()) / (1000 * 60 * 60 * 24)
          );
          const isOverdue = diffDays < 0;
          const isToday = diffDays === 0;

          const formattedEndDate = new Date(b.endDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={b._id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      {studentName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ADM: {b.student?.admissionNumber || "N/A"}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isOverdue
                        ? "bg-rose-100 text-rose-800 border-rose-200"
                        : isToday
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}
                  >
                    {isOverdue ? "Overdue" : isToday ? "Expires Today" : `In ${diffDays} Days`}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Desk</span>
                    <p className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Armchair className="w-3 h-3 text-indigo-600" /> #{seatNo} (Fl {floor})
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Shift</span>
                    <p className="font-extrabold text-slate-800 truncate">
                      {shift}
                    </p>
                  </div>

                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Valid Till: {formattedEndDate}</span>
                    <span className="font-black text-emerald-600">₹{b.amount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSendReminder(b)}
                  disabled={!studentPhone}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isSent
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  }`}
                  title={studentPhone ? `Send WhatsApp to ${studentPhone}` : "No phone number available"}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {isSent ? "Sent ✓" : "Send Reminder"}
                </button>

                <Link
                  to={`/bookings/new?studentId=${b.student?._id}&renew=true`}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  title="Renew Desk"
                >
                  Renew
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}