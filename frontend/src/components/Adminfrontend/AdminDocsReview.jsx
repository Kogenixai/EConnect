import { useState, useEffect, useMemo, useRef } from "react";
import {
  Check,
  FileText,
  X,
  User,
  PlusCircle,
  Upload,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Search,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ipadr } from "../../Utils/Resuse";

export default function AdminDocsReview() {
  const headerRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newDocName, setNewDocName] = useState("");
  const [assignedDocs, setAssignedDocs] = useState({});
  const [reviewUser, setReviewUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignModal, setAssignModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loadingDocs, setLoadingDocs] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({ userId: null, docName: "" });

  const pageOptions = [20, 50, 100];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const setHeaderVar = () => {
      const h = headerRef.current ? headerRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty('--adr-header-height', `${h}px`);
    };
    setHeaderVar();
    window.addEventListener('resize', setHeaderVar);
    return () => window.removeEventListener('resize', setHeaderVar);
  }, [statusFilter, searchTerm]);

  // OPTIMIZED: Fetch users without loading all docs immediately
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${ipadr}/get_all_users`);
      const normalizedUsers = res.data
        .map((u) => ({
          ...u,
          userId: u.id || u._id || u.userId,
        }))
        .filter((u) => u.position?.toLowerCase() !== "admin");

      setUsers(normalizedUsers);
      // DON'T load all docs at once - load lazily when needed
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to fetch employees");
    } finally {
      setLoadingUsers(false);
    }
  };

  // OPTIMIZED: Lazy loading with caching
  const fetchAssignedDocs = async (userId) => {
    // Don't refetch if already loaded
    if (assignedDocs[userId]) {
      return;
    }

    setLoadingDocs(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await axios.get(`${ipadr}/documents/assigned/${userId}`);
      setAssignedDocs((prev) => ({ ...prev, [userId]: res.data }));
    } catch (err) {
      console.error(`Error fetching docs for user ${userId}:`, err);
      toast.error(`Failed to load documents for user`);
    } finally {
      setLoadingDocs(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAssignDocument = async () => {
    if (!selectedUsers.length) {
      toast.warning("Select at least 1 user.");
      return;
    }
    if (!newDocName.trim()) {
      toast.warning("Enter a document name.");
      return;
    }
    const docNameTrimmed = newDocName.trim();

    try {
      setLoadingAssign(true);
      
      await axios.post(`${ipadr}/assign_docs`, {
        userIds: selectedUsers,
        docName: docNameTrimmed,
      });

      // Invalidate cache for affected users
      setAssignedDocs((prev) => {
        const updated = { ...prev };
        selectedUsers.forEach((uid) => {
          delete updated[uid]; // Clear cache to force reload
        });
        return updated;
      });

      setNewDocName("");
      setSelectedUsers([]);
      toast.success("Document assigned successfully!");
      setAssignModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign document");
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleVerify = async (userId, docName) => {
  try {
    await axios.put(`${ipadr}/review_document`, {
      userId,
      docName,
      status: "verified",
      remarks: "Verified by Admin",
    });

    // ✅ Update local state instantly (don’t delete)
    setAssignedDocs((prev) => {
      const updated = { ...prev };
      if (updated[userId]) {
        updated[userId] = updated[userId].map((doc) =>
          doc.docName === docName ? { ...doc, status: "verified" } : doc
        );
      }
      return updated;
    });

    toast.success("Document verified successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Verification failed");
  }
};


  const handleDelete = (userId, docName) => {
  setDeleteInfo({ userId, docName });
  setDeleteModal(true);
};


  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      
      const userDocs = assignedDocs[user.userId] || [];
      const hasStatus = userDocs.some(doc => {
        if (statusFilter === "pending") return !doc.fileUrl;
        if (statusFilter === "uploaded") return doc.fileUrl && doc.status !== "verified";
        if (statusFilter === "verified") return doc.status === "verified";
        return true;
      });

      return matchesSearch && hasStatus;
    });
  }, [users, searchTerm, statusFilter, assignedDocs]);

  const filterDocsByStatus = (docs) => {
    if (statusFilter === "all") return docs;
    return docs.filter((doc) => {
      if (statusFilter === "pending") return !doc.fileUrl;
      if (statusFilter === "uploaded") return doc.fileUrl && doc.status !== "verified";
      if (statusFilter === "verified") return doc.status === "verified";
      return true;
    });
  };

  // OPTIMIZED: Load docs when user card is clicked
  const handleUserClick = async (user) => {
    setReviewUser(user);
    if (!assignedDocs[user.userId] && !loadingDocs[user.userId]) {
      await fetchAssignedDocs(user.userId);
    }
  };

  if (loadingUsers) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pageUsers = filteredUsers.slice(start, start + pageSize);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div ref={headerRef} className="bg-white shadow-sm border-b border-gray-200 p-4 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-3xl font-bold font-inter pb-2 text-gray-800 bg-clip-text border-b-2">
              Documents Management
            </h2>
          </div>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div className="bg-blue-100 p-2 rounded-xl border border-gray-200 shadow-sm w-[80%]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search employees by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-1.5 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="uploaded">Uploaded</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSelectedUsers([]);
                  }}
                  className="w-full px-3 py-1.5 bg-blue-400 text-white rounded-md hover:bg-gray-400 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="ml-4 mt-[30px]">
            <button
              onClick={() => setAssignModal("select")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all text-sm font-medium"
            >
              Assign Documents
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-2 bg-white">
        <div
          className="overflow-y-auto border rounded-lg bg-gray-50"
          style={{ maxHeight: 'calc(100vh - var(--adr-header-height) - 120px)' }}
        >
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No employees found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 rounded-md overflow-hidden shadow-sm">
              {pageUsers.map((user, idx) => (
                <li
                  key={user.userId}
                  onClick={() => handleUserClick(user)}
                  className="group flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.[0]?.toUpperCase() || <User size={14} />}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>

                  {statusFilter !== "all" && assignedDocs[user.userId] && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      {filterDocsByStatus(assignedDocs[user.userId] || []).length} {statusFilter}
                    </span>
                  )}
                  <div className="ml-3 flex items-center">
                <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-transform transform group-hover:translate-x-1" />
              </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 p-3 border-t bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Per page</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              {pageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewUser && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setReviewUser(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                  {reviewUser.name?.[0]?.toUpperCase() || <User size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{reviewUser.name}</h2>
                  <p className="text-sm text-gray-500">Document Review & Management</p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setReviewUser(null)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {loadingDocs[reviewUser.userId] ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="border rounded-t-lg bg-[#6d9eeb7a]">
                    <table className="w-full">
                       <colgroup>
                       <col style={{ width: '50%' }} />
                       <col style={{ width: '30%' }} />
                       <col style={{ width: '20%' }} />
                     </colgroup>
                      <thead className="text-xs font-semibold uppercase text-black">
                        <tr>
                          <th className="px-4 py-2 text-center">Document</th>
                          <th className="px-4 py-2 text-center">Status</th>
                          <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  <div className="overflow-y-auto max-h-[400px] border border-t-0 rounded-b-lg">
                    <table className="min-w-full border-collapse table-fixed">
                     <colgroup>
                        <col style={{ width: '50%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '20%' }} />
                      </colgroup>
                      <tbody className="text-sm divide-y divide-gray-100">
                        {filterDocsByStatus(assignedDocs[reviewUser.userId] || []).length === 0 ? (
                          <tr>
                            <td colSpan="3" className="p-8 text-center text-gray-400">
                              No documents found.
                            </td>
                          </tr>
                        ) : (
                          filterDocsByStatus(assignedDocs[reviewUser.userId] || [])
                            .slice()
                            .reverse()
                            .map((doc) => (
                              <tr key={doc.docName} className="hover:bg-blue-50 transition-colors">
                                 <td className="p-3 align-middle overflow-hidden">
                                 <div className="flex items-center gap-5 text-gray-800">
                                    <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                  <span
                                     className="font-medium block truncate max-w-full"
                                     title={doc.docName}
                                   >
                                     {doc.docName && doc.docName.length > 50
                                       ? `${doc.docName.slice(0, 50)}.....`
                                       : doc.docName}
                                   </span>
                                  </div>
                                </td>

                                <td className="p-3 text-center align-middle">
                                  <div className="flex justify-center gap-4">
                                    {doc.status === "verified" ? (
                                      <div className="text-green-600" title="Verified">
                                        <CheckCircle size={18} />
                                      </div>
                                    ) : doc.fileUrl ? (
                                      <div className="text-blue-600" title="Uploaded">
                                        <Upload size={18} />
                                      </div>
                                    ) : (
                                      <div className="text-gray-600" title="Pending">
                                        <Clock size={18} />
                                      </div>
                                    )}
                                  </div>
                                </td>

                                                          <td className="px-2 py-3 text-center align-middle">
                              <div className="flex justify-center items-center gap-x-4">

                                {/* Eye */}
                                <div className="w-6 flex justify-center">
                                  {doc.fileUrl ? (
                                    <a
                                      href={`${ipadr}${doc.fileUrl}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 hover:text-blue-800 transition"
                                      title="View Document"
                                    >
                                      <Eye size={18} />
                                    </a>
                                  ) : (
                                    <span />
                                  )}
                                </div>

                                {/* Tick */}
                                <div className="w-6 flex justify-center">
                                  {doc.fileUrl && doc.status !== "verified" ? (
                                    <button
                                      onClick={() => handleVerify(reviewUser.userId, doc.docName)}
                                      className="text-green-600 hover:text-green-800 transition"
                                      title="Verify Document"
                                    >
                                      <Check size={18} />
                                    </button>
                                  ) : (
                                    <span />
                                  )}
                                </div>

                                {/* Delete */}
                                <div className="w-6 flex justify-center">
                                  <button
                                    onClick={() => handleDelete(reviewUser.userId, doc.docName)}
                                    className="text-red-600 hover:text-red-800 transition"
                                    title="Delete Document"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>

                              </div>
                            </td>


                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Select Users Modal */}
      {assignModal === "select" && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setAssignModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Select Employees</h3>
              <button
                onClick={() => setAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                Select one or more employees to assign documents.
              </p>

              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {modalSearchTerm ? (
                  <button
                    onClick={() => setModalSearchTerm("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <Search
                    size={16}
                    className="absolute right-3 top-2.5 text-gray-400"
                  />
                )}
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {users
                  .filter((u) => u.name?.toLowerCase().includes(modalSearchTerm.toLowerCase()))
                  .map((u) => (
                    <label
                      key={u.userId}
                      className="flex items-center gap-2 py-2 px-3 text-sm cursor-pointer rounded-md hover:bg-blue-100 transition-colors duration-150"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.userId)}
                        onChange={() => toggleUserSelection(u.userId)}
                        className="text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-gray-700">{u.name}</span>
                    </label>
                  ))}

                {users.filter((u) => u.name?.toLowerCase().includes(modalSearchTerm.toLowerCase()))
                  .length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-2">No employees found.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center w-full sm:w-auto">
                <strong>{selectedUsers.length}</strong> user{selectedUsers.length > 1 ? "s are" : " is"} selected.
              </p>

              <div className="flex justify-end gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedUsers([]);
                    setModalSearchTerm("");
                    setAssignModal(false);
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (selectedUsers.length === 0) {
                      toast.warning("Select at least one user");
                      return;
                    }
                    setAssignModal("confirm");
                  }}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Assignment Modal */}
      {assignModal === "confirm" && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setAssignModal("select")}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Assign Documents</h3>
              <button
                onClick={() => setAssignModal("select")}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">Enter the document name to assign.</p>

              <div className="relative">
                <FileText
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Enter document name..."
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setAssignModal("select")}
                className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleAssignDocument}
                disabled={loadingAssign}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {loadingAssign ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    Assign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
    onClick={() => setDeleteModal(false)}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
        <button
          onClick={() => setDeleteModal(false)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 text-center">
        <p className="text-gray-700 text-sm mb-4">
          Are you sure you want to delete ? <strong className="line-clamp-3 text-center px-4 break-words">{deleteInfo.docName}</strong>
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={async () => {
              try {
                await axios.delete(`${ipadr}/assigned_doc_delete`, {
                  data: { userId: deleteInfo.userId, docName: deleteInfo.docName },
                });
                setAssignedDocs((prev) => ({
                  ...prev,
                  [deleteInfo.userId]: (prev[deleteInfo.userId] || []).filter(
                    (d) => d.docName !== deleteInfo.docName
                  ),
                }));
                toast.success("Document deleted successfully!");
              } catch (err) {
                console.error(err);
                toast.error("Failed to delete document");
              } finally {
                setDeleteModal(false);
              }
            }}
            className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Yes, Delete
          </button>

          <button
            onClick={() => setDeleteModal(false)}
            className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
}