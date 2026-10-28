import { useEffect, useState } from "react";
import { getPendingVerifications, approveUserVerification, rejectUserVerification } from "../api";

export default function VerificationTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await getPendingVerifications();
      // The backend now returns { success: true, items: [...] } based on Guades' code
      setUsers(res.items || res.data || []); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId) => {
    await approveUserVerification(userId);
    setUsers(users.filter((u) => u.id !== userId)); // Remove from UI
  };

  const handleReject = async (userId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      await rejectUserVerification(userId, reason);
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  if (loading) return <p className="text-gray-400">Loading queue...</p>;

  return (
    <div className="space-y-4">
      {users.length === 0 && <p className="text-gray-400">No pending users to verify.</p>}
      {users.map((user) => (
        <div key={user.id} className="bg-[#1E293B] p-4 rounded-xl flex justify-between items-center border border-gray-700">
          <div>
            <h3 className="font-bold text-lg">{user.fullName}</h3>
            <p className="text-gray-400 text-sm">{user.qcuIdNumber} • {user.memberType}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleApprove(user.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">Approve</button>
            <button onClick={() => handleReject(user.id)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}