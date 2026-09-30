import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getWhatsAppTemplates,
  updateWhatsAppTemplates,
} from "../../services/library.service.js";
import {
  DEFAULT_TEMPLATES,
  formatTemplateMessage,
  sendWhatsAppMessage,
} from "../../utils/whatsappHelper.js";
import {
  MessageSquare,
  Sparkles,
  Save,
  RotateCcw,
  Send,
  QrCode,
  CreditCard,
  CheckCircle2,
  Copy,
  Info,
  PhoneCall,
  Bell,
  UserPlus,
  Receipt,
  AlertTriangle,
} from "lucide-react";

const TEMPLATE_TABS = [
  {
    key: "RENEWAL_DUE",
    label: "Renewal Reminder",
    icon: Bell,
    badge: "Most Used",
    desc: "Sent 2-3 days before membership expiry to encourage on-time renewals.",
  },
  {
    key: "ADMISSION_CONFIRMATION",
    label: "Admission & Desk Confirmed",
    icon: UserPlus,
    desc: "Sent upon onboarding a new student with desk rules and ID details.",
  },
  {
    key: "PAYMENT_RECEIPT",
    label: "Payment Receipt",
    icon: Receipt,
    desc: "Sent immediately after receiving desk fee payment with invoice receipt.",
  },
  {
    key: "OVERDUE_NOTICE",
    label: "Overdue Expiry Warning",
    icon: AlertTriangle,
    desc: "Sent when seat allocation has already expired without renewal.",
  },
];

const VARIABLE_TAGS = [
  { tag: "{student_name}", label: "Student Name", sample: "Rahul Sharma" },
  { tag: "{admission_no}", label: "Admission No", sample: "LIB-2026-0042" },
  { tag: "{seat_number}", label: "Desk #", sample: "14" },
  { tag: "{shift}", label: "Shift Slot", sample: "FULL DAY (24 Hrs)" },
  { tag: "{expiry_date}", label: "Expiry Date", sample: "15 Oct 2026" },
  { tag: "{days_left}", label: "Days Left", sample: "2 days" },
  { tag: "{amount}", label: "Amount (₹)", sample: "1,200" },
  { tag: "{receipt_no}", label: "Receipt #", sample: "REC-9402" },
  { tag: "{payment_mode}", label: "Payment Mode", sample: "UPI / GPay" },
  { tag: "{upi_id}", label: "UPI ID", sample: "library@upi" },
  { tag: "{library_name}", label: "Library Name", sample: "StudySpace Library" },
  { tag: "{library_phone}", label: "Helpline Phone", sample: "+91 98765 43210" },
];

