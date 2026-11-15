import useIsMobile from "../../../../hooks/useIsMobile.js";
import MB_MessagesPage from "../MobileUI/MB_MessagesPage.jsx";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../../../components/Icon.jsx";
import { SUPPORT, useMessages } from "../../../../lib/MessageContext.jsx";

function MessagesDesktop() {
  const { contacts, threads, sendText } = useMessages();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(() => contacts[0]?.id ?? SUPPORT);
  const [draft, setDraft] = useState("");

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return contacts.filter((c) => {
      const last = (threads[c.id] ?? []).filter((m) => m.type !== "system").at(-1)?.text ?? "";
      return `${c.name} ${last}`.toLowerCase().includes(q);
    });
  }, [contacts, threads, query]);

  const active = contacts.find((c) => c.id === activeId) ?? contacts[0];
  const messages = active ? threads[active.id] ?? [] : [];

  function send(e) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    sendText(active.id, draft);
    setDraft("");
  }

  return (
    <div className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm md:flex-row">
      {/* Conversation list */}
      <section className="flex w-full flex-shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:w-[320px] lg:w-[330px]">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Messages</h1>
          <Link to="/marketplace" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
            Browse stores
          </Link>
        </div>

        <div className="px-3 pb-2 pt-3">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 pl-9 pr-3 text-xs placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        <div className="mx-3 my-1.5 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/70 dark:bg-sky-950/40 p-2.5">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <div className="text-[11px] leading-tight text-slate-600 dark:text-slate-300">
            <strong className="font-semibold text-slate-800 dark:text-slate-100">Campus Safe Exchange:</strong> Designated meetup benches: Tech Lobby &amp; Library Plaza.
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-2 py-1">
          {list.length === 0 && <p className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">No chats match.</p>}
          {list.map((c) => {
            const isActive = c.id === active?.id;
            const last = (threads[c.id] ?? []).filter((m) => m.type !== "system").at(-1);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  isActive ? "border-sky-200/80 bg-sky-50/60 dark:bg-sky-950/40" : "border-transparent hover:border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isActive ? "bg-sky-600 text-white shadow-sm" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between">
                      <h2 className={`truncate text-xs font-bold ${isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-800 dark:text-slate-100"}`}>
                        {c.name}
                      </h2>
                      <span className={`text-[10px] font-medium ${isActive ? "text-sky-600" : "text-slate-400 dark:text-slate-500"}`}>
                        {last?.time ?? ""}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{last?.text ?? "Start a conversation"}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Thread */}
      <section className="flex min-w-0 flex-1 flex-col bg-slate-50/40 dark:bg-slate-950">
        {active ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white shadow-sm">
                  {active.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100">{active.name}</span>
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                      {active.id === SUPPORT ? "Support" : "Seller"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {active.id === SUPPORT ? "BizzyQCU help desk" : "Campus store chat"}
                  </p>
                </div>
              </div>
              <Link to="/orders" className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
                My orders
                <Icon name="chevronDown" className="h-3.5 w-3.5 -rotate-90" />
              </Link>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
              {messages.map((m) =>
                m.type === "system" ? (
                  <div key={m.id} className="flex justify-center">
                    <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {m.text}
                    </span>
                  </div>
                ) : m.from === "me" ? (
                  <div key={m.id} className="ml-auto flex max-w-[80%] items-end justify-end gap-2">
                    <div className="flex flex-col items-end">
                      <div className="rounded-2xl rounded-br-sm bg-sky-600 p-3.5 leading-relaxed text-white shadow-sm">
                        {m.text}
                      </div>
                      <span className="mr-1 mt-1 text-[10px] text-slate-400 dark:text-slate-500">{m.time}</span>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex max-w-[80%] items-end gap-2">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
                      {active.initials}
                    </div>
                    <div>
                      <div className="rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 leading-relaxed text-slate-800 dark:text-slate-100 shadow-sm">
                        {m.text}
                      </div>
                      <span className="ml-1 mt-1 block text-[10px] text-slate-400 dark:text-slate-500">{m.time}</span>
                    </div>
                  </div>
                )
              )}
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <input
                id="chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${active.name}...`}
                className="flex-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                type="submit"
                aria-label="Send Message"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm transition-transform hover:bg-sky-700 active:scale-95"
              >
                <Icon name="send" className="h-4 w-4" fill />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-xs text-slate-500 dark:text-slate-400">
            Select a conversation or message a seller from any store page.
          </div>
        )}
      </section>
    </div>
  );
}

export default function MessagesPage() {
  return useIsMobile() ? <MB_MessagesPage /> : <MessagesDesktop />;
}
