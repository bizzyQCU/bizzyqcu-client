import { useState } from "react";
import Icon from "../../../components/Icon.jsx";
import VerifiedSeal from "../../../components/VerifiedSeal.jsx";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Juan Bautista",
    course: "BSIT 3rd Year",
    studentId: "21-08492",
    phone: "+63 917 123 4567",
    email: "juan.bautista@qcu.edu.ph",
  });
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  const fields = [
    { key: "name", label: "Full name" },
    { key: "course", label: "Course and year" },
    { key: "phone", label: "Active phone number" },
    { key: "email", label: "QCU email" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-1 text-xs text-slate-500">Your account details on BizzyQCU</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-700">JB</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">{profile.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-[#0284C7]">
                <VerifiedSeal className="h-3.5 w-3.5" />
                Verified QCU
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Student ID {profile.studentId}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{f.label}</dt>
              {editing ? (
                <input
                  value={draft[f.key]}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="mt-1 w-full rounded-xl border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:ring-sky-500"
                />
              ) : (
                <dd className="mt-1 text-sm font-medium text-slate-800">{profile[f.key]}</dd>
              )}
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-center justify-end gap-3">
          {saved && <span className="text-xs font-semibold text-emerald-600">Changes saved</span>}
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setDraft(profile);
                  setEditing(false);
                }}
                className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfile(draft);
                  setEditing(false);
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}
                className="rounded-full bg-[#0284C7] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0369A1]"
              >
                Save changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(profile);
                setEditing(true);
              }}
              className="rounded-full border-[1.5px] border-[#8ACFF8] bg-white px-5 py-2 text-xs font-semibold text-[#0369A1] transition hover:bg-sky-50"
            >
              Edit profile
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