export default function WhatsAppTemplatesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("RENEWAL_DUE");
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [upiId, setUpiId] = useState("");
  const [testPhone, setTestPhone] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: getWhatsAppTemplates,
  });

  useEffect(() => {
    if (data) {
      setTemplates({
        ...DEFAULT_TEMPLATES,
        ...(data.templates || {}),
      });
      if (data.upiId) {
        setUpiId(data.upiId);
      }
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateWhatsAppTemplates,
    onSuccess: () => {
      toast.success("WhatsApp templates & UPI settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save templates");
    },
  });

  const handleTemplateChange = (text) => {
    setTemplates((prev) => ({
      ...prev,
      [activeTab]: text,
    }));
  };

  const handleInsertTag = (tag) => {
    setTemplates((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] || "") + ` ${tag} `,
    }));
  };

  const handleResetToDefault = () => {
    setTemplates((prev) => ({
      ...prev,
      [activeTab]: DEFAULT_TEMPLATES[activeTab],
    }));
    toast.success(`Reset "${activeTab}" template to default.`);
  };

  const handleSave = () => {
    updateMutation.mutate({
      templates,
      upiId,
    });
  };

  // Generate Sample Preview String
  const sampleParams = {
    studentName: "Rahul Sharma",
    admissionNo: "LIB-2026-0042",
    seatNumber: "14",
    shift: "FULL DAY (24 Hrs)",
    expiryDate: "15 Oct 2026",
    daysLeft: "2 days",
    amount: "1,200",
    receiptNo: "REC-9402",
    paymentMode: "UPI / GPay",
    libraryName: data?.libraryName || "StudySpace Library",
    libraryPhone: data?.libraryPhone || "+91 98765 43210",
    upiId: upiId || "librarypay@okaxis",
  };

  const currentTemplateText = templates[activeTab] || DEFAULT_TEMPLATES[activeTab] || "";
  const previewMessage = formatTemplateMessage(currentTemplateText, sampleParams);

  // Send Test to Owner's Phone
  const handleSendTestMessage = () => {
    if (!testPhone) {
      toast.error("Please enter a phone number to test.");
      return;
    }
    sendWhatsAppMessage(testPhone, previewMessage);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-600">Loading WhatsApp Automation Engine...</p>
        </div>
      </div>
    );
  }

  const activeTabInfo = TEMPLATE_TABS.find((t) => t.key === activeTab) || TEMPLATE_TABS[0];

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <MessageSquare className="w-8 h-8 text-emerald-600" />
              WhatsApp Reminders & Templates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Customize dynamic renewal alerts, admission notes, payment receipts, and UPI payment links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Reset Default
            </button>

            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Saving..." : "Save All Templates"}
            </button>
          </div>
        </div>

        {/* Global Settings Bar: UPI ID */}
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Your UPI ID for Automated Fee Links</h3>
                <p className="text-xs text-slate-600">
                  This will automatically replace <code className="bg-white/80 px-1 rounded font-mono font-bold text-emerald-800">{"{upi_id}"}</code> in all reminder messages.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 max-w-sm w-full">
              <input
                type="text"
                placeholder="e.g. 9876543210@paytm or library@oksbi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Template Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all relative ${
                  isActive
                    ? "bg-white border-emerald-500 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-500/20"
                    : "bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-xl ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {tab.badge && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{tab.label}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tab.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Editor & Live Simulated WhatsApp Phone Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Template Text Editor & Variables (7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Message Content ({activeTabInfo.label})
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentTemplateText.length} characters
                </span>
              </div>

              <textarea
                rows={12}
                value={currentTemplateText}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-4 font-mono text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed bg-slate-50/50"
                placeholder="Type your WhatsApp message template here..."
              ></textarea>
            </div>

            {/* Clickable Variable Insertion Chips */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Copy className="w-3.5 h-3.5 text-slate-500" /> Click to Insert Dynamic Variables
              </p>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLE_TAGS.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertTag(v.tag)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 transition-all"
                    title={`Inserts sample value: ${v.sample}`}
                  >
                    <span className="font-mono text-emerald-600">+</span> {v.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatting Tips Alert */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">💡 WhatsApp Formatting Tips:</p>
              <p>• Wrap text with asterisks for <b>*bold*</b> (e.g. <code>*Important*</code>).</p>
              <p>• Wrap text with underscores for <i>_italics_</i> (e.g. <code>_Note:_</code>).</p>
            </div>
          </div>

          {/* RIGHT: Live Simulated WhatsApp Mobile Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900">
              
              {/* WhatsApp App Bar Header */}
              <div className="bg-[#075e54] px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-sm text-white shadow">
                    L
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight truncate max-w-[170px]">
                      {data?.libraryName || "StudySpace Library"}
                    </h4>
                    <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-emerald-200">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </div>

              {/* Chat Canvas (WhatsApp wallpaper look) */}
              <div
                className="p-4 min-h-[380px] flex flex-col justify-end bg-[#ece5dd]"
                style={{
                  backgroundImage: "radial-gradient(#d4cbbf 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              >
                {/* Date bubble */}
                <div className="text-center mb-3">
                  <span className="bg-[#e1f3fb] text-[#4a4a4a] text-[10px] font-bold px-3 py-1 rounded-lg shadow-xs">
                    TODAY
                  </span>
                </div>

                {/* Sent Message Bubble */}
                <div className="self-end bg-[#dcf8c6] rounded-2xl rounded-tr-xs p-3 shadow-md max-w-[92%] text-slate-800 text-xs space-y-1 relative">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {previewMessage.split("\n").map((line, idx) => {
                      // Simple render bold in preview
                      const parts = line.split(/(\*[^*]+\*)/g);
                      return (
                        <p key={idx} className="min-h-[14px]">
                          {parts.map((part, i) =>
                            part.startsWith("*") && part.endsWith("*") ? (
                              <strong key={i} className="font-extrabold text-slate-950">
                                {part.slice(1, -1)}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>

                  <div className="text-right text-[9px] text-slate-500 font-medium flex items-center justify-end gap-1 pt-1">
                    <span>Just now</span>
                    <span className="text-blue-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Mobile Chat Bottom Bar */}
              <div className="bg-[#f0f0f0] p-3 border-t border-slate-300 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="Type a message..."
                  className="w-full bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-400 outline-none border border-slate-200 shadow-inner"
                />
                <div className="p-2 rounded-full bg-[#075e54] text-white">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>

            {/* Test Send to Real WhatsApp */}
            <div className="w-full max-w-sm mt-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                📲 Test Send to Your Phone
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendTestMessage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Test
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
