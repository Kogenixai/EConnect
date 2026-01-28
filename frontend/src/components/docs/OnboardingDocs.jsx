import { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  RefreshCcw,
   CheckCircle ,
  Trash2,
  Eye,
  Upload,
  FileClock,
  FileCheck,
  FileUp,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";

import axios from "axios";
import { LS, ipadr } from "../../Utils/Resuse";

import Fileuploader from './file/Fileuploader'; 

export default function EmployeeDashboard() {
  const userid = LS.get("userid");
  const [assignedDocs, setAssignedDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({ column: null, direction: "asc" });
  const toggleSort = (column) => {
    setSortConfig((prev) => {
      const dir = prev.column === column && prev.direction === "asc" ? "desc" : "asc";
      return { column, direction: dir };
    });
    setCurrentPage(1);
  };

  const [openUploader, setOpenUploader] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { docName } = location.state || {}; 
  const [statusFilter, setStatusFilter] = useState("all");

  const pageSize = 7;

  // Fix: Define handleView, handleUpload, handleDelete
  const handleView = (doc) => {
    if (doc.fileUrl) {
      window.open(`${ipadr}${doc.fileUrl}`, '_blank');
    }
  };

  const handleUpload = (doc) => {
    setSelectedDoc(doc);
    setOpenUploader(true);
  };

  const handleDelete = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${ipadr}/documents/delete/${docToDelete.fileId}`);
      setAssignedDocs((prev) =>
        prev.map((d) =>
          d.docName === docToDelete.docName
            ? { ...d, fileUrl: null, fileId: null, status: "pending" }
            : d
        )
      );
      toast.success("File deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDocToDelete(null);
    }
  };

  /** Fetch assigned documents */
  const fetchAssignedDocs = useCallback(async () => {
    if (!userid) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${ipadr}/documents/assigned/${encodeURIComponent(userid)}`
      );

      const docsArray = Array.isArray(res.data.assigned_docs)
        ? res.data.assigned_docs
        : Array.isArray(res.data)
        ? res.data
        : [];

      const mappedDocs = docsArray.map((doc) => ({
        docName: doc.docName,
        assignedAt: doc.assignedAt ? doc.assignedAt.replace(/\.\d+/, "") : null,
        fileUrl: doc.fileUrl || null,
        fileId: doc.fileId || null,
        status: doc.status ? doc.status.toLowerCase() : "pending",
      }));

      const sorted = mappedDocs.sort(
        (a, b) => new Date(b.assignedAt || 0) - new Date(a.assignedAt || 0)
      );

      setAssignedDocs(sorted);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || err.message || "Failed to fetch documents";
      toast.error(`${errorMessage}`);
      setAssignedDocs([]);
    } finally {
      setLoading(false);
    }
  }, [userid]);

  useEffect(() => {
    fetchAssignedDocs();
    const interval = setInterval(fetchAssignedDocs, 180000);
    return () => clearInterval(interval);
  }, [fetchAssignedDocs]);

 /** Filter documents by search + status */
