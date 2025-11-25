export { getCustomerAppointments, type CustomerAppointment } from './get-customer-appointments'
export { cancelAppointment, type CancelResult } from './cancel-appointment'
export { getCustomerProfile, type CustomerProfile } from './get-customer-profile'
export { getCustomerOrders } from './get-customer-orders'
export {
  exportMyData,
  deleteMyAccount,
  getMyConsents,
  updateMyConsent,
  type ConsentCategory,
  type CustomerConsent,
  type ExportedCustomerData,
} from './gdpr'
export {
  getMyLoyaltyAccount,
  getMyLoyaltyTransactions,
  enrollInLoyaltyProgram,
  awardLoyaltyPoints,
  redeemLoyaltyPoints,
  getCustomerLoyaltyAccount,
  type LoyaltyAccountSummary,
  type LoyaltyTransaction,
} from './loyalty'
