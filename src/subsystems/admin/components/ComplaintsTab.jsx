import { useEffect, useState } from "react";
import { getComplaints, resolveComplaint } from "../api";

export default function ComplaintsTab() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaints().then((res) => {
      setComplaints(res.data || []);
      setLoading(false);
    });
  }, []);

  const handleResolve = async (complaintId) => {
    const note = prompt("Enter resolution note (min 5 chars):");
    if (note && note.length >= 5) {
      await resolveComplaint(complaintId, "RESOLVED", note);
      setComplaints(complaints.map(c => c.id === complaintId ? { ...c, status: "RESOLVED" } : c));
    } else {
      alert("Note must be at least 5 characters.");
    }
  };

  if (loading) return <p className="text-gray-400">Loading complaints...</p>;

  return (
    <div className="space-y-4">
      {complaints.length === 0 && <p className="text-gray-400">No complaints found.</p>}
      {complaints.map((c) => (
        <div key={c.id} className="bg-[#1E293B] p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-red-400">Complaint #{c.id.slice(0, 6)}</h3>
              <p className="text-gray-400 text-sm">From: {c.complainant?.fullName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {c.status}
            </span>
          </div>
          <p className="text-white mt-2">{c.description || "No description provided."}</p>
          
          {c.status !== "RESOLVED" && (
            <button onClick={() => handleResolve(c.id)} className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm">
              Mark as Resolved
            </button>
          )}
        </div>
      ))}
    </div>
  );
}