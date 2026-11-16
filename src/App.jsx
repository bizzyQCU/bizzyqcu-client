import AppRoutes from './routes'
import { CartProvider } from './lib/CartContext.jsx'
import { MessageProvider } from './lib/MessageContext.jsx'
import { RatingProvider } from './lib/RatingContext.jsx'
import { ToastProvider } from './components/toast'

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <MessageProvider>
          <RatingProvider>
            <AppRoutes />
          </RatingProvider>
        </MessageProvider>
      </CartProvider>
    </ToastProvider>
  )
}
