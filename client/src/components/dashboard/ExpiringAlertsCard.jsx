import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getExpiringSoonBookings } from "../../services/dashboard.service.js";
import { BellRing, MessageCircle, RefreshCw, Calendar, Armchair, ChevronRight } from "lucide-react";

function ExpiringAlertsCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["expiringSoonBookings"],
    queryFn: () => getExpiringSoonBookings(3),
  });

  const expiringBookings = data?.expiringBookings || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs text-gray-500">Checking membership expiries...</p>
      </div>
    );
  }

  if (isError || expiringBookings.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">All Memberships Active</h4>
            <p className="text-xs text-gray-500">No student seats expiring in the next 3 days.</p>
          </div>
        </div>
        <Link
          to="/seats"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          View Seats <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <BellRing className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Expiring Soon ({expiringBookings.length} Students)
            </h3>
            <p className="text-[11px] text-amber-800">
              Memberships ending within the next 3 days. Send reminders to retain seats.
            </p>
          </div>
        </div>

        <Link
          to="/bookings"
          className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-0.5"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {expiringBookings.map((b) => {
          const studentName = b.student?.user?.name || "Student";
          const studentPhone = b.student?.user?.phone || "";
          const seatNo = b.seat?.seatNumber || "Seat";
          const shift = b.shift || "FULL_DAY";
          const endDate = new Date(b.endDate).toLocaleDateString();

          const diffDays = Math.ceil((new Date(b.endDate) - new Date()) / (1000 * 60 * 60 * 24));
          const daysText =
            diffDays <= 0 ? "Expires Today!" : `Expires in ${diffDays} day${diffDays > 1 ? "s" : ""}`;

          const cleanPhone = studentPhone.replace(/[^0-9]/g, "");
          const whatsappMsg = `Namaste ${studentName}, your Library Seat ${seatNo} (${shift} shift) is expiring on ${endDate}. Please visit the reception to renew and avoid seat reallocation. Thank you!`;

          return (
            <div
              key={b._id}
              className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{studentName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {daysText}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-gray-600 space-y-0.5">
                  <p className="flex items-center gap-1 font-semibold text-blue-600">
                    <Armchair className="w-3 h-3" /> Seat {seatNo} ({shift})
                  </p>
                  <p className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" /> Ends: {endDate}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-2">
                {cleanPhone && (
                  <a
                    href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                      whatsappMsg
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                )}

                <Link
                  to={`/bookings/${b._id}/edit`}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Renew
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExpiringAlertsCard;