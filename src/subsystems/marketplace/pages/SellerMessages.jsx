import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth.jsx'
import { ORDER_STATUS } from '../../../lib/constants.js'
import './SellerMessages.css'

const ACTIVE_ORDER_STATUSES = new Set([
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PENDING_CONFIRMATION,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
])

// Demonstration data only. The backend has no seller inbox or messaging API yet.
const initialConversations = [
  { id: 'maria', name: 'Maria Santos', initials: 'MS', unread: true, orderStatus: ORDER_STATUS.PREPARING, time: '10:32 AM', orderId: 'BZ-2024-0891', product: 'Data Structures & Algorithms + Official QCU PE Shirt', subtotal: 630, deliveryFee: 20, delivery: 'Room delivery', location: 'Tech Bldg 402 · Confirm with buyer', items: [{ name: 'Data Structures & Algorithms', detail: 'Sample item · Qty 1', price: 450, quantity: 1 }, { name: 'Official QCU PE Shirt', detail: 'Sample item · Qty 1', price: 180, quantity: 1 }], last: 'Could you bring it to Tech Bldg Room 402 around 11?', messages: [{ from: 'buyer', text: 'Hi! I placed an order for the Data Structures book and PE shirt. Could we meet at Tech Bldg Room 402 around 11 AM?', time: '10:20 AM' }, { from: 'seller', text: 'That works. I’ll bring both items over.', time: '10:25 AM', read: true }, { from: 'buyer', text: 'Could you bring it to Tech Bldg Room 402 around 11?', time: '10:32 AM' }] },
  { id: 'kevin', name: 'Kevin Cruz', initials: 'KC', unread: false, orderStatus: ORDER_STATUS.READY_FOR_PICKUP, time: 'Yesterday', orderId: 'BZ-2024-0740', product: 'Scientific Calculator', subtotal: 420, deliveryFee: 0, delivery: 'Campus pickup', location: 'Library Plaza · Confirm pickup details', items: [{ name: 'Scientific Calculator', detail: 'Sample item · Qty 1', price: 420, quantity: 1 }], last: 'Is the calculator still available for pickup?', messages: [{ from: 'buyer', text: 'Is the calculator still available for pickup?', time: 'Yesterday' }, { from: 'seller', text: 'Yes, it is ready. Let’s confirm a pickup time.', time: 'Yesterday', read: true }] },
  { id: 'alyssa', name: 'Alyssa Bautista', initials: 'AB', unread: false, orderStatus: ORDER_STATUS.COMPLETED, time: 'Oct 20', orderId: 'BZ-2024-0612', product: 'Campus Notes Bundle', subtotal: 250, deliveryFee: 0, delivery: 'Campus pickup', location: 'QCU Main Gate · Sample details', items: [{ name: 'Campus Notes Bundle', detail: 'Sample item · Qty 1', price: 250, quantity: 1 }], last: 'Thanks, I received the notes!', messages: [{ from: 'buyer', text: 'Thanks, I received the notes!', time: 'Oct 20' }, { from: 'seller', text: 'Glad they reached you. Thank you!', time: 'Oct 20', read: true }] },
]

function statusLabel(status) {
  return status?.toLowerCase().split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ') || 'Status unavailable'
}

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></>,
    compose: <><path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"/><path d="m15 19 5-5 2 2-5 5-3 1z"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    order: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></>,
    clip: <path d="m21 11.5-8.5 8.5a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8-8"/>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    back: <><path d="m15 18-6-6 6-6"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Avatar({ person, small = false }) {
  return <span className={`sm-avatar ${small ? 'sm-avatar-small' : ''}`} aria-label={person.name}>{person.initials}</span>
}

function money(value) { return `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` }

