import { Link, useSearchParams } from 'react-router-dom'

const labels = {
  entrepreneur: 'Entrepreneurship Student',
  individual: 'Individual Student',
  organization: 'Student Organization',
}

export default function SellerAuth() {
  const [params] = useSearchParams()
  const type = params.get('type')
  const label = labels[type] || 'Seller'

  return (
    <main className="flex-grow flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-3xl w-full max-w-[500px] p-10 shadow-modal text-center text-slate-900">
        <h1 className="text-2xl font-extrabold">{label} Login</h1>
        <p className="text-sm text-slate-500 mt-2">The seller login form for this portal will live here.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link to="/seller-register" className="py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors">
            Choose a different portal
          </Link>
          <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
