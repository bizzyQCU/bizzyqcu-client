import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock,
  Lock,
  ShieldAlert,
} from "lucide-react";

const SELLER_TYPE_LABELS = {
  STUDENT_ENTERPRISE: "Student Enterprise (BSE / OJT)",
  RECOGNIZED_ORGANIZATION: "Recognized Student Organization",
  INDEPENDENT_SELLER: "Independent Student Seller",
};

export default function PendingApprovalNotice({
  user,
  settingsPath = "/seller/org/settings",
}) {
  const accountStatus = user?.verificationStatus || "PENDING";
  const sellerStatus = user?.sellerProfile?.verificationStatus || accountStatus;
  const isRejected =
    accountStatus === "REJECTED" || sellerStatus === "REJECTED";
  const rejectionReason =
    user?.sellerProfile?.rejectionReason || user?.rejectionReason || null;

  const sellerTypeLabel =
    SELLER_TYPE_LABELS[user?.sellerProfile?.sellerType] ||
    SELLER_TYPE_LABELS[user?.sellerType] ||
    "Campus Seller";

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Top Status Notice Banner */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${
          isRejected
            ? "bg-rose-50/90 border-rose-200 dark:bg-rose-500/10 dark:border-rose-400/30"
            : "bg-amber-50/90 border-amber-200 dark:bg-amber-500/10 dark:border-amber-400/30"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                isRejected
                  ? "bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-300"
                  : "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-400/15 dark:border-amber-400/30 dark:text-amber-300"
              }`}
            >
              {isRejected ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isRejected
                  ? "Account Verification Rejected"
                  : "Account Waiting for Approval"}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {isRejected ? (
                  <>
                    Your seller verification was not approved
                    {rejectionReason ? `: "${rejectionReason}"` : "."} Please
                    resubmit clear verification documents to activate your
                    seller store.
                  </>
                ) : (
                  "Your seller account is currently under review by the administration. You can browse your dashboard, while product listings, inventory management, and order fulfillment remain locked until your account is approved."
                )}
              </p>
            </div>
          </div>

          <span
            className={`self-start shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isRejected
                ? "bg-white text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-400/30"
                : "bg-white text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-400/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRejected ? "bg-rose-500" : "bg-amber-500"
              }`}
            />
            <span>{isRejected ? "Action Needed" : "Pending Approval"}</span>
          </span>
        </div>
      </div>

      {/* Application Review Progress Card */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-[#0284C7] dark:bg-amber-400/10 dark:border-amber-400/25 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isRejected
                  ? "Resubmit Your Verification"
                  : "Your Application is Under Review"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                {isRejected
                  ? "Update your QCU ID photo, live selfie, or seller endorsement document so our admin team can re-evaluate your application."
                  : "Our admin team is verifying your QCU ID, live selfie, and seller endorsement document. Once approved, your seller tools will unlock automatically."}
              </p>
            </div>
          </div>

          {!isRejected && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg">
              Typical review: 24–48 hrs
            </span>
          )}
        </div>

        {/* 3-Step Horizontal Stepper */}
        <div className="py-2">
          <div className="grid grid-cols-3 items-start relative">
            {/* Connector Line */}
            <div
              aria-hidden="true"
              className="absolute top-5 left-[16.67%] right-[16.67%] h-0.5 bg-slate-200 dark:bg-white/10"
            />
            <div
              aria-hidden="true"
              className={`absolute top-5 left-[16.67%] w-[33.33%] h-0.5 ${
                isRejected
                  ? "bg-rose-400 dark:bg-rose-500/70"
                  : "bg-[#0284C7] dark:bg-amber-400"
              }`}
            />

            {/* Step 1: Registered */}
            <div className="relative flex flex-col items-center text-center px-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-sm ring-4 ring-white dark:ring-slate-900">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="mt-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                Registered
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Documents submitted
              </p>
            </div>

            {/* Step 2: Admin Review */}
            <div className="relative flex flex-col items-center text-center px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white dark:ring-slate-900 ${
                  isRejected
                    ? "bg-rose-600 text-white"
                    : "bg-amber-500 text-white dark:text-slate-950"
                }`}
              >
                {isRejected ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <p
                className={`mt-2.5 text-xs sm:text-sm font-semibold ${
                  isRejected
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {isRejected ? "Needs Resubmission" : "Pending Admin Approval"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isRejected ? "Check rejection note" : "In verification queue"}
              </p>
            </div>

            {/* Step 3: Store Active */}
            <div className="relative flex flex-col items-center text-center px-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                <Lock className="w-4 h-4" />
              </div>
              <p className="mt-2.5 text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">
                Store Active &amp; Selling
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Unlocks after approval
              </p>
            </div>
          </div>
        </div>

        {/* Submitted Account Summary */}
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-white/10">
          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 px-3.5 py-2.5">
            <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              QCU ID Number
            </dt>
            <dd className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {user?.qcuIdNumber || "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 px-3.5 py-2.5">
            <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Seller Category
            </dt>
            <dd className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
              {sellerTypeLabel}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 px-3.5 py-2.5">
            <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Registered Email
            </dt>
            <dd className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
              {user?.email || "—"}
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 text-sm font-semibold transition-colors"
          >
            <span>Review Submitted Documents</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          {settingsPath && (
            <Link
              to={settingsPath}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
            >
              <span>Account Settings</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
