import { useEffect, useState } from "react";
import {
  FileText,
  Trash2,
  Upload,
  Search,
  X,
  FileSpreadsheet,
  FileType,
  FileType2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DOCS } from "@/constants/testIds";

const DEPARTMENTS = ["HR", "Finance", "Sales", "Marketing", "Engineering", "Operations"];

const iconFor = (name) => {
  const ext = (name || "").split(".").pop().toLowerCase();
  if (ext === "pdf") return FileType;
  if (["doc", "docx"].includes(ext)) return FileType2;
  if (["xls", "xlsx"].includes(ext)) return FileSpreadsheet;
  return FileText;
};

export default function Documents() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const load = async () => {
    const { data } = await api.get("/documents");
    setDocs(data);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = docs.filter((d) => {
    if (filter !== "All" && d.department !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const remove = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    await api.delete(`/documents/${id}`);
    toast.success("Document deleted");
    load();
  };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto" data-testid={DOCS.page}>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">
            Knowledge base
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Company documents
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            All knowledge available to your team's AI assistant.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowUpload(true)}
            data-testid={DOCS.uploadBtn}
            className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#1E3A8A]/90 transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload document
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid={DOCS.search}
            placeholder="Search documents…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          data-testid={DOCS.filterDept}
          className="px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>All</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden" data-testid={DOCS.list}>
        {filtered.length ? (
          <ul className="divide-y divide-slate-200">
            {filtered.map((d) => {
              const Icon = iconFor(d.name);
              return (
                <li
                  key={d.id}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-md bg-slate-100 grid place-items-center shrink-0">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{d.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded uppercase text-[10px] tracking-wider font-semibold">
                        {d.department}
                      </span>
                      <span>{Math.max(1, Math.round(d.size_bytes / 1024))} KB</span>
                      <span>· {new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => remove(d.id)}
                      data-testid={DOCS.deleteBtn(d.id)}
                      className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-20 text-center text-sm text-slate-500">
            No documents found.
            {isAdmin && (
              <button
                onClick={() => setShowUpload(true)}
                className="ml-2 text-[#1E3A8A] font-medium hover:underline"
              >
                Upload one →
              </button>
            )}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadDialog
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function UploadDialog({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [dept, setDept] = useState("HR");
  const [uploading, setUploading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Pick a file");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("department", dept);
      await api.post("/documents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded");
      onUploaded();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid={DOCS.uploadDialog}>
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          Upload document
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          PDF, DOCX, XLSX or TXT — up to 15 MB.
        </p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-600">
              File
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.md"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              data-testid={DOCS.fileInput}
              className="mt-2 w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-600">
              Department
            </span>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              data-testid={DOCS.deptSelect}
              className="mt-2 w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={uploading}
          data-testid={DOCS.uploadSubmit}
          className="mt-6 w-full bg-[#1E3A8A] text-white py-3 rounded-md font-medium hover:bg-[#1E3A8A]/90 disabled:opacity-60 transition-colors"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>
    </div>
  );
}
