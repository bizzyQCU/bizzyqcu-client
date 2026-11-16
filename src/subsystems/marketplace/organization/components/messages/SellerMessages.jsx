import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../../hooks/useAuth.jsx'
import { ORDER_STATUS } from '../../../../../lib/constants.js'
import {
  getSellerOrders,
  getOrderMessages,
  createOrderMessage,
  getErrorMessage,
} from '../../../api'
import './SellerMessages.css'

const ACTIVE_ORDER_STATUSES = new Set([
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PENDING_CONFIRMATION,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
])

function statusLabel(status) {
  return (
    status
      ?.toLowerCase()
      .split('_')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ') || 'Status unavailable'
  )
}

function initialsFromName(name) {
  const parts = String(name || 'CU')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'CU'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatMessageTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatShortDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function mapOrderToConversation(order) {
  const buyerName = order.buyer?.fullName || 'QCU Buyer'
  const msgCount = order._count?.messages ?? 0
  const itemSummary =
    order.items?.map((i) => i.productNameSnapshot).join(' + ') || 'Store Order'

  return {
    id: order.id,
    realOrderId: order.id,
    orderId: order.orderNumber,
    name: buyerName,
    initials: initialsFromName(buyerName),
    unread: false,
    orderStatus: order.orderStatus,
    time: formatShortDate(order.updatedAt || order.createdAt),
    product: itemSummary,
    subtotal: Number(order.totalAmount || 0),
    deliveryFee: 0,
    delivery:
      order.deliveryMethod === 'ROOM_TO_ROOM'
        ? 'Room-to-room Delivery'
        : 'Campus Pickup',
    location:
      order.deliveryMethod === 'ROOM_TO_ROOM'
        ? [order.campusBuilding, order.campusRoomNumber]
            .filter(Boolean)
            .join(' · ') || 'Campus Building & Room'
        : order.pickupInstructions || 'Campus Store Pickup',
    items: (order.items || []).map((item) => ({
      name: item.productNameSnapshot,
      detail: `Qty ${item.quantity} · ₱${Number(item.unitPriceSnapshot || 0).toFixed(2)}`,
      price: Number(item.unitPriceSnapshot || 0),
      quantity: item.quantity || 1,
    })),
    last:
      msgCount > 0
        ? `${msgCount} message${msgCount === 1 ? '' : 's'} on this order`
        : `${order.items?.length || 0} item(s) · ${statusLabel(order.orderStatus)}`,
    messages: [],
    messagesLoaded: false,
  }
}

function Icon({ name, size = 18 }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    order: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h4" />
      </>
    ),
    back: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12M6 6l12 12" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Avatar({ person, small = false }) {
  return (
    <span
      className={`sm-avatar ${small ? 'sm-avatar-small' : ''}`}
      aria-label={person.name}
    >
      {person.initials}
    </span>
  )
}

function money(value) {
  return `₱${Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
  })}`
}

