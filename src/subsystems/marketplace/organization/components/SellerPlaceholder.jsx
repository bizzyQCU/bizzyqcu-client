import Sidebar from './Sidebar'
import SellerTopBar from './SellerTopBar'
import PendingApprovalNotice from './PendingApprovalNotice'
import { useAuth } from '../../../../hooks/useAuth'

export default function SellerPlaceholder({ title, text }) {
  const { user } = useAuth()
  const isPendingApproval =
    user?.role === 'SELLER' &&
    (user?.verificationStatus !== 'VERIFIED' ||
      (user?.sellerProfile?.verificationStatus &&
        user.sellerProfile.verificationStatus !== 'VERIFIED'))

  const handleMessagesClick = () => {
    console.log('Messages clicked')
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <SellerTopBar onMessagesClick={handleMessagesClick} />
        <main className="p-6 sm:p-8 flex-1 flex items-center justify-center">
          {isPendingApproval ? (
            <PendingApprovalNotice user={user} settingsPath={null} />
          ) : (
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
              <p className="text-slate-500">{text}</p>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400">This page is under construction.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
