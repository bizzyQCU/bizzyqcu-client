import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { SUPPORT, useMessages } from "../lib/MessageContext.jsx";

const quickReplies = ["Track my order", "Payment problem", "Delivery question"];

export default function MessageWidget() {
  const { open, setOpen, view, setView, activeId, contacts, threads, typing, openChat, sendText } = useMessages();
  const [minimized, setMinimized] = useState(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef(null);

  function close() {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 180);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) close();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, closing]);


  const isSupport = activeId === SUPPORT;
  const activeContact = contacts.find((c) => c.id === activeId);
  const activeMessages = threads[activeId] ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, typing, view, activeId, open, minimized]);

  useEffect(() => {
    if (open && view === "chat" && !minimized) inputRef.current?.focus();
  }, [open, view, activeId, minimized]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-8 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-sky-500/80 px-4 py-2.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-sky-600"
      >
        <Icon name="chat" className="h-4 w-4" />
        <span>Messages</span>
        <span className="h-2 w-2 rounded-full bg-amber-300" />
      </button>
    );
  }

  const listItems = contacts.map((c) => {
    const msgs = threads[c.id] ?? [];
    const last = msgs.filter((m) => m.type !== "system").at(-1);
    return { ...c, preview: last?.text ?? "Start a conversation", time: last?.time ?? "" };
  });

  return (
    <div
      role="dialog"
      aria-label="Messages"
      ref={panelRef}
      className={`fixed bottom-6 right-8 z-50 flex w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${minimized ? "h-auto" : "h-[580px] max-h-[calc(100vh-3rem)]"} ${closing ? "anim-out" : "anim-in"}`}
    >
      <div className="flex items-center justify-between gap-2 bg-[#0284C7] px-4 py-3 text-white">
        {view === "chat" && !minimized ? (
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" aria-label="Back to conversations" onClick={() => setView("list")} className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10">
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0284C7]">
              {activeContact?.initials}
              {isSupport && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0284C7]" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{activeContact?.name}</span>
              <span className="block text-[11px] text-sky-100">{isSupport ? "Live agent · Online" : "Seller"}</span>
            </span>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#0284C7]">
              <Icon name="chat" className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold">Messages</span>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" aria-label={minimized ? "Expand" : "Minimize"} onClick={() => setMinimized((m) => !m)} className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10">
            <span className="block h-0.5 w-3.5 rounded bg-white" />
          </button>
          <button type="button" aria-label="Close" onClick={() => close()} className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && view === "list" && (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {listItems.map((c) => (
              <button key={c.id} type="button" onClick={() => openChat(c.id)} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-sky-50/60">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.id === SUPPORT ? "bg-[#0284C7] text-white" : "bg-sky-100 text-sky-700"}`}>
                  {c.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-800">{c.name}</span>
                    <span className="shrink-0 text-[10px] text-slate-400">{c.time}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{c.preview}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {!minimized && view === "chat" && (
        <>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 text-xs">
            {activeMessages.map((m) =>
              m.type === "system" ? (
                <div key={m.id} className="flex justify-center">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-500">{m.text}</span>
                </div>
              ) : m.from === "me" ? (
                <div key={m.id} className="ml-auto max-w-[80%]">
                  <div className="rounded-2xl rounded-br-sm bg-[#0284C7] px-3.5 py-2.5 leading-relaxed text-white shadow-sm">{m.text}</div>
                  <span className="mt-1 block text-right text-[10px] text-slate-400">{m.time}</span>
                </div>
              ) : (
                <div key={m.id} className="flex max-w-[85%] items-end gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">{activeContact?.initials}</span>
                  <div>
                    <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 leading-relaxed text-slate-800 shadow-sm">{m.text}</div>
                    <span className="ml-1 mt-1 block text-[10px] text-slate-400">{m.time}</span>
                  </div>
                </div>
              )
            )}
            {typing && isSupport && (
              <div className="flex items-end gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0284C7] text-[10px] font-bold text-white">BQ</span>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {isSupport && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-white px-3 pt-3">
              {quickReplies.map((q) => (
                <button key={q} type="button" onClick={() => sendText(activeId, q)} className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 transition hover:bg-sky-100">
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendText(activeId, draft);
              setDraft("");
            }}
            className="flex items-center gap-2 bg-white p-3"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isSupport ? "Type your message..." : `Message ${activeContact?.name ?? "seller"}...`}
              aria-label="Message"
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0284C7] text-white shadow-sm transition hover:bg-[#0369A1] disabled:cursor-not-allowed disabled:opacity-40">
              <Icon name="send" className="h-4 w-4" fill />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
