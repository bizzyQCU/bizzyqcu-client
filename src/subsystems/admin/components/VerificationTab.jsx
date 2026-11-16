import { useEffect, useState } from "react";
import {
  getPendingVerifications,
  approveUserVerification,
  rejectUserVerification,
  approveSellerVerification,
  rejectSellerVerification,
  approveStore,
  rejectStore,
  approveProduct,
  rejectProduct,
} from "../api";

export default function VerificationTab() {
  const [activeQueue, setActiveQueue] = useState("user"); // "user" | "seller" | "store" | "product"
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Inspection Lightbox Modal state
  const [inspectModal, setInspectModal] = useState(null); // { title, type, data }

  // Rejection Modal state
  const [rejectionModal, setRejectionModal] = useState(null); // { id, name, type }
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);
  const [rejectionError, setRejectionError] = useState("");

  // Processing state for approval actions
  const [processingId, setProcessingId] = useState(null);

  const loadQueue = async (queueType = activeQueue, page = 1) => {
    setLoading(true);
    try {
      const res = await getPendingVerifications({ type: queueType, page, limit: 12 });
      setItems(res.items || res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (error) {
      console.error("Failed to load verification queue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue(activeQueue, 1);
  }, [activeQueue]);

  // Handle Approvals
  const handleApprove = async (id, type = activeQueue) => {
    setProcessingId(id);
    try {
      if (type === "user") await approveUserVerification(id);
      else if (type === "seller") await approveSellerVerification(id);
      else if (type === "store") await approveStore(id);
      else if (type === "product") await approveProduct(id);

      // Remove approved item from queue state
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (inspectModal && inspectModal.data.id === id) {
        setInspectModal(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to approve.");
    } finally {
      setProcessingId(null);
    }
  };

  // Open Rejection Dialog
  const openRejectDialog = (item, type = activeQueue) => {
    const name =
      item.fullName ||
      item.name ||
      item.user?.fullName ||
      `Record #${item.id.slice(0, 8)}`;
    setRejectionModal({ id: item.id, name, type });
    setRejectionReason("");
    setRejectionError("");
  };

  // Submit Rejection
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setRejectionError("Rejection reason must be at least 5 characters.");
      return;
    }
    setSubmittingReject(true);
    setRejectionError("");

    try {
      const { id, type } = rejectionModal;
      if (type === "user") await rejectUserVerification(id, rejectionReason.trim());
      else if (type === "seller") await rejectSellerVerification(id, rejectionReason.trim());
      else if (type === "store") await rejectStore(id, rejectionReason.trim());
      else if (type === "product") await rejectProduct(id, rejectionReason.trim());

      setItems((prev) => prev.filter((item) => item.id !== id));
      if (inspectModal && inspectModal.data.id === id) {
        setInspectModal(null);
      }
      setRejectionModal(null);
    } catch (err) {
      setRejectionError(err.response?.data?.message || err.message || "Failed to reject item.");
    } finally {
      setSubmittingReject(false);
    }
  };

  const queueTabs = [
    { id: "user", label: "Student & Faculty ID Cards", icon: "🪪" },
    { id: "seller", label: "Seller Endorsements", icon: "📜" },
    { id: "store", label: "Store Profiles", icon: "🏪" },
    { id: "product", label: "Product Approvals", icon: "📦" },
  ];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header Banner */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#111827] p-5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold font-mono">
            Identity & Compliance • RA 10173 Protected
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mt-1">Verification Queue & File Inspection</h2>
        <p className="text-sm text-slate-400">
          Inspect uploaded QCU ID cards, browser camera live selfies, endorsement documents, and catalog listings.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Category Tabs */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {queueTabs.map((tab) => {
          const isActive = activeQueue === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveQueue(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "bg-[#1E293B] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {isActive && items.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-amber-400 font-mono font-bold">
                  {items.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content Area */}
      {/* ------------------------------------------------------------------ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-[#1E293B] p-5 rounded-2xl border border-slate-800 animate-pulse space-y-4">
              <div className="h-5 bg-slate-700 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-3 h-36 bg-slate-800 rounded-xl"></div>
              <div className="h-8 bg-slate-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[#1E293B] border border-dashed border-slate-700 p-12 rounded-2xl text-center space-y-2">
          <div className="text-3xl">🎉</div>
          <h3 className="text-lg font-bold text-white">Queue is clear!</h3>
          <p className="text-sm text-slate-400">
            No pending items currently awaiting review in the {queueTabs.find((t) => t.id === activeQueue)?.label} queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ============================================================== */}
          {/* QUEUE 1: USER ID & SELFIE VERIFICATION */}
          {/* ============================================================== */}
          {activeQueue === "user" &&
            items.map((user) => (
              <div
                key={user.id}
                className="bg-[#1E293B] hover:bg-[#223046] transition-all p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">{user.fullName}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="font-mono text-amber-400 font-semibold">{user.qcuIdNumber}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 font-medium">{user.memberType}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    PENDING VERIFICATION
                  </span>
                </div>

                {/* SIDE-BY-SIDE UPLOADED FILES DISPLAY */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Uploaded Documents for Liveness Matching</span>
                    <span className="text-slate-500 text-[10px]">Click image to inspect</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* QCU ID Card */}
                    <div
                      onClick={() =>
                        setInspectModal({
                          title: `QCU ID Verification • ${user.fullName}`,
                          type: "user",
                          data: user,
                        })
                      }
                      className="group relative cursor-pointer aspect-[4/3] rounded-xl overflow-hidden bg-[#0B1120] border border-slate-700 hover:border-amber-400 transition-all shadow-md"
                    >
                      <img
                        src={user.qcuIdPhotoUrl}
                        alt="QCU ID Card"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-center">
                        <span className="text-[11px] font-bold text-white drop-shadow">🪪 QCU ID Photo</span>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg">
                          🔍 Inspect
                        </span>
                      </div>
                    </div>

                    {/* Live Selfie */}
                    <div
                      onClick={() =>
                        setInspectModal({
                          title: `Live Selfie Verification • ${user.fullName}`,
                          type: "user",
                          data: user,
                        })
                      }
                      className="group relative cursor-pointer aspect-[4/3] rounded-xl overflow-hidden bg-[#0B1120] border border-slate-700 hover:border-amber-400 transition-all shadow-md"
                    >
                      <img
                        src={user.liveSelfieUrl}
                        alt="Live Camera Selfie"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-center">
                        <span className="text-[11px] font-bold text-white drop-shadow">🤳 Camera Selfie</span>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg">
                          🔍 Inspect
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facial Match Guidance */}
                <div className="bg-[#0B1120] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Confirm student face on ID matches live camera selfie.</span>
                  <button
                    onClick={() =>
                      setInspectModal({
                        title: `Side-by-Side Face Inspection • ${user.fullName}`,
                        type: "user",
                        data: user,
                      })
                    }
                    className="text-amber-400 font-bold hover:underline ml-2"
                  >
                    Compare Side-by-Side ↗
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
                  <button
                    disabled={processingId === user.id}
                    onClick={() => handleApprove(user.id, "user")}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve Student
                  </button>

                  <button
                    disabled={processingId === user.id}
                    onClick={() => openRejectDialog(user, "user")}
                    className="py-2 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs transition-all"
                  >
                    Reject...
                  </button>
                </div>
              </div>
            ))}

          {/* ============================================================== */}
          {/* QUEUE 2: SELLER ENDORSEMENT VERIFICATION */}
          {/* ============================================================== */}
          {activeQueue === "seller" &&
            items.map((seller) => (
              <div
                key={seller.id}
                className="bg-[#1E293B] hover:bg-[#223046] transition-all p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">{seller.user?.fullName || "Seller Applicant"}</h3>
                    <p className="text-xs text-slate-400">{seller.user?.email} • {seller.user?.qcuIdNumber}</p>
                    <span className="inline-block mt-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {seller.sellerType}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    PENDING SELLER
                  </span>
                </div>

                {/* Uploaded Supporting Document */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    Uploaded Endorsement Document
                  </div>
                  <div
                    onClick={() =>
                      setInspectModal({
                        title: `Seller Supporting Document • ${seller.user?.fullName}`,
                        type: "seller",
                        data: seller,
                      })
                    }
                    className="group relative cursor-pointer h-40 rounded-xl overflow-hidden bg-[#0B1120] border border-slate-700 hover:border-amber-400 transition-all flex items-center justify-center p-3"
                  >
                    <img
                      src={seller.supportingDocumentUrl}
                      alt="Supporting Document"
                      className="max-h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-bold text-white bg-black/70 px-3 py-1.5 rounded-lg">
                        🔍 Inspect Full Document
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
                  <button
                    disabled={processingId === seller.id}
                    onClick={() => handleApprove(seller.id, "seller")}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    Approve Seller Role
                  </button>

                  <button
                    disabled={processingId === seller.id}
                    onClick={() => openRejectDialog(seller, "seller")}
                    className="py-2 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs transition-all"
                  >
                    Reject...
                  </button>
                </div>
              </div>
            ))}

          {/* ============================================================== */}
          {/* QUEUE 3: STORE APPROVALS */}
          {/* ============================================================== */}
          {activeQueue === "store" &&
            items.map((store) => (
              <div
                key={store.id}
                className="bg-[#1E293B] hover:bg-[#223046] transition-all p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4"
              >
                <div>
                  <h3 className="font-bold text-base text-white">{store.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{store.description}</p>
                  <div className="text-xs text-amber-300 mt-1">📍 Pickup: {store.pickupLocation || "Campus Lobby"}</div>
                </div>

                {/* Logo & Banner Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Logo</span>
                    <div className="h-24 rounded-lg bg-[#0B1120] border border-slate-700 overflow-hidden flex items-center justify-center">
                      <img src={store.logoUrl} alt="Store Logo" className="max-h-full object-contain" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Banner</span>
                    <div className="h-24 rounded-lg bg-[#0B1120] border border-slate-700 overflow-hidden">
                      <img src={store.bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
                  <button
                    onClick={() => handleApprove(store.id, "store")}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Approve Store
                  </button>
                  <button
                    onClick={() => openRejectDialog(store, "store")}
                    className="py-2 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs"
                  >
                    Reject...
                  </button>
                </div>
              </div>
            ))}

          {/* ============================================================== */}
          {/* QUEUE 4: PRODUCT APPROVALS */}
          {/* ============================================================== */}
          {activeQueue === "product" &&
            items.map((product) => (
              <div
                key={product.id}
                className="bg-[#1E293B] hover:bg-[#223046] transition-all p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base text-white">{product.name}</h3>
                    <span className="text-base font-extrabold text-amber-400">₱{Number(product.price).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description}</p>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Store: <span className="text-white font-semibold">{product.store?.name}</span> • Stock: {product.stockQuantity}
                  </div>
                </div>

                {/* Gallery */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Product Photos</span>
                  <div className="grid grid-cols-3 gap-2">
                    {product.imageUrls?.map((url, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          setInspectModal({
                            title: `Product Photo • ${product.name}`,
                            type: "image",
                            data: { url },
                          })
                        }
                        className="aspect-square rounded-lg bg-[#0B1120] border border-slate-700 overflow-hidden cursor-pointer hover:border-amber-400 transition-colors"
                      >
                        <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60">
                  <button
                    onClick={() => handleApprove(product.id, "product")}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Approve Product
                  </button>
                  <button
                    onClick={() => openRejectDialog(product, "product")}
                    className="py-2 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs"
                  >
                    Reject...
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Full-Resolution Image Lightbox & Side-by-Side Face Inspector */}
      {/* ------------------------------------------------------------------ */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                  Identity Verification Inspection
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{inspectModal.title}</h3>
              </div>
              <button
                onClick={() => setInspectModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-lg"
              >
                ✕
              </button>
            </div>

            {/* User Side-by-Side Comparison in Full Resolution */}
            {inspectModal.type === "user" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: QCU ID */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-400 uppercase tracking-wider">🪪 QCU Student / Faculty ID</span>
                      <a
                        href={inspectModal.data.qcuIdPhotoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white underline text-[11px]"
                      >
                        Open Raw ↗
                      </a>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-[#0B1120] border border-slate-700 aspect-[4/3] flex items-center justify-center">
                      <img
                        src={inspectModal.data.qcuIdPhotoUrl}
                        alt="QCU ID Card"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Right: Camera Selfie */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sky-400 uppercase tracking-wider">🤳 Live Camera Selfie</span>
                      <a
                        href={inspectModal.data.liveSelfieUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white underline text-[11px]"
                      >
                        Open Raw ↗
                      </a>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-[#0B1120] border border-slate-700 aspect-[4/3] flex items-center justify-center">
                      <img
                        src={inspectModal.data.liveSelfieUrl}
                        alt="Live Camera Selfie"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Info Card */}
                <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Full Name:</span>
                    <span className="font-bold text-white text-sm">{inspectModal.data.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">QCU ID Number:</span>
                    <span className="font-mono text-amber-300 font-bold">{inspectModal.data.qcuIdNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Member Type:</span>
                    <span className="font-semibold text-white">{inspectModal.data.memberType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Submission Date:</span>
                    <span className="text-slate-300">{new Date(inspectModal.data.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Quick actions directly inside lightbox */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => openRejectDialog(inspectModal.data, "user")}
                    className="px-5 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 text-xs font-bold"
                  >
                    Reject ID Photo...
                  </button>
                  <button
                    onClick={() => handleApprove(inspectModal.data.id, "user")}
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg"
                  >
                    Confirm & Approve Identity
                  </button>
                </div>
              </div>
            )}

            {/* Seller Supporting Document Inspection */}
            {inspectModal.type === "seller" && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden bg-[#0B1120] border border-slate-700 max-h-[65vh] flex items-center justify-center p-2">
                  <img
                    src={inspectModal.data.supportingDocumentUrl}
                    alt="Supporting Document"
                    className="max-h-[60vh] object-contain"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <a
                    href={inspectModal.data.supportingDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Open Document in New Tab ↗
                  </a>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openRejectDialog(inspectModal.data, "seller")}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold"
                    >
                      Reject...
                    </button>
                    <button
                      onClick={() => handleApprove(inspectModal.data.id, "seller")}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                    >
                      Approve Seller
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Generic Image Inspection */}
            {inspectModal.type === "image" && (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-[#0B1120] border border-slate-700 max-h-[65vh] flex items-center justify-center p-2">
                  <img src={inspectModal.data.url} alt="Inspect" className="max-h-[60vh] object-contain" />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setInspectModal(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Rejection Reason Dialog */}
      {/* ------------------------------------------------------------------ */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Reject Verification</h3>
                <p className="text-xs text-slate-400 mt-0.5">Item: {rejectionModal.name}</p>
              </div>
              <button onClick={() => setRejectionModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                  Rejection Reason (Sent to Applicant) <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="State the official reason for rejection (e.g. document illegible, mismatched credentials)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Minimum 5 characters</span>
                  <span>{rejectionReason.length} characters</span>
                </div>
              </div>

              {rejectionError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                  {rejectionError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModal(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md disabled:opacity-50"
                >
                  {submittingReject ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