const filteredDocs = useMemo(() => {
  let docs = assignedDocs;

  // Apply search filter
  if (searchTerm) {
    docs = docs.filter((doc) =>
      doc.docName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply status filter
  if (statusFilter !== "all") {
    docs = docs.filter((doc) => {
      if (statusFilter === "pending")
        return !doc.fileUrl && doc.status !== "verified";
      if (statusFilter === "uploaded")
        return doc.fileUrl && doc.status !== "verified";
      if (statusFilter === "verified") return doc.status === "verified";
      return true;
    });
  }

  if (sortConfig.column === "assignedAt") {
    docs = [...docs].sort((a, b) => {
      const ta = a.assignedAt ? new Date(a.assignedAt.endsWith('Z') ? a.assignedAt : a.assignedAt + 'Z').getTime() : 0;
      const tb = b.assignedAt ? new Date(b.assignedAt.endsWith('Z') ? b.assignedAt : b.assignedAt + 'Z').getTime() : 0;
      return sortConfig.direction === "asc" ? ta - tb : tb - ta;
    });
  }

  return docs;
}, [assignedDocs, searchTerm, statusFilter, sortConfig]);


  /** Pagination */
  const totalPages = Math.ceil(filteredDocs.length / pageSize);
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocs.slice(start, start + pageSize);
  }, [filteredDocs, currentPage]);

  /** Status summary counts */
  const statusCounts = useMemo(() => {
    return assignedDocs.reduce(
      (acc, doc) => {
        if (doc.status === "verified") acc.verified++;
        else if (doc.fileUrl) acc.uploaded++;
        else acc.pending++;
        return acc;
      },
      { pending: 0, uploaded: 0, verified: 0 }
    );
  }, [assignedDocs]);

  /** Status badge component */
  const StatusBadge = ({ status, fileUrl }) => {
    if (status === "verified")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white text-green-700">
          <CheckCircle size={14} />  Verified
        </span>
      );
    if (fileUrl)
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white text-blue-800">
          <Upload size={14} /> Uploaded
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white text-yellow-700">
        <Clock size={14} />  Pending
      </span>
    );
  };

  /** Action buttons component */
  const ActionButtons = ({ doc }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${ipadr}/documents/delete/${doc.fileId}`);
      setAssignedDocs((prev) =>
        prev.map((d) =>
          d.docName === doc.docName
            ? { ...d, fileUrl: null, fileId: null, status: "pending" }
            : d
        )
      );
      toast.success("File deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (doc.fileUrl) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <a
          href={`${ipadr}${doc.fileUrl}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <Eye size={16} /> View
        </a>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-1 text-red-600 hover:underline"
        >
          <Trash2 size={16} /> Delete
        </button>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
              <div className="text-lg font-semibold mb-2">Delete Document</div>
              <div className="mb-4">Are you sure you want to delete <strong>{doc.docName}</strong>?</div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setSelectedDoc(doc);
        setOpenUploader(true);
      }}
      className="flex items-center gap-1 text-blue-600 hover:underline"
    >
      <Upload size={16} /> Upload
    </button>
  );
};

  return (
  <div className="mx-auto my-6 p-6 md:p-8 bg-white h-[85vh] w-[95%] shadow-lg rounded-xl flex flex-col">
    <ToastContainer position="top-right" autoClose={4000} />

    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4 flex-shrink-0">
      <h1 className="text-3xl md:text-4xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
        My Documentation
      </h1>
      <button
        onClick={() => {
          setSearchTerm('');
          setStatusFilter('all');
          setSortConfig({ column: null, direction: 'asc' });
          setCurrentPage(1);
          fetchAssignedDocs();
        }}
        disabled={loading || !userid}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
        {loading ? "Working..." : "Reset"}
      </button>
    </div>

    {/* Status Summary */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 flex-shrink-0">
      <div className="bg-white p-2 rounded-lg shadow-sm border border-yellow-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow min-w-[120px]">
        <FileClock className="text-yellow-500 mb-1" size={20} />
        <p className="text-yellow-600 font-bold text-base">{statusCounts.pending}</p>
        <p className="text-gray-600 text-xs font-medium">Pending</p>
      </div>
      <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-200 flex flex-col items-center justify-center hover:shadow-md transition-shadow min-w-[120px]">
        <FileUp className="text-blue-600 mb-1" size={20} />
        <p className="text-blue-600 font-bold text-base">{statusCounts.uploaded}</p>
        <p className="text-gray-600 text-xs font-medium">Uploaded</p>
      </div>
      <div className="bg-white p-2 rounded-lg shadow-sm border border-green-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow min-w-[120px]">
        <FileCheck className="text-green-600 mb-1" size={20} />
        <p className="text-green-600 font-bold text-base">{statusCounts.verified}</p>
        <p className="text-gray-600 text-xs font-medium">Verified</p>
      </div>
    </div>

    {/* Search + Filter */}
    <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-shrink-0">
      <input
        type="text"
        placeholder="Search documents..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 shadow-sm outline-none transition-all"
      />

      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all cursor-pointer"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="uploaded">Uploaded</option>
        <option value="verified">Verified</option>
      </select>
    </div>

    {/* Documents Table - Exact Clockdashboard Theme */}
    <div>
      <table className="table-auto w-full overflow-y-auto">
        <thead className="text-xs font-semibold uppercase text-black bg-[#6d9eeb7a]">
          <tr>
            <th className="p-2 text-center w-[28%]">Document</th>
            <th className="p-2 text-center w-[18%]">Status</th>
            <th className="p-2 text-center w-[22%]">Actions</th>
            <th className="p-2 text-center w-[32%]">
              <button
                onClick={() => toggleSort("assignedAt")}
                className="inline-flex items-center gap-2"
                title="Sort by Assigned At"
              >
                Assigned At
                {sortConfig.column === "assignedAt" ? (
                  sortConfig.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                ) : (
                  <ArrowUpDown size={14} />
                )}
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan="4" className="p-8 text-center text-gray-400">
                <div className="flex justify-center items-center gap-2">
                  <span className="animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full w-5 h-5"></span>
                  Loading documents...
                </div>
              </td>
            </tr>
          ) : paginatedDocs.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-8 text-center text-gray-400">
                No documents found.
              </td>
            </tr>
          ) : (
            paginatedDocs.map((doc, index) => (
              <tr key={`${doc.fileId || index}-${doc.docName}`} className={`hover:bg-blue-50 transition-colors${index === filteredDocs.length - 1 ? ' relative' : ''}`}> 
                <td className="p-2 text-center align-middle font-medium text-gray-800 truncate w-[28%]">{doc.docName}</td>
                <td className="p-2 text-center align-middle w-[18%]">
                  <div className={`flex items-center justify-center h-full${index === filteredDocs.length - 1 ? ' mb-8' : ''}`}>
                    <span className="relative group flex items-center justify-center">
                      {doc.status === 'verified' ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <Clock className="text-yellow-700" size={20} />
                      )}
                      <span className={`absolute left-1/2 -translate-x-1/2 ${index === filteredDocs.length - 1 ? 'bottom-full mb-2' : 'top-full mt-1'} px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10`}>
                        {doc.status === 'verified' ? 'Verified' : 'Pending'}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="p-2 text-center align-middle w-[22%]">
                  <div className="flex items-center justify-center gap-3">
                    {/* Actions Icons with Tooltip */}
                    {doc.fileUrl && (
                      <span className="relative group">
                        <Eye className="text-blue-700 cursor-pointer" size={20} onClick={() => handleView(doc)} />
                        <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">View</span>
                      </span>
                    )}
                    {!doc.fileUrl && (
                      <span className="relative group">
                        <Upload className="text-blue-700 cursor-pointer" size={20} onClick={() => handleUpload(doc)} />
                        <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">Upload</span>
                      </span>
                    )}
                    <span className="relative group">
                      <Trash2 className="text-red-600 cursor-pointer" size={20} onClick={() => handleDelete(doc)} />
                      <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">Delete</span>
                    </span>
                  </div>
                </td>
                <td className="p-2 text-center align-middle text-gray-600 text-sm w-[32%]">
                  {doc.assignedAt ? new Date(doc.assignedAt + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination and Info - Improved Alignment */}
    {/* Delete Confirmation Modal */}
    {showDeleteModal && docToDelete && (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
          <div className="text-lg font-semibold mb-2">Delete Document</div>
          <div className="mb-4">Are you sure you want to delete <strong>{docToDelete.docName}</strong>?</div>
          <div className="flex justify-end gap-2">
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={() => { setShowDeleteModal(false); setDocToDelete(null); }}
              disabled={deleting}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="sticky bottom-0 left-0 w-full bg-white z-20 flex flex-col md:flex-row justify-between items-center gap-2 border-t border-gray-200 py-2 px-4">
      <div className="text-xs text-gray-600 md:mb-0 mb-2">
        Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold">{Math.min(currentPage * pageSize, filteredDocs.length)}</span> of <span className="font-semibold">{filteredDocs.length}</span> documents
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-xs font-medium"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-xs font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-xs font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>

    {/* File Upload Modal */}
    {openUploader && selectedDoc && (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={() => setOpenUploader(false)}
          >
            <X size={20} />
          </button>
          <Fileuploader
            userid={userid}
            docName={selectedDoc.docName}
            onUpload={(uploadedFile) => {
              setAssignedDocs((prev) =>
                prev.map((doc) =>
                  doc.docName === uploadedFile.docName
                    ? {
                        ...doc,
                        fileUrl: uploadedFile.fileUrl,
                        fileId: uploadedFile.fileId,
                        status: "uploaded",
                      }
                    : doc
                )
              );
              setOpenUploader(false);
              toast.success("File uploaded and sent to admin!");
            }}
            onClose={() => setOpenUploader(false)}
          />
        </div>
      </div>
    )}
  </div>
);

}
