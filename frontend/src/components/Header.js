import API_ENDPOINTS from '../config';
import React, { useState, useEffect, useCallback  } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Home, Building, Users, Building2Icon, CopyMinusIcon, Calculator, KeyRound, MessagesSquareIcon, InfoIcon } from 'lucide-react';
import '../App.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDropdownVisible, setIsNotificationDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Define handleLogout first since it's a dependency for other functions
  const handleLogout = useCallback(() => {
    // First clear the server session
    fetch(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      credentials: 'include'
    })
    .then(() => {
      // Then clear frontend session storage
      sessionStorage.clear();
      
      // Reset state
      setUser(null);
      setUserRole(null);
      setNotifications([]);
      setUnreadCount(0);
      setIsDropdownVisible(false);
      setIsNotificationDropdownVisible(false);
      
      navigate('/');
      
      // After clearing session storage
      window.dispatchEvent(new Event('userSessionChange'));
    })
    .catch(error => {
      console.error('Error during logout:', error);
      // Still clear frontend session even if backend fails
      sessionStorage.clear();
      navigate('/');
    });
  }, [navigate]); // Only depends on navigate from useNavigate


  // fetchNotifications depends on handleLogout
  const fetchNotifications = useCallback(async (userId) => {
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn('Invalid user ID for notifications fetch');
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${userId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(notif => !notif.is_read).length);
      } else if (response.status === 404) {
        setNotifications([]);
        setUnreadCount(0);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [handleLogout]); // Include handleLogout as dependency


  // initializeUserSession depends on fetchNotifications
  const initializeUserSession = useCallback(() => {
    const loggedInUser = sessionStorage.getItem('username');
    const userRole = sessionStorage.getItem('role');
    const userId = sessionStorage.getItem('user_id');

    if (loggedInUser && userRole && userId && userId !== 'undefined' && userId !== 'null') {
      setUser(loggedInUser);
      setUserRole(userRole);
      fetchNotifications(userId);
    }
    setIsLoading(false);
  }, [fetchNotifications]);  // Include fetchNotifications as dependency


  // refreshUserSession depends on both fetchNotifications and handleLogout
  const refreshUserSession = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USER_INFO, {
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.id) {
          sessionStorage.setItem('user_id', userData.id);
          await fetchNotifications(userData.id);
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      handleLogout();
    }
  }, [fetchNotifications, handleLogout]); // Include both dependencies


  useEffect(() => {
    initializeUserSession();
  }, [initializeUserSession]);

  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    if (userId && userId !== 'undefined' && userId !== 'null') {
      fetchNotifications(userId);
    }
  }, [location.pathname, fetchNotifications]);


  // Modified initialization effect
  useEffect(() => {
    const checkSession = async () => {
      const userId = sessionStorage.getItem('user_id');
      const username = sessionStorage.getItem('username');
      const role = sessionStorage.getItem('role');

      if (username && role) {
        setUser(username);
        setUserRole(role);
        
        // Only fetch notifications if we have a valid userId
        if (userId && userId !== 'undefined' && userId !== 'null') {
          await fetchNotifications(userId);
        } else {
          // If userId is invalid but we have username/role, try to refresh session
          await refreshUserSession();
        }
      }
    };

    checkSession();
  }, [location.pathname, fetchNotifications, refreshUserSession]);


  const markAsRead = async (notificationId) => {
    const userId = sessionStorage.getItem('user_id');
    if (!userId || !notificationId) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.MARK_NOTIFICATION_READ}/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ}/${userId}/mark-all-read`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.id) return;

    await markAsRead(notification.id);
    
    if (notification.type === 'new_launch' && notification.property_id) {
      navigate(`/property/${notification.property_id}`);
    }
    setIsNotificationDropdownVisible(false);
  };


  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
    if (isNotificationDropdownVisible) {
      setIsNotificationDropdownVisible(false);
    }
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const renderNotificationDropdown = () => (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read" 
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNotificationClick(notification);
              }}
            >
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
              {!notification.is_read && <div className="unread-indicator" />}
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications</p>
        )}
      </div>
    </div>
  );

  // Render admin-specific navigation
  const renderAdminNav = () => (
    <ul className="nav">
      <li>
        <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard')}`}>
        <Home className="nav-icon" />
          Dashboard
        </Link>
      </li>
      <li>
        <Link to="/admin-PropertyManagement" className={`nav-link ${isActive('/admin/properties')}`}>
        <Building className="nav-icon" />   
          Properties
        </Link>
      </li>
      <li>
        <Link to="/admin/create-user" className={`nav-link ${isActive('/admin/create-user')}`}>
          <Users className="nav-icon" />
          Create New Account
        </Link>
      </li>
      <li>
        <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>
          <MessagesSquareIcon className="nav-icon" />
          Property Assistant
        </Link>
      </li>
      <li>
        <Link to="/search-results" className={`nav-link ${isActive('/search-results')}`}>
          <Building2Icon className="nav-icon" />
          Listings
        </Link>
      </li>
    </ul>
  );

  // Render regular user navigation
  const renderUserNav = () => (
    <ul className="nav">
      <li>
        <Link
          to={userRole === 'REN' ? '/ren-dashboard' : '/'}
          className={`nav-link ${isActive(userRole === 'REN' ? '/ren-dashboard' : '/')}`}
        ><Home className="nav-icon" />
          Home
        </Link>
      </li>
      <li><Link to="/search-results" className={`nav-link ${isActive('/search-results')}`}><Building2Icon className="nav-icon" />Listings</Link></li>
      <li><Link to="/comparison" className={`nav-link ${isActive('/comparison')}`}><CopyMinusIcon className="nav-icon" />Comparison</Link></li>
      <li><Link to="/affordability-calculator" className={`nav-link ${isActive('/affordability-calculator')}`}><Calculator className="nav-icon" />Affordability Calculator</Link></li>
      <li><Link to="/chat" className={`nav-link ${isActive('/chat')}`}><MessagesSquareIcon className="nav-icon" />Property Assistant</Link></li>
      <li><Link to="/about" className={`nav-link ${isActive('/about')}`}><InfoIcon className="nav-icon" />About</Link></li>
      {/* <li><Link to="/about" className={`nav-link ${isActive('/about')}`}>About</Link></li> */}
    </ul>
  );
  
  if (isLoading) {
    return <div className="header loading">Loading...</div>;
  }

  return (
    <header className="header">
      <div className="logo">MYPropertyWise</div>
      <nav>
        {userRole === 'admin' ? renderAdminNav() : renderUserNav()}
      </nav>
      <div className="user-actions">
        {user && (
          <div className="notification-container">
            <button
              className="notification-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsNotificationDropdownVisible(!isNotificationDropdownVisible);
                setIsDropdownVisible(false);
              }}
            >
              <Bell className="bell-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {isNotificationDropdownVisible && renderNotificationDropdown()}
          </div>
        )}
        {user ? (
          <div className="logged-in-user">
            <span className="user-dropdown">
              <button
                className="user-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown();
                }}
              >
                {user} {userRole === 'admin'}
              </button>
              {isDropdownVisible && (
                <div className="dropdown-content">
                  {userRole === 'admin' && (
                    <Link to="/admin-dashboard" onClick={() => setIsDropdownVisible(false)}>Admin Dashboard</Link>
                  )}
                  <Link to="/profile" onClick={() => setIsDropdownVisible(false)}>Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </span>
          </div>
        ) : (
          <>
            <Link to="/login" className="login-register-btn">Login<KeyRound className="key-icon"/></Link>
            <Link to="/register" className="login-register-btn">Register</Link>
          </>
        )}
        {userRole !== 'admin' && (
          <button 
            className="add-listing-btn" 
            onClick={() => user ? navigate('/favourites') : navigate('/login')}
          >
            Favourite
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;