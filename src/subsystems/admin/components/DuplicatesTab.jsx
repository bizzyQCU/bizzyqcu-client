import { useEffect, useState } from "react";
import { getDuplicates, reopenDispute } from "../api";

export default function DuplicatesTab() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDuplicates = async () => {
    try {
      const res = await getDuplicates();
      setClusters(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDuplicates();
  }, []);

  const handleReopen = async (userId) => {
    const reason = prompt("Enter reason to reopen this dispute:");
    if (reason) {
      await reopenDispute(userId, reason);
      alert("Dispute reopened! User is back to PENDING.");
    }
  };

  if (loading) return <p className="text-gray-400">Scanning for duplicates...</p>;

  return (
    <div className="space-y-6">
      {clusters.length === 0 && <p className="text-green-400">No duplicate accounts found. System is clean!</p>}
      
      {clusters.map((cluster, idx) => (
        <div key={idx} className="bg-[#1E293B] p-6 rounded-xl border border-red-900/50 shadow-lg shadow-red-900/10">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h3 className="font-bold text-lg text-red-400">Potential Duplicate Cluster</h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Signals: {cluster.signals.join(", ")}</span>
          </div>
          
          <div className="grid gap-3">
            {cluster.users.map((user) => (
              <div key={user.id} className="bg-[#0B1120] p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-bold">{user.fullName}</p>
                  <p className="text-sm text-gray-400">{user.email} • {user.qcuIdNumber}</p>
                </div>
                <button onClick={() => handleReopen(user.id)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded text-sm font-bold">
                  Reopen Dispute
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}