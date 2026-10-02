import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  getAllStudents,
  deleteStudent,
} from "../../services/student.service.js";

import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";

import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  Filter,
  CheckCircle,
  XCircle,
  QrCode,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function AllStudentsPage() {
  const queryClient = useQueryClient();

  // ============================================================
  // STATE
  // ============================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);

  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Number of students per page
  const limit = 10;

  // ============================================================
  // SEARCH DEBOUNCE
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ============================================================
  // RESET PAGE WHEN SEARCH / FILTER CHANGES
  // ============================================================

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // ============================================================
  // FETCH STUDENTS
  // ============================================================

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [
      "all-students",
      page,
      limit,
      debouncedSearch,
      statusFilter,
    ],

    queryFn: () =>
      getAllStudents({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),

    // Keep previous page visible while next page loads
    placeholderData: (previousData) => previousData,

    // Don't refetch unnecessarily for 30 seconds
    staleTime: 30 * 1000,
  });

  // ============================================================
  // DATA
  // ============================================================

  const students = data?.students || [];

  const pagination = data?.pagination || {
    page: 1,
    limit,
    totalStudents: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const totalStudents = pagination.totalStudents || 0;
  const totalPages = pagination.totalPages || 0;

  // ============================================================
  // DELETE STUDENT
  // ============================================================

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,

    onSuccess: (res) => {
      toast.success(
        res.message || "Student deleted successfully"
      );

      setShowDeleteDialog(false);
      setStudentToDelete(null);

      // Refresh student list
      queryClient.invalidateQueries({
        queryKey: ["all-students"],
      });

      // Refresh dashboard counts
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Failed to delete student"
      );
    },
  });

  // ============================================================
  // DELETE HANDLER
  // ============================================================

  const handleDelete = () => {
    if (!studentToDelete?._id) return;

    deleteMutation.mutate(studentToDelete._id);
  };

  // ============================================================
  // DATE FORMATTER
  // ============================================================

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // PAGE NUMBERS
  // ============================================================

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages = [];

    // Always show first page
    pages.push(1);

    // Near beginning
    if (page <= 4) {
      pages.push(2);
      pages.push(3);
      pages.push(4);
      pages.push(5);
      pages.push("...");
      pages.push(totalPages);

      return pages;
    }

    // Near end
    if (page >= totalPages - 3) {
      pages.push("...");
      pages.push(totalPages - 4);
      pages.push(totalPages - 3);
      pages.push(totalPages - 2);
      pages.push(totalPages - 1);
      pages.push(totalPages);

      return pages;
    }

    // Middle
    pages.push("...");
    pages.push(page - 1);
    pages.push(page);
    pages.push(page + 1);
    pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <Users className="w-8 h-8 text-blue-600" />
              Student Directory
            </h1>

            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Manage student admissions, contact records, and active memberships.
            </p>
          </div>

          <Link
            to="/students/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            + New Admission
          </Link>
        </div>

        {/* ======================================================
            SEARCH + FILTER
        ====================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, phone, admission no..."
              className="w-full pl-9 pr-10 py-2 text-xs md:text-sm rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-slate-50/50"
            />

            {/* Searching indicator */}
            {isFetching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs font-semibold bg-white text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Status ({totalStudents})
              </option>

              <option value="ACTIVE">
                Active Only
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>
          </div>
        </div>

        {/* ======================================================
            TABLE CARD
        ====================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Loading */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-500 text-sm font-medium">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />

                <span>
                  Loading student directory...
                </span>
              </div>
            </div>
          ) : isError ? (

            /* Error */
            <div className="py-16 text-center">
              <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />

              <h3 className="text-base font-bold text-slate-800">
                Failed to load students
              </h3>

              <p className="text-xs text-red-500 mt-1">
                {error?.response?.data?.message ||
                  error?.message ||
                  "Something went wrong"}
              </p>

              <button
                type="button"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["all-students"],
                  })
                }
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          ) : students.length === 0 ? (

            /* Empty */
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />

              <h3 className="text-base font-bold text-slate-800">
                No students found
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                {debouncedSearch
                  ? `No students found for "${debouncedSearch}".`
                  : statusFilter !== "ALL"
                  ? `No ${statusFilter.toLowerCase()} students found.`
                  : "There are no students in your library yet."}
              </p>

              {/* Clear search/filter */}
              {(debouncedSearch || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                    setStatusFilter("ALL");
                    setPage(1);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (

            /* ==================================================
               TABLE
            ================================================== */

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs text-slate-600">

                {/* Table Head */}
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-5">
                      Student Name
                    </th>

                    <th className="py-3.5 px-4">
                      Adm No
                    </th>

                    <th className="py-3.5 px-4">
                      Phone / WhatsApp
                    </th>

                    <th className="py-3.5 px-4">
                      Joining Date
                    </th>

                    <th className="py-3.5 px-4">
                      Status
                    </th>

                    <th className="py-3.5 px-5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100 font-medium">

                  {students.map((student) => {
                    const studentName =
                      student.user?.name || "Student";

                    const studentPhone =
                      student.user?.phone || "";

                    const studentEmail =
                      student.user?.email || "";

                    const cleanPhone =
                      studentPhone.replace(/[^0-9]/g, "");

                    return (
                      <tr
                        key={student._id}
                        className="hover:bg-slate-50/80 transition-all"
                      >

                        {/* Student */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">

                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {studentName.charAt(0)}
                            </div>

                            <div className="truncate max-w-[180px]">

                              <Link
                                to={`/students/${student._id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 truncate block"
                              >
                                {studentName}
                              </Link>

                              <span className="text-[11px] text-slate-400 truncate block">
                                {studentEmail}
                              </span>

                            </div>
                          </div>
                        </td>

                        {/* Admission */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {student.admissionNumber || "N/A"}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">

                            <span className="font-mono text-slate-800">
                              {studentPhone || "-"}
                            </span>

                            {cleanPhone && (
                              <a
                                href={`https://api.whatsapp.com/send?phone=${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="text-emerald-600 hover:text-emerald-700 p-1 rounded-md hover:bg-emerald-50"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}

                          </div>
                        </td>

                        {/* Joining Date */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(student.joiningDate)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              student.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {student.status === "ACTIVE" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}

                            {student.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">

                            {/* QR / Digital ID */}
                            <Link
                              to={`/students/${student._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                              title="Digital ID Card & Profile"
                            >
                              <QrCode className="w-4 h-4" />
                            </Link>

                            {/* View */}
                            <Link
                              to={`/students/${student._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Edit */}
                            <Link
                              to={`/students/${student._id}/edit`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setStudentToDelete(student);
                                setShowDeleteDialog(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          )}

          {/* ====================================================
              FETCHING INDICATOR
          ==================================================== */}

          {isFetching && !isLoading && students.length > 0 && (
            <div className="px-5 py-2 text-[11px] text-blue-600 bg-blue-50 border-t border-blue-100">
              Updating students...
            </div>
          )}

          {/* ====================================================
              PAGINATION
          ==================================================== */}

          {!isLoading &&
            !isError &&
            totalStudents > 0 && (
              <div className="bg-slate-50/80 border-t border-slate-200 px-5 py-3">

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                  {/* Result Count */}
                  <div className="text-xs text-slate-500">

                    Showing{" "}

                    <strong className="text-slate-700">
                      {(page - 1) * limit + 1}
                    </strong>

                    {" - "}

                    <strong className="text-slate-700">
                      {Math.min(
                        page * limit,
                        totalStudents
                      )}
                    </strong>

                    {" of "}

                    <strong className="text-slate-700">
                      {totalStudents}
                    </strong>

                    {" students"}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">

                      {/* Previous */}
                      <button
                        type="button"
                        disabled={
                          !pagination.hasPrevPage ||
                          isFetching
                        }
                        onClick={() =>
                          setPage((prev) =>
                            Math.max(prev - 1, 1)
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map(
                        (pageNumber, index) => {
                          if (pageNumber === "...") {
                            return (
                              <span
                                key={`dots-${index}`}
                                className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400"
                              >
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              key={pageNumber}
                              type="button"
                              disabled={isFetching}
                              onClick={() =>
                                setPage(pageNumber)
                              }
                              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all ${
                                page === pageNumber
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                      )}

                      {/* Next */}
                      <button
                        type="button"
                        disabled={
                          !pagination.hasNextPage ||
                          isFetching
                        }
                        onClick={() =>
                          setPage((prev) =>
                            Math.min(
                              prev + 1,
                              totalPages
                            )
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* ========================================================
          DELETE CONFIRMATION
      ======================================================== */}

      <ConfirmDialog
        open={showDeleteDialog}

        title="Delete Student Record?"

        message={
          studentToDelete
            ? `Are you sure you want to delete student "${
                studentToDelete.user?.name ||
                studentToDelete.admissionNumber
              }"?`
            : "Are you sure you want to delete this student?"
        }

        confirmText="Delete Student"
        cancelText="Cancel"

        loading={deleteMutation.isPending}

        onConfirm={handleDelete}

        onCancel={() => {
          if (!deleteMutation.isPending) {
            setShowDeleteDialog(false);
            setStudentToDelete(null);
          }
        }}
      />
    </div>
  );
}

export default AllStudentsPage;