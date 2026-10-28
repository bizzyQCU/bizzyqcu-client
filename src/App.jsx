import AppRoutes from './routes'
import { CartProvider } from './lib/CartContext.jsx'
import { MessageProvider } from './lib/MessageContext.jsx'
import { RatingProvider } from './lib/RatingContext.jsx'

export default function App() {
  return (
    <CartProvider>
      <MessageProvider>
        <RatingProvider>
          <AppRoutes />
        </RatingProvider>
      </MessageProvider>
    </CartProvider>
  )
}
