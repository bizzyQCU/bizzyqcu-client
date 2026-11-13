import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";
import { useAuth } from "../../../hooks/useAuth";
import { getErrorMessage } from "../../../lib/api-client";
import { getInitials, getVerificationLabel } from "../../../lib/userDisplay.js";
import { updateEmail } from "../api";

export default function ProfilePage() {
  const { user, loading, isAuthenticated, isVerified, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEmailDraft(user?.email || "");
  }, [user?.email]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-sm text-slate-500">
        Loading your profile…
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Sign in to view your profile</h1>
        <p className="mt-1 text-xs text-slate-500">Your BizzyQCU account details will appear here once signed in.</p>
        <Link
          to="/login"
          className="mt-5 inline-block rounded-full bg-[#0284C7] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const initials = getInitials(user.fullName, "Q");
  const verificationText = getVerificationLabel(user.verificationStatus);
  const roleLabel = user.role === "SELLER" ? "Seller" : user.role === "ADMIN" ? "Admin" : "Buyer";
  const memberLabel = user.memberType
    ? `${user.memberType.charAt(0)}${user.memberType.slice(1).toLowerCase()}`
    : "Student";

  const handleSaveEmail = async () => {
    const clean = emailDraft.trim();
    if (!clean || clean === user.email) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateEmail({ email: clean });
      await refreshUser();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-1 text-xs text-slate-500">Your account details on BizzyQCU</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-700">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-slate-900">{user.fullName}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isVerified
                    ? "bg-sky-100 text-[#0284C7]"
                    : user.verificationStatus === "REJECTED"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                {isVerified && <VerifiedSeal className="h-3.5 w-3.5" />}
                {verificationText}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">QCU ID {user.qcuIdNumber}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full name</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{user.fullName}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Account type</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{memberLabel} · {roleLabel}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">QCU ID Number</dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">{user.qcuIdNumber}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">QCU email</dt>
            {editing ? (
              <input
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            ) : (
              <dd className="mt-1 text-sm font-medium text-slate-800">{user.email}</dd>
            )}
          </div>
        </dl>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/account"
            className="text-xs font-semibold text-[#0284C7] hover:underline"
          >
            Manage password &amp; passkeys →
          </Link>

          <div className="flex items-center gap-3">
            {saved && <span className="text-xs font-semibold text-emerald-600">Email updated</span>}
            {editing ? (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEmailDraft(user.email || "");
                    setError(null);
                    setEditing(false);
                  }}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveEmail}
                  className="rounded-full bg-[#0284C7] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1] disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save email"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEmailDraft(user.email || "");
                  setError(null);
                  setEditing(true);
                }}
                className="rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-5 py-2 text-xs font-semibold text-[#0369A1] transition hover:bg-sky-50"
              >
                Update email
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
