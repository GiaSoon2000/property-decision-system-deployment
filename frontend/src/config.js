// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://property-backend-p69z.onrender.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  LOGOUT: `${API_BASE_URL}/logout`,
  USER_INFO: `${API_BASE_URL}/user-info`,
  
  // Property endpoints
  PROPERTIES: `${API_BASE_URL}/properties`,
  SEARCH: `${API_BASE_URL}/search`,
  PROPERTY_DETAIL: `${API_BASE_URL}/api/properties`,
  AREAS: `${API_BASE_URL}/areas`,
  BEDROOMS: `${API_BASE_URL}/bedrooms`,
  BATHROOMS: `${API_BASE_URL}/bathrooms`,
  
  // Admin endpoints
  ADMIN_APPROVED_PROPERTIES: `${API_BASE_URL}/admin/approved-properties`,
  ADMIN_PENDING_PROPERTIES: `${API_BASE_URL}/admin/pending-properties`,
  ADMIN_REJECTED_PROPERTIES: `${API_BASE_URL}/admin/rejected-properties`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_RENS: `${API_BASE_URL}/admin/rens`,
  ADMIN_CREATE_PROPERTY: `${API_BASE_URL}/admin/create-property`,
  ADMIN_PROPERTY_EDIT: `${API_BASE_URL}/admin/property`,
  ADMIN_PROPERTY_DELETE: `${API_BASE_URL}/admin/property`,
  ADMIN_PROPERTY_APPROVE: `${API_BASE_URL}/admin/property`,
  ADMIN_PROPERTY_REJECT: `${API_BASE_URL}/admin/property`,
  ADMIN_PROPERTY_IMAGES: `${API_BASE_URL}/admin/property`,
  ADMIN_CREATE_USER: `${API_BASE_URL}/admin/create-user`,
  ADMIN_BAN_USER: `${API_BASE_URL}/admin/user`,
  ADMIN_VERIFY_REN: `${API_BASE_URL}/admin/ren`,
  
  // REN endpoints
  REN_PROPERTIES: `${API_BASE_URL}/ren/properties`,
  
  // User endpoints
  USER_PROFILE: `${API_BASE_URL}/user-profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/update-profile`,
  
  // Favorites endpoints
  FAVORITES: `${API_BASE_URL}/favorites`,
  
  // Notifications endpoints
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  MARK_NOTIFICATION_READ: `${API_BASE_URL}/notifications`,
  MARK_ALL_NOTIFICATIONS_READ: `${API_BASE_URL}/notifications`,
  
  // Property submission
  SUBMIT_PROPERTY: `${API_BASE_URL}/submit-new-property`,
  
  // AI endpoints
  CHAT: `${API_BASE_URL}/api/chat`,
  COMPARE_PROPERTIES: `${API_BASE_URL}/api/compare-properties`,
  
  // Recommended properties
  RECOMMENDED_PROPERTIES: `${API_BASE_URL}/recommended-properties`,
  
  // Static files
  STATIC_IMAGES: `${API_BASE_URL}/static/images/property_images`,
};

export default API_ENDPOINTS; 