export default function SellerMessages() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [filter, setFilter] = useState('All Messages')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [mobileChat, setMobileChat] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const endRef = useRef(null)

  const loadConversations = useCallback(async () => {
    setLoadingOrders(true)
    setError(null)
    try {
      const res = await getSellerOrders()
      const rawOrders = Array.isArray(res?.data) ? res.data : []
      const mapped = rawOrders.map(mapOrderToConversation)
      setConversations(mapped)
      setActiveId((prev) =>
        prev && mapped.some((c) => c.id === prev) ? prev : mapped[0]?.id ?? null,
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const active = conversations.find((c) => c.id === activeId) || null

  const loadThread = useCallback(
    async (orderId) => {
      if (!orderId) return
      setLoadingThread(true)
      setError(null)
      try {
        const res = await getOrderMessages(orderId)
        const rawMessages = Array.isArray(res?.data) ? res.data : []
        const formatted = rawMessages.map((msg) => ({
          id: msg.id,
          from:
            (user?.id && msg.senderId === user.id) ||
            msg.sender?.role === 'SELLER'
              ? 'seller'
              : 'buyer',
          text: msg.message,
          time: formatMessageTime(msg.createdAt),
        }))

        setConversations((items) =>
          items.map((item) => {
            if (item.id !== orderId) return item
            const lastMsg = formatted[formatted.length - 1]
            return {
              ...item,
              messages: formatted,
              messagesLoaded: true,
              last: lastMsg ? lastMsg.text : item.last,
              time: lastMsg?.time || item.time,
            }
          }),
        )
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoadingThread(false)
      }
    },
    [user?.id],
  )

  useEffect(() => {
    if (activeId) {
      loadThread(activeId)
    }
  }, [activeId, loadThread])

  const visible = useMemo(
    () =>
      conversations.filter((conversation) => {
        const textMatch = `${conversation.name} ${conversation.product} ${conversation.last} ${conversation.orderId}`
          .toLowerCase()
          .includes(query.toLowerCase())
        const filterMatch =
          filter === 'Unread'
            ? conversation.unread
            : filter === 'Active Orders'
              ? ACTIVE_ORDER_STATUSES.has(conversation.orderStatus)
              : true
        return textMatch && filterMatch
      }),
    [conversations, filter, query],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [activeId, active?.messages?.length])

  function chooseConversation(id) {
    setActiveId(id)
    setMobileChat(true)
    setOrderOpen(false)
    setConversations((items) =>
      items.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    )
  }

  async function sendMessage(event) {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || !active || sending) return

    setSending(true)
    setError(null)
    try {
      const res = await createOrderMessage(active.realOrderId, text)
      const created = res?.data || res
      const time = formatMessageTime(created?.createdAt || new Date())
      const msgObj = {
        id: created?.id || `${Date.now()}`,
        from: 'seller',
        text: created?.message || text,
        time,
      }

      setConversations((items) =>
        items.map((item) =>
          item.id === active.id
            ? {
                ...item,
                last: msgObj.text,
                time: msgObj.time || item.time,
                messages: [...item.messages, msgObj],
                messagesLoaded: true,
              }
            : item,
        ),
      )
      setDraft('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="seller-messages">
      <div className={`sm-dashboard ${mobileChat ? 'mobile-chat-open' : ''}`}>
        <aside
          className="sm-panel sm-conversation-panel"
          aria-label="Conversations"
        >
          <div className="sm-convo-heading">
            <h1>Order Messages</h1>
            <span className="sm-unread-count">{conversations.length} orders</span>
          </div>
          <label className="sm-search">
            <Icon name="search" size={16} />
            <input
              aria-label="Search conversations"
              placeholder="Search buyers or orders..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div
            className="sm-filters"
            role="group"
            aria-label="Filter conversations"
          >
            {['All Messages', 'Active Orders'].map((label) => (
              <button
                key={label}
                type="button"
                className={filter === label ? 'selected' : ''}
                onClick={() => setFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="sm-convo-list">
            {loadingOrders ? (
              <div className="sm-empty">Loading order conversations…</div>
            ) : visible.length ? (
              visible.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`sm-conversation ${
                    activeId === conversation.id ? 'active' : ''
                  }`}
                  onClick={() => chooseConversation(conversation.id)}
                >
                  <Avatar person={conversation} />
                  <span className="sm-convo-copy">
                    <span className="sm-convo-name">{conversation.name}</span>
                    <span className="sm-convo-preview">
                      {conversation.last}
                    </span>
                    {conversation.orderId && (
                      <span className="sm-order-id">
                        #{conversation.orderId} ·{' '}
                        {statusLabel(conversation.orderStatus)}
                      </span>
                    )}
                  </span>
                  <span className="sm-convo-meta">
                    <time>{conversation.time}</time>
                    {conversation.unread && <i className="sm-dot" />}
                  </span>
                </button>
              ))
            ) : (
              <div className="sm-empty">
                {conversations.length === 0
                  ? 'No store orders yet. Buyer order threads will appear here.'
                  : 'No conversations match your search.'}
              </div>
            )}
          </div>
        </aside>

        <section
          className="sm-panel sm-chat-panel"
          aria-label="Conversation with buyer"
        >
          {active ? (
            <>
              <header className="sm-chat-header">
                <button
                  className="sm-back mobile-only"
                  type="button"
                  aria-label="Back to conversations"
                  onClick={() => setMobileChat(false)}
                >
                  <Icon name="back" />
                </button>
                <Avatar person={active} />
                <div className="sm-contact">
                  <strong>
                    {active.name}
                    <span className="sm-student-badge">Buyer</span>
                  </strong>
                  <span>Order #{active.orderId} communication thread</span>
                </div>
                {active.orderId && (
                  <button
                    type="button"
                    className="sm-view-order"
                    onClick={() => navigate('/seller/org/orders')}
                  >
                    View orders <span>→</span>
                  </button>
                )}
                <button
                  type="button"
                  className="sm-order-mobile mobile-only"
                  onClick={() => setOrderOpen(true)}
                  aria-label="Open order details"
                >
                  <Icon name="order" />
                </button>
              </header>

              <div className="sm-order-banner">
                <span className="sm-order-icon">
                  <Icon name="order" size={18} />
                </span>
                <span className="sm-order-summary">
                  <strong>
                    Order #{active.orderId}{' '}
                    <span className="sm-status-badge">
                      {statusLabel(active.orderStatus)}
                    </span>
                  </strong>
                  <small>{active.product}</small>
                </span>
                <span className="sm-banner-total">
                  <small>Total</small>
                  <strong>{money(active.subtotal + active.deliveryFee)}</strong>
                </span>
              </div>

              {error && (
                <div className="mx-3 mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="sm-message-list" aria-live="polite">
                {loadingThread && !active.messagesLoaded ? (
                  <div className="sm-empty">Loading messages…</div>
                ) : active.messages.length === 0 ? (
                  <div className="sm-empty">
                    No messages on this order yet. Send a message below to
                    coordinate pickup or delivery.
                  </div>
                ) : (
                  active.messages.map((message, index) => (
                    <div
                      key={message.id || `${message.time}-${index}`}
                      className={`sm-message-row ${
                        message.from === 'seller' ? 'outgoing' : ''
                      }`}
                    >
                      {message.from !== 'seller' && (
                        <Avatar person={active} small />
                      )}
                      <div className="sm-message-content">
                        <div className="sm-bubble">{message.text}</div>
                        <div className="sm-message-time">{message.time}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              <form className="sm-composer" onSubmit={sendMessage}>
                <textarea
                  aria-label="Type a message"
                  placeholder="Reply to buyer..."
                  value={draft}
                  rows={1}
                  disabled={sending}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      sendMessage(event)
                    }
                  }}
                />
                <button
                  type="submit"
                  className="sm-send"
                  disabled={!draft.trim() || sending}
                  aria-label="Send message"
                >
                  <Icon name="send" size={19} />
                </button>
              </form>
            </>
          ) : (
            <div className="sm-no-order">
              {loadingOrders
                ? 'Loading store order conversations…'
                : error
                  ? error
                  : 'Select an order conversation to get started.'}
            </div>
          )}
        </section>

        <aside
          className={`sm-panel sm-order-panel ${
            orderOpen ? 'order-mobile-open' : ''
          }`}
          aria-label="Order details"
        >
          {active?.orderId ? (
            <>
              <div className="sm-order-panel-heading">
                <div>
                  <small>ORDER DETAILS</small>
                  <strong>#{active.orderId}</strong>
                </div>
                <span className="sm-status-badge">
                  {statusLabel(active.orderStatus)}
                </span>
                <button
                  type="button"
                  className="sm-close-order mobile-only"
                  aria-label="Close order details"
                  onClick={() => setOrderOpen(false)}
                >
                  <Icon name="close" />
                </button>
              </div>
              <div className="sm-divider" />
              <div className="sm-section-label">Buyer Information</div>
              <div className="sm-seller">
                <Avatar person={active} />
                <div>
                  <strong>{active.name}</strong>
                  <small>Order customer</small>
                </div>
              </div>
              <div className="sm-divider" />
              <div className="sm-items-title">
                Items ({active.items.length})
              </div>
              <div className="sm-items">
                {active.items.map((item, idx) => (
                  <div className="sm-item" key={`${item.name}-${idx}`}>
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.detail}</small>
                    </span>
                    <b>{money(item.price * (item.quantity || 1))}</b>
                  </div>
                ))}
              </div>
              <div className="sm-divider" />
              <div className="sm-price-row">
                <span>Order total</span>
                <span>{money(active.subtotal)}</span>
              </div>
              <div className="sm-total-row">
                <strong>Total</strong>
                <strong>{money(active.subtotal + active.deliveryFee)}</strong>
              </div>
              <div className="sm-divider" />
              <div className="sm-delivery">
                <span className="sm-location-pin">
                  <Icon name="order" size={16} />
                </span>
                <div>
                  <strong>{active.delivery}</strong>
                  <small>{active.location}</small>
                </div>
              </div>
              <button
                className="sm-open-order"
                type="button"
                onClick={() => navigate('/seller/org/orders')}
              >
                <Icon name="order" size={15} /> Manage in Orders
              </button>
            </>
          ) : (
            <div className="sm-no-order">
              Select an order to view fulfillment details.
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