export default function SellerMessages() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState('maria')
  const [filter, setFilter] = useState('All Messages')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [mobileChat, setMobileChat] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const endRef = useRef(null)
  const active = conversations.find((conversation) => conversation.id === activeId)
  const visible = useMemo(() => conversations.filter((conversation) => {
    const textMatch = `${conversation.name} ${conversation.product} ${conversation.last} ${conversation.orderId}`.toLowerCase().includes(query.toLowerCase())
    const filterMatch = filter === 'Unread' ? conversation.unread : filter === 'Active Orders' ? ACTIVE_ORDER_STATUSES.has(conversation.orderStatus) : true
    return textMatch && filterMatch
  }), [conversations, filter, query])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [activeId, active?.messages.length])

  function chooseConversation(id) {
    setActiveId(id); setMobileChat(true); setOrderOpen(false)
    setConversations((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item))
  }

  function sendMessage(event) {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || !active) return
    const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date())
    setConversations((items) => items.map((item) => item.id === activeId ? { ...item, last: text, time, messages: [...item.messages, { from: 'seller', text, time }] } : item))
    setDraft('')
  }

  return <main className="seller-messages">
    <div className={`sm-dashboard ${mobileChat ? 'mobile-chat-open' : ''}`}>
      <aside className="sm-panel sm-conversation-panel" aria-label="Conversations">
        <div className="sm-inbox-label">SELLER INBOX{user?.firstName ? ` · ${user.firstName}` : ''} <span>DEMO DATA</span></div>
        <div className="sm-convo-heading"><h1>Messages</h1><span className="sm-unread-count">{conversations.filter((item) => item.unread).length} unread</span><button type="button" className="sm-compose-button" aria-label="Compose new message" onClick={() => setComposeOpen(true)}><Icon name="compose"/></button></div>
        <label className="sm-search"><Icon name="search" size={16}/><input aria-label="Search conversations" placeholder="Search buyers or orders..." value={query} onChange={(event) => setQuery(event.target.value)}/></label>
        <div className="sm-filters" role="group" aria-label="Filter conversations">{['All Messages', 'Unread', 'Active Orders'].map((label) => <button key={label} type="button" className={filter === label ? 'selected' : ''} onClick={() => setFilter(label)}>{label}</button>)}</div>
        <div className="sm-convo-list">{visible.length ? visible.map((conversation) => <button key={conversation.id} type="button" className={`sm-conversation ${activeId === conversation.id ? 'active' : ''}`} onClick={() => chooseConversation(conversation.id)}>
          <Avatar person={conversation}/><span className="sm-convo-copy"><span className="sm-convo-name">{conversation.name}</span><span className="sm-convo-preview">{conversation.last}</span>{conversation.orderId && <span className="sm-order-id">#{conversation.orderId} · {statusLabel(conversation.orderStatus)}</span>}</span><span className="sm-convo-meta"><time>{conversation.time}</time>{conversation.unread && <i className="sm-dot"/>}</span>
        </button>) : <div className="sm-empty">No conversations match your search.</div>}</div>
      </aside>

      <section className="sm-panel sm-chat-panel" aria-label="Conversation with seller">
        {active ? <>
          <header className="sm-chat-header"><button className="sm-back mobile-only" type="button" aria-label="Back to conversations" onClick={() => setMobileChat(false)}><Icon name="back"/></button><Avatar person={active}/><div className="sm-contact"><strong>{active.name}<span className="sm-buyer-badge">Buyer · demo</span></strong><span>Buyer conversation · sample data</span></div>{active.orderId && <button type="button" className="sm-view-order" onClick={() => navigate(`/orders/${active.orderId}`)}>View order <span>→</span></button>}<button type="button" className="sm-order-mobile mobile-only" onClick={() => setOrderOpen(true)} aria-label="Open order details"><Icon name="order"/></button></header>
          {active.orderId ? <div className="sm-order-banner"><span className="sm-order-icon"><Icon name="order" size={18}/></span><span className="sm-order-summary"><strong>Order #{active.orderId} <span className="sm-status-badge">{statusLabel(active.orderStatus)}</span></strong><small>{active.product}</small></span><span className="sm-banner-total"><small>Total · sample</small><strong>{money(active.subtotal + active.deliveryFee)}</strong></span></div> : <div className="sm-order-banner">Product inquiry · no order linked</div>}
          <div className="sm-message-list" aria-live="polite">{active.messages.map((message, index) => <div key={`${message.time}-${index}`} className={`sm-message-row ${message.from === 'seller' ? 'outgoing' : ''}`}>{message.from !== 'seller' && <Avatar person={active} small/>}<div className="sm-message-content"><div className="sm-bubble">{message.text}</div><div className="sm-message-time">{message.time}</div></div></div>)}<div ref={endRef}/></div>
          <form className="sm-composer" onSubmit={sendMessage}><textarea aria-label="Type a message" placeholder="Reply to buyer..." value={draft} rows={1} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) sendMessage(event) }}/><button type="submit" className="sm-send" disabled={!draft.trim()} aria-label="Send message"><Icon name="send" size={19}/></button></form>
        </> : <div className="sm-no-order">Select a conversation to get started.</div>}
      </section>

      <aside className={`sm-panel sm-order-panel ${orderOpen ? 'order-mobile-open' : ''}`} aria-label="Order details">
        {active?.orderId ? <><div className="sm-order-panel-heading"><div><small>ORDER DETAILS · DEMO</small><strong>#{active.orderId}</strong></div><span className="sm-status-badge">{statusLabel(active.orderStatus)}</span><button type="button" className="sm-close-order mobile-only" aria-label="Close order details" onClick={() => setOrderOpen(false)}><Icon name="close"/></button></div>
          <div className="sm-divider"/><div className="sm-section-label">Buyer Information · Sample</div><div className="sm-seller"><Avatar person={active}/><div><strong>{active.name}</strong><small>Buyer · sample profile</small></div></div>
          <div className="sm-divider"/><div className="sm-items-title">Items ({active.items.length})</div><div className="sm-items">{active.items.map((item) => <div className="sm-item" key={item.name}><span><strong>{item.name}</strong><small>{item.detail}</small></span><b>{money(item.price * (item.quantity || 1))}</b></div>)}</div>
          <div className="sm-divider"/><div className="sm-price-row"><span>Item subtotal · sample</span><span>{money(active.subtotal)}</span></div><div className="sm-price-row"><span>Delivery fee · sample</span><span>{money(active.deliveryFee)}</span></div><div className="sm-total-row"><strong>Total · sample</strong><strong>{money(active.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) + active.deliveryFee)}</strong></div>
          <div className="sm-divider"/><div className="sm-delivery"><span className="sm-location-pin"><Icon name="order" size={16}/></span><div><strong>{active.delivery} · sample</strong><small>{active.location}</small></div></div><div className="sm-handover">Sample fulfillment details only. Confirm the actual pickup or delivery arrangement with the buyer.</div>
          <button className="sm-open-order" type="button" onClick={() => navigate(`/orders/${active.orderId}`)}><Icon name="order" size={15}/> View full order</button>
        </> : <div className="sm-no-order">No order is linked to this conversation.</div>}
      </aside>
    </div>
    <footer className="sm-footer">Seller inbox demo. Messages are not sent or saved.</footer>
    {composeOpen && <div className="sm-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setComposeOpen(false) }}><section className="sm-compose-modal" role="dialog" aria-modal="true" aria-labelledby="compose-title"><div className="sm-modal-heading"><h2 id="compose-title">Open buyer conversation</h2><button type="button" aria-label="Close" onClick={() => setComposeOpen(false)}><Icon name="close"/></button></div><label htmlFor="compose-to">Sample buyers</label><select id="compose-to" value={composeTo} onChange={(event) => setComposeTo(event.target.value)}><option value="">Select a buyer</option>{conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.name}</option>)}</select><p>Starting conversations with new buyers requires a messaging service.</p><button className="sm-modal-primary" disabled={!composeTo} onClick={() => { chooseConversation(composeTo); setComposeOpen(false); setComposeTo('') }}>Open conversation</button></section></div>}
  </main>
}
