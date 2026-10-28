import useIsMobile from "../../../hooks/useIsMobile.js";
import MessagesMobile from "./MessagesMobile.jsx";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import { conversations, threads, orders } from "../../../lib/mockData.js";

const filters = ["All Orders", "Unread", "Active Trades"];

function MessagesDesktop() {
  const [filter, setFilter] = useState("All Orders");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(1);
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState({});
  const [recording, setRecording] = useState(false);

  const list = useMemo(() => {
    return conversations
      .filter((c) => filter === "All Orders" || (filter === "Unread" ? c.unread : c.order.includes("0891") || c.id === 2))
      .filter((c) => `${c.name} ${c.preview}`.toLowerCase().includes(query.toLowerCase()));
  }, [filter, query]);

  const conv = conversations.find((c) => c.id === activeId);
  const messages = [...(threads[activeId] ?? []), ...(extra[activeId] ?? [])];
  const order = orders.find((o) => conv && conv.order.endsWith(o.id)) ?? orders[0];

  function send(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setExtra({ ...extra, [activeId]: [...(extra[activeId] ?? []), { id: Date.now(), from: "me", text, time: "Now" }] });
    setDraft("");
  }

  return (
    <div className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:flex-row">
      {/* Conversation list */}
      <section className="flex w-full flex-shrink-0 flex-col border-r border-slate-200 bg-white md:w-[320px] lg:w-[330px]">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Messages</h1>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">{conversations.filter((c) => c.unread).length} New</span>
          </div>
          <button type="button" aria-label="Compose new message" onClick={() => { setFilter("All Orders"); setQuery(""); setActiveId(1); document.getElementById("chat-input")?.focus(); }} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600">
            <Icon name="compose" className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-2 pt-3">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        <div className="flex gap-1.5 px-3 pb-2 text-xs font-semibold">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-[11px] transition ${filter === f ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mx-3 my-1.5 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/70 p-2.5">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <div className="text-[11px] leading-tight text-slate-600">
            <strong className="font-semibold text-slate-800">Campus Safe Exchange:</strong> Designated meetup benches: Tech Lobby &amp; Library Plaza.
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-2 py-1">
          {list.length === 0 && <p className="p-4 text-center text-xs text-slate-500">No chats match.</p>}
          {list.map((c) => {
            const isActive = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${isActive ? "border-sky-200/80 bg-sky-50/60" : "border-transparent hover:border-slate-100 hover:bg-slate-50"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${isActive ? "bg-sky-600 text-white shadow-sm" : "bg-slate-200 text-slate-700"}`}>{c.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between">
                      <h2 className={`truncate text-xs font-bold ${isActive ? "text-slate-900" : "text-slate-800"}`}>{c.name}</h2>
                      <span className={`text-[10px] font-medium ${isActive ? "text-sky-600" : "text-slate-400"}`}>{c.time}</span>
                    </div>
                    <p className={`mb-1.5 truncate text-[11px] ${c.unread ? "font-medium text-slate-700" : "text-slate-500"}`}>{c.preview}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">{c.order}</span>
                      {c.unread && <span className="h-2 w-2 rounded-full bg-sky-500" />}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Thread */}
      <section className="flex min-w-0 flex-1 flex-col bg-slate-50/40">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white shadow-sm">{conv?.initials}</div>
              {conv?.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold leading-none text-slate-900">{conv?.name}</span>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">Student</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">{conv?.online ? "Active near Tech Bldg" : "Offline"}</p>
            </div>
          </div>
          <Link to={`/orders/${order.id}`} className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
            View order
            <Icon name="chevronDown" className="h-3.5 w-3.5 -rotate-90" />
          </Link>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
          {messages.map((m) =>
            m.type === "system" ? (
              <div key={m.id} className="flex justify-center">
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-medium text-slate-500">{m.text}</span>
              </div>
            ) : m.from === "me" ? (
              <div key={m.id} className="ml-auto flex max-w-[80%] items-end justify-end gap-2">
                <div className="flex flex-col items-end">
                  <div className="rounded-2xl rounded-br-sm bg-sky-600 p-3.5 leading-relaxed text-white shadow-sm">{m.text}</div>
                  <div className="mr-1 mt-1 flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex max-w-[80%] items-end gap-2">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">{conv?.initials}</div>
                <div>
                  <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white p-3.5 leading-relaxed text-slate-800 shadow-sm">{m.text}</div>
                  <span className="ml-1 mt-1 block text-[10px] text-slate-400">{m.time}</span>
                </div>
              </div>
            )
          )}
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
          <button type="button" aria-label="Voice input" aria-pressed={recording} onClick={() => setRecording((r) => !r)} className={`rounded-full p-2 transition-colors ${recording ? "bg-rose-100 text-rose-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`}>
            <Icon name="mic" className="h-5 w-5" />
          </button>
          {recording && <span className="text-[11px] font-medium text-rose-600">Recording…</span>}
          <input
            id="chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          <button type="submit" aria-label="Send Message" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm transition-transform hover:bg-sky-700 active:scale-95">
            <Icon name="send" className="h-4 w-4" fill />
          </button>
        </form>
      </section>

      {/* Order context */}
      <aside className="hidden w-[290px] flex-shrink-0 flex-col justify-between overflow-y-auto border-l border-slate-200 bg-white p-4 xl:flex">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Details</span>
            <div className="mt-0.5 flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold text-slate-800">#BZ-2024-{order.id}</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">{order.status}</span>
            </div>
          </div>
          <hr className="border-slate-100" />
          <div>
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Seller Information</span>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">{conv?.initials}</div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-slate-900">{order.seller}</div>
                <div className="text-[11px] text-slate-500">BSIT 3rd Year</div>
              </div>
            </div>
          </div>
          <hr className="border-slate-100" />
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-slate-800">₱{order.total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span className="font-medium text-slate-800">Free</span></div>
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-2">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-base font-extrabold text-slate-900">₱{order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
            <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <div className="text-[11px] leading-tight">
              <p className="font-bold text-slate-800">Room-to-room delivery</p>
              <p className="mt-0.5 text-slate-500">{order.fulfillment}</p>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <Link to={`/orders/${order.id}`} className="flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
            Open order details
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default function MessagesPage() {
  return useIsMobile() ? <MessagesMobile /> : <MessagesDesktop />;
}
