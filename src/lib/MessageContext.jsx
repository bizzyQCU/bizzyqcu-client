import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { conversations, threads as seedThreads } from "./mockData.js";

export const SUPPORT = "support";
const agentReplies = [
  "Thanks for reaching out. Let me check that for you.",
  "I can help with orders, payments, and delivery questions.",
  "Please share your order number (for example #BZ-2024-0891) so I can look it up.",
];
const timeNow = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const MessageContext = createContext(null);

export function MessageProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list");
  const [activeId, setActiveId] = useState(SUPPORT);
  const [typing, setTyping] = useState(false);
  const [contacts, setContacts] = useState(() => [
    { id: SUPPORT, name: "BizzyQCU Support", initials: "BQ" },
    ...conversations.map((c) => ({ id: c.id, name: c.name, initials: c.initials })),
  ]);
  const [threads, setThreads] = useState(() => ({
    [SUPPORT]: [{ id: 0, from: "agent", text: "Hi! Welcome to BizzyQCU live support. How can we help you today?", time: "Now" }],
    ...seedThreads,
  }));
  const replyIndex = useRef(0);

  const appendTo = useCallback((id, msg) => {
    setThreads((t) => ({ ...t, [id]: [...(t[id] ?? []), msg] }));
  }, []);

  const openChat = useCallback((id) => {
    setActiveId(id);
    setView("chat");
    setOpen(true);
  }, []);

  // Opens the chat on a seller's thread. Reuses an existing conversation when the names match.
  const openSeller = useCallback(
    (seller) => {
      const existing = conversations.find((c) => c.name === seller.name);
      const key = existing ? existing.id : seller.key;
      setContacts((list) => (list.some((c) => c.id === key) ? list : [...list, { id: key, name: seller.name, initials: seller.initials }]));
      setThreads((t) =>
        t[key] ? t : { ...t, [key]: [{ id: Date.now(), type: "system", text: `Chat with ${seller.name} about their products` }] }
      );
      openChat(key);
    },
    [openChat]
  );

  const sendText = useCallback(
    (id, text) => {
      const clean = text.trim();
      if (!clean) return;
      appendTo(id, { id: Date.now(), from: "me", text: clean, time: timeNow() });
      if (id === SUPPORT) {
        setTyping(true);
        setTimeout(() => {
          const reply = agentReplies[replyIndex.current % agentReplies.length];
          replyIndex.current += 1;
          setTyping(false);
          appendTo(SUPPORT, { id: Date.now() + 1, from: "agent", text: reply, time: timeNow() });
        }, 1200);
      }
    },
    [appendTo]
  );

  const value = useMemo(
    () => ({ open, setOpen, view, setView, activeId, setActiveId, contacts, threads, typing, openChat, openSeller, sendText }),
    [open, view, activeId, contacts, threads, typing, openChat, openSeller, sendText]
  );

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessages must be used inside MessageProvider");
  return ctx;
}
