export {
  getProducts,
  getProductBySlug,
  getProductById,
  getProductCategories,
  getFeaturedProducts,
} from './get-products'

export {
  getShippingMethods,
  createOrder,
  getOrder,
  getOrderByNumber,
  type CreateOrderResult,
} from './create-order'

export {
  updateOrderStatus,
  cancelOrder,
  refundOrder,
  markOrderShipped,
  getOrders,
  type OrderStatusResult,
} from './order-status'

export {
  getStockLevel,
  checkStockAvailability,
  reduceStock,
  restoreStock,
  adjustStock,
  getLowStockProducts,
  getStockHistory,
  type StockResult,
  type StockCheckResult,
} from './stock'
