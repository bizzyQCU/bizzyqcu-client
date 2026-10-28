import { useEffect, useState } from "react";
import { getAuditLogs } from "../api";

export default function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs().then((res) => {
      setLogs(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-gray-400">Loading system logs...</p>;

  return (
    <div className="space-y-4">
      {logs.length === 0 && <p className="text-gray-400">No system activity recorded yet.</p>}
      
      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0B1120] text-yellow-500">
            <tr>
              <th className="p-4 font-bold">Admin</th>
              <th className="p-4 font-bold">Action</th>
              <th className="p-4 font-bold">Target ID</th>
              <th className="p-4 font-bold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800/50">
                <td className="p-4 text-white">{log.actor?.fullName || "System"}</td>
                <td className="p-4">
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-gray-400 font-mono text-xs">{log.targetId}</td>
                <td className="p-4 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}