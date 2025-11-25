export {
  getCalendarData,
  getStaffForCalendar,
  getServicesForCalendar,
  createAdminAppointment,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
  markNoShow,
  searchCustomers,
  createWalkInCustomer,
  type GetCalendarDataParams,
  type CalendarData,
  type CreateAdminAppointmentInput,
  type UpdateAppointmentInput,
  type AppointmentActionResult,
} from './calendar'

export {
  getStaffMembers,
  getStaffMember,
  createStaffMember,
  updateStaffMember,
  updateStaffWorkingHours,
  updateStaffSkills,
  deactivateStaffMember,
  reactivateStaffMember,
  assignRole,
  removeRole,
  exportCustomerData,
  deleteCustomerData,
  recordConsent,
  getCustomerConsents,
  type StaffMember,
  type WorkingHoursEntry,
  type CreateStaffInput,
  type UpdateStaffInput,
  type StaffResult,
} from './staff'

export {
  getAnalyticsData,
  exportAnalyticsCSV,
  type AnalyticsPeriod,
  type KPIStats,
  type RevenueByService,
  type RevenueByStaff,
  type DailyRevenue,
  type TopProduct,
  type AnalyticsData,
  type AnalyticsInsight,
} from './analytics'

export {
  getDashboardData,
  type DashboardData,
} from './dashboard'
