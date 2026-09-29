import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPaymentById } from "../../services/payment.service.js";
import { Printer, MessageCircle, ArrowLeft, CheckCircle, Receipt, Building2, Phone, Calendar, Armchair } from "lucide-react";

function PaymentDetailsPage() {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500 font-medium">Loading payment invoice...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <h2 className="text-red-500 font-semibold">
          {error.response?.data?.message || "Failed to load payment"}
        </h2>
        <Link
          to="/payments"
          className="rounded-xl bg-gray-800 px-4 py-2 text-sm text-white"
        >
          Back to Payments
        </Link>
      </div>
    );
  }

  const payment = data?.payment;

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Payment not found.</p>
      </div>
    );
  }

  const studentName = payment.student?.user?.name || "Student";
  const studentPhone = payment.student?.user?.phone || "";
  const admissionNo = payment.student?.admissionNumber || "N/A";
  const libraryName = payment.library?.name || "Self-Study Library";
  const libraryAddress = payment.library?.address || "Reading Hall Complex";
  const libraryPhone = payment.library?.phone || "+91-XXXXXXXXXX";
  const seatNumber = payment.booking?.seat?.seatNumber || "Assigned Seat";
  const shift = payment.booking?.shift || "FULL_DAY";
  const startDate = payment.booking?.startDate
    ? new Date(payment.booking.startDate).toLocaleDateString()
    : "N/A";
  const endDate = payment.booking?.endDate
    ? new Date(payment.booking.endDate).toLocaleDateString()
    : "N/A";

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = `*${libraryName.toUpperCase()} - PAYMENT RECEIPT*
━━━━━━━━━━━━━━━━━━━━
📄 *Receipt No:* ${payment.receiptNumber}
👤 *Student:* ${studentName} (${admissionNo})
🪑 *Seat:* ${seatNumber}
⏰ *Shift:* ${shift}
📅 *Validity:* ${startDate} to ${endDate}
💰 *Amount Paid:* ₹${payment.amount}
💳 *Method:* ${payment.paymentMethod}
✅ *Status:* PAID
━━━━━━━━━━━━━━━━━━━━
Thank you for your payment! Keep studying hard.`;

  const cleanPhone = studentPhone.replace(/[^0-9]/g, "");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      {/* ACTION BAR (Hidden in Print) */}
      <div className="max-w-2xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/payments"
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </Link>

        <div className="flex items-center gap-2">
          {cleanPhone && (
            <a
              href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                whatsappMessage
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" /> Send WhatsApp Receipt
            </a>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* PRINTABLE RECEIPT CARD */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-lg p-8 sm:p-10 print:border-none print:shadow-none print:p-0">
        {/* RECEIPT HEADER */}
        <div className="border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm tracking-wider uppercase">
                <Building2 className="w-4 h-4" />
                {libraryName}
              </div>
              <p className="text-xs text-gray-500 mt-1">{libraryAddress}</p>
              <p className="text-xs text-gray-500">Phone: {libraryPhone}</p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" /> PAID
              </span>
              <p className="text-xs font-mono text-gray-500 mt-1.5">
                {payment.receiptNumber}
              </p>
              <p className="text-[11px] text-gray-400">
                {new Date(payment.paymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* STUDENT & BILLING INFO */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
          <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Student Details
            </p>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{studentName}</p>
            <p className="text-gray-600 mt-0.5">Adm No: {admissionNo}</p>
            <p className="text-gray-600">Phone: {studentPhone || "N/A"}</p>
          </div>

          <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Seat & Shift Allotted
            </p>
            <p className="font-bold text-blue-600 text-sm mt-0.5">
              Seat {seatNumber}
            </p>
            <p className="text-gray-600 mt-0.5">Shift: {shift}</p>
            <p className="text-gray-600">
              Valid: {startDate} - {endDate}
            </p>
          </div>
        </div>

        {/* PAYMENT BREAKDOWN TABLE */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-center">Period</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              <tr>
                <td className="py-3 px-4">
                  <p className="font-semibold text-gray-900">
                    Self-Study Desk Subscription ({shift})
                  </p>
                  <p className="text-[11px] text-gray-500">Seat {seatNumber} with Wi-Fi & AC</p>
                </td>
                <td className="py-3 px-4 text-center font-mono text-[11px]">
                  1 Month
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">
                  ₹{payment.amount}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50/70 border-t border-gray-200 font-bold">
              <tr>
                <td colSpan="2" className="py-2.5 px-4 text-gray-700">
                  Total Paid ({payment.paymentMethod})
                </td>
                <td className="py-2.5 px-4 text-right text-base text-gray-900">
                  ₹{payment.amount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* FOOTER & STAMP */}
        <div className="pt-4 border-t border-gray-100 flex items-end justify-between text-xs text-gray-500">
          <div>
            <p className="text-[11px] italic">
              * This is a verified digital payment receipt.
            </p>
            <p className="text-[11px]">No refunds or transfers allowed after 3 days.</p>
          </div>

          <div className="text-center">
            <div className="w-28 border-b border-dashed border-gray-400 mb-1"></div>
            <p className="text-[10px] font-semibold uppercase text-gray-400">
              Authorized Signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailsPage;