import { Link } from 'react-router-dom'
import HeroBackground from './HeroBackground.jsx'

export default function Placeholder({ title, text }) {
  return (
    <>
      <HeroBackground />
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl w-full max-w-[500px] p-10 shadow-modal text-center text-slate-900">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="text-sm text-slate-500 mt-2">{text}</p>
          <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors">
            Back to home
          </Link>
        </div>
      </main>
    </>
  )
}
