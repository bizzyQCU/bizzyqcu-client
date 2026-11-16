import Sidebar from "../components/Sidebar";
import SellerMessages from "../components/messages/SellerMessages";

export default function Messages() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <SellerMessages />
      </div>
    </div>
  );
}
