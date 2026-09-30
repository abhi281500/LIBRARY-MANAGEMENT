import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getAllStudents, deleteStudent } from "../../services/student.service.js";
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
} from "lucide-react";

function AllStudentsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["all-students"],
    queryFn: getAllStudents,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: (res) => {
      toast.success(res.message || "Student deleted successfully");
      setShowDeleteDialog(false);
      setStudentToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete student");
    },
  });

  const students = data?.students || [];

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = student.user?.name?.toLowerCase() || "";
      const email = student.user?.email?.toLowerCase() || "";
      const phone = student.user?.phone || "";
      const adm = student.admissionNumber?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        adm.includes(query);

      const matchesStatus =
        statusFilter === "ALL" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

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

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, phone, admission no..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs font-semibold bg-white text-slate-700"
            >
              <option value="ALL">All Status ({students.length})</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-slate-500 text-sm font-medium">
              Loading student directory...
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-red-600 text-sm font-medium">
              {error?.response?.data?.message || "Failed to load students"}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No students found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-5">Student Name</th>
                    <th className="py-3.5 px-4">Adm No</th>
                    <th className="py-3.5 px-4">Phone / WhatsApp</th>
                    <th className="py-3.5 px-4">Joining Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map((student) => {
                    const studentName = student.user?.name || "Student";
                    const studentPhone = student.user?.phone || "";
                    const studentEmail = student.user?.email || "";
                    const cleanPhone = studentPhone.replace(/[^0-9]/g, "");

                    return (
                      <tr key={student._id} className="hover:bg-slate-50/80 transition-all">
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

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {student.admissionNumber || "N/A"}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-800">{studentPhone || "-"}</span>
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

                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(student.joiningDate)}
                        </td>

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

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/students/${student._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                              title="Digital ID Card & Profile"
                            >
                              <QrCode className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/students/${student._id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/students/${student._id}/edit`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

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

          <div className="bg-slate-50/80 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <strong>{filteredStudents.length}</strong> of{" "}
              <strong>{students.length}</strong> total students
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Student Record?"
        message={
          studentToDelete
            ? `Are you sure you want to delete student "${studentToDelete.user?.name || studentToDelete.admissionNumber}"?`
            : "Are you sure you want to delete this student?"
        }
        confirmText="Delete Student"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (studentToDelete?._id) {
            deleteMutation.mutate(studentToDelete._id);
          }
        }}
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