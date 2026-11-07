import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon.jsx";
import { conversations } from "../../../lib/mockData.js";
import { SUPPORT, useMessages } from "../../../lib/MessageContext.jsx";

const filters = ["All", "Unread"];

// Full-screen messages on phones: a conversation list, then a thread.
// Back returns to the list, then to the previous screen. Swiping from the left edge does the same.
export default function MessagesMobile() {
  const navigate = useNavigate();
  const { open, setOpen, view, activeId: openedId, contacts, threads, sendText } = useMessages();
  const [activeId, setActiveId] = useState(open && view === "chat" ? openedId : null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const swipe = useRef(null);

  // Opened from a "Message seller" button: take over the thread and clear the desktop flag.
  useEffect(() => {
    if (open) setOpen(false);
  }, [open, setOpen]);

  const contact = contacts.find((c) => c.id === activeId);
  const messages = activeId ? threads[activeId] ?? [] : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  function back() {
    if (activeId) {
      setActiveId(null);
      return;
    }
    if (window.history.length > 1) navigate(-1);
    else navigate("/marketplace");
  }

  function onTouchStart(e) {
    const t = e.touches[0];
    swipe.current = t.clientX < 28 ? { x: t.clientX, y: t.clientY } : null;
  }

  function onTouchEnd(e) {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    if (t.clientX - s.x > 70 && Math.abs(t.clientY - s.y) < 60) back();
  }

  function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    sendText(activeId, draft);
    setDraft("");
  }

  const list = contacts
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .filter((c) => filter === "All" || conversations.find((x) => x.id === c.id)?.unread);

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-white" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 pb-3 pt-[max(env(safe-area-inset-top),12px)]">
        <button type="button" aria-label="Back" onClick={back} className="rounded-full p-2 text-slate-700 active:bg-slate-100">
          <Icon name="arrowLeft" className="h-5 w-5" />
        </button>
        {contact ? (
          <>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${contact.id === SUPPORT ? "bg-[#0284C7] text-white" : "bg-sky-100 text-sky-700"}`}>
              {contact.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{contact.name}</p>
              <p className="text-[11px] text-slate-500">{contact.id === SUPPORT ? "Live agent · Online" : "Seller"}</p>
            </div>
            {contact.id !== SUPPORT && (
              <button type="button" onClick={() => navigate("/orders")} className="text-xs font-semibold text-sky-600">View order</button>
            )}
          </>
        ) : (
          <h1 className="flex-1 text-lg font-bold tracking-tight text-slate-900">Messages</h1>
        )}
      </header>

      {!contact && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-3">
            <div className="relative">
              <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition ${filter === f ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-3 flex-1 overflow-y-auto">
            {list.length === 0 && <li className="p-6 text-center text-xs text-slate-500">No chats match.</li>}
            {list.map((c) => {
              const last = (threads[c.id] ?? []).filter((m) => m.type !== "system").at(-1);
              const unread = conversations.find((x) => x.id === c.id)?.unread;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left active:bg-slate-50"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.id === SUPPORT ? "bg-[#0284C7] text-white" : "bg-sky-100 text-sky-700"}`}>
                      {c.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm ${unread ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>{c.name}</span>
                        <span className="shrink-0 text-[10px] text-slate-400">{last?.time ?? ""}</span>
                      </span>
                      <span className={`mt-0.5 block truncate text-xs ${unread ? "font-medium text-slate-700" : "text-slate-500"}`}>
                        {last?.text ?? "Start a conversation"}
                      </span>
                    </span>
                    {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {contact && (
        <>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 text-sm">
            {messages.map((m) =>
              m.type === "system" ? (
                <div key={m.id} className="flex justify-center">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-500">{m.text}</span>
                </div>
              ) : m.from === "me" ? (
                <div key={m.id} className="ml-auto max-w-[78%]">
                  <div className="rounded-2xl rounded-br-sm bg-[#0284C7] px-3.5 py-2.5 leading-relaxed text-white shadow-sm">{m.text}</div>
                  <span className="mt-1 block text-right text-[10px] text-slate-400">{m.time}</span>
                </div>
              ) : (
                <div key={m.id} className="max-w-[78%]">
                  <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 leading-relaxed text-slate-800 shadow-sm">{m.text}</div>
                  <span className="mt-1 block text-[10px] text-slate-400">{m.time}</span>
                </div>
              )
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white p-3 pb-[max(env(safe-area-inset-bottom),12px)]">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${contact.name}`}
              aria-label="Message"
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0284C7] text-white disabled:opacity-40">
              <Icon name="send" className="h-4 w-4" fill />
            </button>
          </form>
        </>
      )}
    </div>,
    document.body
  );
}
