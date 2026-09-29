import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getSeatMatrix,
  deleteSeat,
  bulkCreateSeats,
} from "../../services/seat.service.js";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";

import {
  Armchair,
  Layers,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Eye,
  MessageCircle,
  Grid3X3,
  List
} from "lucide-react";

function AllSeatsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedShift, setSelectedShift] = useState("ALL");
  const [selectedFloor, setSelectedFloor] = useState("ALL");
  const [viewMode, setViewMode] = useState("matrix"); // 'matrix' | 'cards'
  const [selectedSeatDetails, setSelectedSeatDetails] = useState(null);

  // Bulk Generator State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkPrefix, setBulkPrefix] = useState("S-");
  const [bulkStart, setBulkStart] = useState("1");
  const [bulkEnd, setBulkEnd] = useState("30");
  const [bulkFloor, setBulkFloor] = useState("1");
  const [bulkType, setBulkType] = useState("NORMAL");

  // Delete State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [seatToDelete, setSeatToDelete] = useState(null);

  // Fetch Matrix
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["seatMatrix", selectedShift, selectedFloor],
    queryFn: () =>
      getSeatMatrix({
        shift: selectedShift === "ALL" ? undefined : selectedShift,
        floor: selectedFloor === "ALL" ? undefined : selectedFloor,
      }),
  });

  // Bulk Create Mutation
  const bulkMutation = useMutation({
    mutationFn: bulkCreateSeats,
    onSuccess: (res) => {
      toast.success(res.message || "Seats created successfully!");
      setShowBulkModal(false);
      queryClient.invalidateQueries({ queryKey: ["seatMatrix"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create seats");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSeat,
    onSuccess: (res) => {
      toast.success(res.message || "Seat deleted successfully");
      setShowDeleteDialog(false);
      setSeatToDelete(null);
      setSelectedSeatDetails(null);
      queryClient.invalidateQueries({ queryKey: ["seatMatrix"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete seat");
    },
  });

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    bulkMutation.mutate({
      prefix: bulkPrefix,
      start: parseInt(bulkStart, 10),
      end: parseInt(bulkEnd, 10),
      floor: parseInt(bulkFloor, 10),
      type: bulkType,
    });
  };

  const seats = data?.matrix || [];
  const totalSeats = seats.length;
  const occupiedSeats = seats.filter((s) => s.isOccupied).length;
  const availableSeats = seats.filter(
    (s) => !s.isOccupied && s.physicalStatus === "AVAILABLE"
  ).length;
  const expiringSeats = seats.filter((s) => s.expiringSoon).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Armchair className="w-8 h-8 text-blue-600" />
            Seat Visual Matrix & Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time interactive floor map and shift allocation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Bulk Generator
          </button>

          <Link
            to="/seats/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Single Seat
          </Link>

          <div className="flex items-center bg-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode("matrix")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "matrix"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Matrix View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "cards"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Card View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Seats</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalSeats}</p>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Available Now</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{availableSeats}</p>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-sm">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Occupied</p>
          <p className="text-2xl font-bold text-rose-800 mt-1">{occupiedSeats}</p>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Expiring ≤ 3 Days</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">{expiringSeats}</p>
        </div>
      </div>

      {/* FILTER TABS (SHIFTS & FLOORS) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* SHIFT TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mr-1">
            <Clock className="w-3.5 h-3.5" /> Shift:
          </span>
          {[
            { id: "ALL", label: "All Shifts" },
            { id: "FULL_DAY", label: "Full Day (6AM-10PM)" },
            { id: "MORNING", label: "Morning (6AM-2PM)" },
            { id: "EVENING", label: "Evening (2PM-10PM)" },
            { id: "NIGHT", label: "Night (10PM-6AM)" },
          ].map((shift) => (
            <button
              key={shift.id}
              onClick={() => setSelectedShift(shift.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedShift === shift.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {shift.label}
            </button>
          ))}
        </div>

        {/* FLOOR FILTER & LEGEND */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="rounded-lg border border-gray-300 py-1 px-2 text-xs bg-white text-gray-700"
            >
              <option value="ALL">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l border-gray-200 pl-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Free
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Expiry Soon
            </span>
          </div>
        </div>
      </div>

      {/* LOADING / ERROR */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <p className="text-gray-500 font-medium">Loading seat matrix...</p>
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-2xl p-8 text-center border border-red-200 shadow-sm">
          <p className="text-red-600 font-medium">
            {error?.response?.data?.message || "Failed to load seat matrix"}
          </p>
        </div>
      )}

      {/* SEATS DISPLAY */}
      {!isLoading && !isError && seats.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <Armchair className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No seats found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Get started by bulk generating seats or creating single seats.
          </p>
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700"
          >
            <Sparkles className="w-4 h-4" />
            Bulk Create Seats (1 to 30)
          </button>
        </div>
      )}

      {/* MATRIX VIEW */}
      {!isLoading && !isError && seats.length > 0 && viewMode === "matrix" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {seats.map((seat) => {
            const isMaintenance = seat.physicalStatus === "MAINTENANCE";
            const isOccupied = seat.isOccupied;
            const isExpiring = seat.expiringSoon;

            let bgColor = "bg-white border-emerald-300 hover:border-emerald-500 text-emerald-950";
            let statusBadge = "bg-emerald-100 text-emerald-800";
            let statusText = "Free";

            if (isMaintenance) {
              bgColor = "bg-gray-100 border-gray-300 text-gray-500";
              statusBadge = "bg-gray-200 text-gray-600";
              statusText = "Repair";
            } else if (isExpiring) {
              bgColor = "bg-amber-50/80 border-amber-400 hover:border-amber-600 text-amber-950";
              statusBadge = "bg-amber-100 text-amber-800 font-bold";
              statusText = "Due Soon";
            } else if (isOccupied) {
              bgColor = "bg-rose-50/80 border-rose-300 hover:border-rose-500 text-rose-950";
              statusBadge = "bg-rose-100 text-rose-800";
              statusText = "Occupied";
            }

            return (
              <div
                key={seat._id}
                onClick={() => setSelectedSeatDetails(seat)}
                className={`group cursor-pointer relative p-3 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${bgColor}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    F{seat.floor}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>

                <div className="text-center py-1">
                  <span className="text-base font-black tracking-tight">{seat.seatNumber}</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">{seat.type}</p>
                </div>

                {isOccupied && seat.activeBookings?.[0]?.student?.user?.name && (
                  <div className="mt-1.5 pt-1.5 border-t border-rose-200/60 truncate">
                    <p className="text-[11px] font-semibold text-gray-900 truncate">
                      {seat.activeBookings[0].student.user.name}
                    </p>
                    <p className="text-[9px] text-gray-500 capitalize">
                      {seat.activeBookings[0].shift ? seat.activeBookings[0].shift.toLowerCase() : "Full day"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CARDS VIEW */}
      {!isLoading && !isError && seats.length > 0 && viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seats.map((seat) => (
            <div
              key={seat._id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{seat.seatNumber}</h3>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    seat.isOccupied
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {seat.isOccupied ? "Occupied" : "Available"}
                </span>
              </div>

              <div className="mt-3 text-xs text-gray-600 space-y-1">
                <p>📍 Floor: {seat.floor}</p>
                <p>🛋️ Category: {seat.type}</p>
                <p>⚙️ Condition: {seat.physicalStatus}</p>
              </div>

              {seat.activeBookings?.length > 0 && (
                <div className="mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                  <p className="font-semibold text-gray-900">
                    Occupant: {seat.activeBookings[0]?.student?.user?.name}
                  </p>
                  <p className="text-gray-500">
                    Shift: {seat.activeBookings[0]?.shift} | Ends:{" "}
                    {new Date(seat.activeBookings[0]?.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
                <Link
                  to={`/seats/${seat._id}`}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  to={`/seats/${seat._id}/edit`}
                  className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setSeatToDelete(seat);
                    setShowDeleteDialog(true);
                  }}
                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {!seat.isOccupied && (
                  <Link
                    to={`/bookings/new?seatId=${seat._id}`}
                    className="ml-auto px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Book Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEAT DETAILS DRAWER / MODAL */}
      {selectedSeatDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Seat {selectedSeatDetails.seatNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  Floor {selectedSeatDetails.floor} • {selectedSeatDetails.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedSeatDetails(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm">
              {selectedSeatDetails.isOccupied ? (
                <div>
                  <div className="rounded-2xl bg-blue-50/60 border border-blue-200/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-blue-700">
                        Current Occupant
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {selectedSeatDetails.activeBookings?.[0]?.shift}
                      </span>
                    </div>

                    <p className="text-base font-bold text-gray-900">
                      {selectedSeatDetails.activeBookings?.[0]?.student?.user?.name || "Student"}
                    </p>
                    <p className="text-xs text-gray-600">
                      📞 {selectedSeatDetails.activeBookings?.[0]?.student?.user?.phone || "No phone"}
                    </p>
                    <p className="text-xs text-gray-600">
                      📅 Valid:{" "}
                      {new Date(
                        selectedSeatDetails.activeBookings?.[0]?.startDate
                      ).toLocaleDateString()}{" "}
                      to{" "}
                      {new Date(
                        selectedSeatDetails.activeBookings?.[0]?.endDate
                      ).toLocaleDateString()}
                    </p>

                    {/* WHATSAPP REMINDER BUTTON */}
                    {selectedSeatDetails.activeBookings?.[0]?.student?.user?.phone && (
                      <a
                        href={`https://api.whatsapp.com/send?phone=${selectedSeatDetails.activeBookings[0].student.user.phone.replace(
                          /[^0-9]/g,
                          ""
                        )}&text=${encodeURIComponent(
                          `Namaste ${selectedSeatDetails.activeBookings[0].student.user.name}, this is a reminder from the Library regarding your Seat ${selectedSeatDetails.seatNumber}. Valid till ${new Date(
                            selectedSeatDetails.activeBookings[0].endDate
                          ).toLocaleDateString()}. Thank you!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Send WhatsApp Reminder
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <Armchair className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                  <p className="font-bold text-emerald-900">Seat is Available!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Ready to assign to an enrolled student.
                  </p>
                  <button
                    onClick={() => {
                      navigate(`/bookings/new?seatId=${selectedSeatDetails._id}`);
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                  >
                    + Book This Seat
                  </button>
                </div>
              )}

              {/* ACTION LINKS */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Link
                  to={`/seats/${selectedSeatDetails._id}/edit`}
                  className="flex-1 text-center py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                >
                  Edit Seat
                </Link>
                <button
                  onClick={() => {
                    setSeatToDelete(selectedSeatDetails);
                    setShowDeleteDialog(true);
                  }}
                  className="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULK CREATE MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Bulk Generate Seats
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Prefix (e.g. S- or F1-S)
                </label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  placeholder="S-"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Number
                  </label>
                  <input
                    type="number"
                    value={bulkStart}
                    onChange={(e) => setBulkStart(e.target.value)}
                    min="1"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Number
                  </label>
                  <input
                    type="number"
                    value={bulkEnd}
                    onChange={(e) => setBulkEnd(e.target.value)}
                    min="1"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Floor</label>
                  <input
                    type="number"
                    value={bulkFloor}
                    onChange={(e) => setBulkFloor(e.target.value)}
                    min="1"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={bulkType}
                    onChange={(e) => setBulkType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 bg-white"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
              </div>

              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-800">
                💡 Preview: Will generate {parseInt(bulkEnd, 10) - parseInt(bulkStart, 10) + 1 || 0}{" "}
                seats ({bulkPrefix}{bulkStart} to {bulkPrefix}{bulkEnd}) on Floor {bulkFloor}.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {bulkMutation.isPending ? "Generating..." : "Generate Seats"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Seat?"
        message={
          seatToDelete
            ? `Are you sure you want to delete "${seatToDelete.seatNumber}"? This action cannot be undone.`
            : "Are you sure you want to delete this seat?"
        }
        confirmText="Delete Seat"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (seatToDelete?._id) deleteMutation.mutate(seatToDelete._id);
        }}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setShowDeleteDialog(false);
            setSeatToDelete(null);
          }
        }}
      />
    </div>
  );
}

export default AllSeatsPage;