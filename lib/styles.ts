// Centralized gradient and style constants for the vibrant design system

// Theme gradients for different contexts
export const GRADIENT = {
  // Workout theme (teal-green-blue)
  workout: {
    header: "bg-gradient-to-br from-teal-500 via-green-500 to-blue-500",
    button: "bg-gradient-to-r from-teal-600 via-green-600 to-blue-600",
    buttonHover: "hover:from-teal-700 hover:via-green-700 hover:to-blue-700",
  },
  // Goal theme (purple-pink-orange)
  goal: {
    header: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
    button: "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600",
    buttonHover: "hover:from-purple-700 hover:via-pink-700 hover:to-orange-700",
  },
  // Demo/accent theme
  demo: {
    button: "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500",
    buttonHover: "hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600",
  },
  // Decorative overlay
  overlay: "absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none",
  // Page backgrounds
  page: "bg-gradient-to-br from-teal-50 via-green-50 to-blue-50",
} as const

// Alert styling
export const ALERT = {
  error: "p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg shadow-sm",
  success: "p-3 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-lg shadow-sm",
} as const

// Common button styles
export const BUTTON_COMMON = "shadow-lg hover:shadow-xl transition-all duration-200"

// Icon containers
export const ICON_CONTAINER = {
  small: "w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 shadow-lg",
  large: "w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg",
} as const

// Modal styling
export const MODAL = {
  overlay: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50",
  content: "bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto",
} as const
