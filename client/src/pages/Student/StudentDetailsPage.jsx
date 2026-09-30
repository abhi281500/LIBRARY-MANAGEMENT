import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudentById } from "../../services/student.service.js";
import {
  ArrowLeft,
  Printer,
  MessageCircle,
  Edit,
  PlusCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Armchair,
  CreditCard,
  QrCode,
  ShieldCheck,
  RotateCw,
  Sparkles,
  Award,
  BookOpen,
  Receipt,
  FileText,
} from "lucide-react";

export default function StudentDetailsPage() {
  const { id } = useParams();
  const [cardSide, setCardSide] = useState("front"); // 'front' | 'back'

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-details", id],
    queryFn: () => getStudentById(id),
    enabled: !!id,
  });

  const student = data?.student;
  const activeBooking = data?.activeBooking || (student?.bookings?.find((b) => b.status === "ACTIVE"));
  const bookings = data?.bookings || [];
  const payments = data?.payments || [];

  const library = student?.library || {};
  const user = student?.user || {};

  // Formatter helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt || 0);
  };

  // Remaining days calculation for active booking
  const validityInfo = useMemo(() => {
    if (!activeBooking?.endDate) return null;
    const end = new Date(activeBooking.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      daysRemaining: diffDays,
      isExpired: diffDays < 0,
      isExpiringSoon: diffDays >= 0 && diffDays <= 5,
    };
  }, [activeBooking]);

  // Total Lifetime Payments
  const totalPaid = useMemo(() => {
    return payments
      .filter((p) => p.paymentStatus === "PAID")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [payments]);

  // Shift Display Label
  const getShiftBadge = (shift) => {
    switch (shift) {
      case "MORNING":
        return { label: "Morning (6 AM - 2 PM)", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "EVENING":
        return { label: "Evening (2 PM - 10 PM)", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "NIGHT":
        return { label: "Night (10 PM - 6 AM)", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "FULL_DAY":
      default:
        return { label: "Full Day (24 Hrs)", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
  };

  // WhatsApp Share Handler
  const handleWhatsAppShare = () => {
    if (!user.phone) return;
    const cleanPhone = user.phone.replace(/[^0-9]/g, "");
    const deskText = activeBooking?.seat
      ? `Desk #${activeBooking.seat.seatNumber} (Floor ${activeBooking.seat.floor || 1})`
      : "Unassigned";
    const validityText = activeBooking?.endDate ? formatDate(activeBooking.endDate) : "N/A";
    const shiftText = activeBooking?.shift || "FULL_DAY";

    const message = `*🎓 DIGITAL LIBRARY ID CARD*
----------------------------------------
*Library:* ${library.name || "Study Library"}
*Student Name:* ${user.name}
*Admission No:* ${student.admissionNumber}
*Allocated Desk:* ${deskText}
*Shift Slot:* ${shiftText}
*Validity Expiry:* ${validityText}
*Status:* ${student.status}
----------------------------------------
📌 *Library Rules:*
• Always carry your digital ID card for verification.
• Maintain pin-drop silence in the study zones.
• Keep your allocated desk clean and tidy.

For any queries, contact library helpline: ${library.phone || "Admin"}`;

    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Student Profile & ID Card...</p>
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Student Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">
            {error?.response?.data?.message || "The requested student profile could not be loaded."}
          </p>
          <Link
            to="/students"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Students
          </Link>
        </div>
      </div>
    );
  }

  // QR code content string
  const qrData = JSON.stringify({
    adm: student.admissionNumber,
    name: user.name,
    lib: library.name,
    seat: activeBooking?.seat?.seatNumber || "N/A",
    validTill: activeBooking?.endDate || "N/A",
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      {/* Print-specific style block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-id-card, #printable-id-card * {
            visibility: visible;
          }
          #printable-id-card {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 360px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <Link to="/students" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Students
              </Link>
              <span>/</span>
              <span className="text-slate-800">Student Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              {user.name}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold tracking-wide uppercase border ${
                  student.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {student.status === "ACTIVE" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {student.status}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Admission ID: <span className="font-mono font-bold text-slate-700">{student.admissionNumber}</span> • Enrolled on {formatDate(student.joiningDate || student.createdAt)}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
              title="Print Physical ID Card"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              Print ID Card
            </button>

            {user.phone && (
              <button
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                title="Send Digital ID Card via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Card
              </button>
            )}

            <Link
              to={`/students/${student._id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Edit className="w-4 h-4 text-slate-600" />
              Edit
            </Link>

            <Link
              to={`/bookings/new?studentId=${student._id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Allot Desk
            </Link>
          </div>
        </div>

        {/* Main Grid: Left ID Card Preview, Right Key KPIs & Allotment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT: DIGITAL LIBRARY ID CARD (Printable Smart Card) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Card Controls */}
            <div className="w-full max-w-sm flex items-center justify-between mb-3 px-1 no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Official Smart ID Card
              </span>
              <button
                onClick={() => setCardSide(cardSide === "front" ? "back" : "front")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" /> Flip to {cardSide === "front" ? "Back" : "Front"}
              </button>
            </div>

            {/* Smart ID Card Element */}
            <div
              id="printable-id-card"
              className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 relative border border-slate-800"
              style={{
                background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
              }}
            >
              {cardSide === "front" ? (
                /* FRONT SIDE */
                <div className="p-6 text-white relative">
                  {/* Decorative Guilloche / Tech Glow */}
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

                  {/* Header: Library Name & Official Tag */}
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-lg text-white shadow-inner">
                        {library.name?.charAt(0) || "L"}
                      </div>
                      <div>
                        <h2 className="text-sm font-black tracking-tight text-white uppercase leading-tight">
                          {library.name || "Central Study Library"}
                        </h2>
                        <p className="text-[10px] text-slate-300 line-clamp-1 max-w-[170px]">
                          {library.address || "Main Campus Hall"}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-sm">
                      MEMBER
                    </span>
                  </div>

                  {/* Chip & Security Stripe */}
                  <div className="flex items-center justify-between mt-4">
                    {/* Simulated Gold EMV Chip */}
                    <div className="w-10 h-8 rounded-md bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-400 border border-amber-400/80 shadow-sm flex items-center justify-center p-1 relative overflow-hidden">
                      <div className="w-full h-[1px] bg-amber-600/40"></div>
                      <div className="absolute inset-x-0 top-1/2 w-full h-[1px] bg-amber-600/40"></div>
                    </div>

                    {/* Contactless Icon / Status Tag */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {activeBooking ? "DESK ALLOTTED" : "REGISTERED"}
                    </div>
                  </div>

                  {/* Student Identity Core */}
                  <div className="mt-4 flex items-center gap-4">
                    {/* Profile Photo / Initials Badge */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-xl border-2 border-white/20">
                        {user.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-slate-900 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white">
                        ✓
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                        STUDENT NAME
                      </p>
                      <h3 className="text-lg font-black text-white truncate leading-tight">
                        {user.name}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        ADM: <span className="text-amber-300 font-bold">{student.admissionNumber}</span>
                      </p>
                    </div>
                  </div>

                  {/* Desk & Shift Info Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">ASSIGNED SEAT</p>
                      <p className="text-xs font-black text-white mt-0.5 flex items-center gap-1">
                        <Armchair className="w-3.5 h-3.5 text-blue-400" />
                        {activeBooking?.seat ? `Desk #${activeBooking.seat.seatNumber}` : "Not Assigned"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">SHIFT SLOT</p>
                      <p className="text-xs font-black text-indigo-300 mt-0.5 truncate">
                        {activeBooking?.shift || "FULL DAY"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">VALID THROUGH</p>
                      <p className="text-xs font-black text-emerald-400 mt-0.5">
                        {activeBooking?.endDate ? formatDate(activeBooking.endDate) : "Ongoing"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">MEMBER PHONE</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5 truncate">
                        {user.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* QR Code & Barcode Section */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-white p-1 rounded-xl shadow-md">
                        <img
                          src={qrCodeUrl}
                          alt="Student QR Code"
                          className="w-12 h-12 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">SCAN TO VERIFY</p>
                        <p className="text-[8px] text-slate-500 font-mono">AUTH-{student._id?.slice(-6)?.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </div>
                      <p className="text-[8px] text-slate-400 mt-1">Authorized Library ID</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* BACK SIDE */
                <div className="p-6 text-white relative min-h-[380px] flex flex-col justify-between">
                  <div>
                    <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                        TERMS & RULES
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {library.phone ? `Helpline: ${library.phone}` : "Help: Reception"}
                      </span>
                    </div>

                    {/* Magnetic Stripe Graphic */}
                    <div className="w-full h-8 bg-slate-950 -mx-6 my-3 border-y border-white/10"></div>

                    {/* Rules Bullet points */}
                    <div className="space-y-2 text-[10px] text-slate-300">
                      <p className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">1.</span>
                        This ID card is strictly non-transferable and must be presented at the check-in desk.
                      </p>
                      <p className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">2.</span>
                        Pin-drop silence must be maintained at all times inside reading halls.
                      </p>
                      <p className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">3.</span>
                        Please renew desk allotment on or before the due expiry date to retain your seat.
                      </p>
                      <p className="flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">4.</span>
                        Loss of ID card should be reported immediately to library administration.
                      </p>
                    </div>
                  </div>

                  {/* Signature / Seal Watermark */}
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase">ISSUED BY</p>
                      <p className="text-xs font-bold text-white">{library.name || "Library Admin"}</p>
                    </div>
                    <div className="text-right">
                      <div className="border-b border-dotted border-white/40 pb-1 w-24 text-center">
                        <span className="text-[9px] italic font-serif text-indigo-200">Authorized Sign</span>
                      </div>
                      <p className="text-[8px] text-slate-400 mt-0.5">Admin Stamp</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Hint */}
            <p className="mt-3 text-[11px] text-slate-400 text-center no-print">
              💡 Tip: Click <b>Print ID Card</b> to print this badge directly on standard card stock or export to PDF.
            </p>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: STUDENT PROFILE & ACTIVE MEMBERSHIP DETAILS */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Desk Allotment Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <Armchair className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Current Desk Allotment</h2>
                    <p className="text-xs text-slate-500">Live seat reservation and validity status</p>
                  </div>
                </div>

                {activeBooking && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getShiftBadge(activeBooking.shift).color}`}>
                    {getShiftBadge(activeBooking.shift).label}
                  </span>
                )}
              </div>

              {activeBooking ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Desk Number</p>
                      <p className="text-base font-black text-slate-900 mt-0.5">
                        #{activeBooking.seat?.seatNumber || "N/A"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">Floor {activeBooking.seat?.floor || 1}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Desk Type</p>
                      <p className="text-base font-black text-slate-900 mt-0.5">
                        {activeBooking.seat?.type || "REGULAR"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">Reserved</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {formatDate(activeBooking.startDate)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Expiry</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {formatDate(activeBooking.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Validity Status Banner */}
                  {validityInfo && (
                    <div
                      className={`flex items-center justify-between p-3.5 rounded-xl border ${
                        validityInfo.isExpired
                          ? "bg-red-50 border-red-200 text-red-800"
                          : validityInfo.isExpiringSoon
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-emerald-50 border-emerald-200 text-emerald-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {validityInfo.isExpired
                            ? `Subscription expired ${Math.abs(validityInfo.daysRemaining)} days ago`
                            : validityInfo.isExpiringSoon
                            ? `Renewal Due Soon (${validityInfo.daysRemaining} days remaining)`
                            : `Active Allocation (${validityInfo.daysRemaining} days remaining)`}
                        </span>
                      </div>

                      <Link
                        to={`/bookings/new?studentId=${student._id}&renew=true`}
                        className="text-xs font-extrabold underline hover:opacity-80 transition-opacity"
                      >
                        Renew Now →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <Armchair className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Active Desk Assigned</p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-4">This student does not have any active seat reservation right now.</p>
                  <Link
                    to={`/bookings/new?studentId=${student._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Allot Desk Now
                  </Link>
                </div>
              )}
            </div>

            {/* Student Contact & Metadata Profile */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Student Profile & Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admission Date</p>
                    <p className="text-xs font-bold text-slate-800">{formatDate(student.joiningDate || student.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lifetime Paid</p>
                    <p className="text-xs font-black text-emerald-600">{formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM: ALLOCATION HISTORY & PAYMENT RECEIPTS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
          
          {/* Allocation History Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Allocation History</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">{bookings.length} Records</span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No booking history recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-4">Desk / Slot</th>
                      <th className="py-2.5 px-4">Period</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          Desk #{b.seat?.seatNumber || "N/A"}
                          <span className="block text-[10px] text-slate-400 font-normal">{b.shift || "FULL_DAY"}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(b.startDate)} - {formatDate(b.endDate)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(b.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "COMPLETED"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Receipts History */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Payment & Invoices</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">{payments.length} Transactions</span>
            </div>

            {payments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No payment receipts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-4">Receipt</th>
                      <th className="py-2.5 px-4">Date & Mode</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {p.receiptNumber || `REC-${p._id?.slice(-5)?.toUpperCase()}`}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(p.paymentDate || p.createdAt)}
                          <span className="block text-[10px] text-slate-400 font-semibold">{p.paymentMethod || "UPI"}</span>
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-600">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.paymentStatus === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}