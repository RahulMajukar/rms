// services/calendarApi.js - Updated to use real backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper function for API calls with proper error handling
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // Add user ID header if available from auth context
      'User-ID': localStorage.getItem('userId') || '1',
      // Add authorization token if available
      ...(localStorage.getItem('authToken') && {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }),
      ...options.headers
    }
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    console.log(`Making API call to: ${url}`, { method: config.method || 'GET' });
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If error response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    // Handle empty responses (like DELETE)
    if (response.status === 204) {
      return { success: true };
    }
    
    const data = await response.json();
    console.log(`API call successful for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Format event data for API (convert frontend format to backend format)
const formatEventForAPI = (eventData) => {
  const formatDateTime = (date) => {
    if (!date) return null;
    // Convert to ISO string and remove the 'Z' to match backend LocalDateTime format
    return new Date(date).toISOString().slice(0, 19);
  };

  return {
    title: eventData.title || '',
    description: eventData.description || '',
    start: formatDateTime(eventData.start),
    end: formatDateTime(eventData.end),
    location: eventData.location || '',
    category: (eventData.category || 'work').toUpperCase(), // Convert to backend enum format
    priority: (eventData.priority || 'medium').toUpperCase(), // Convert to backend enum format
    isAllDay: Boolean(eventData.isAllDay),
    isRecurring: Boolean(eventData.isRecurring),
    attendees: Array.isArray(eventData.attendees) ? eventData.attendees.filter(email => email && email.trim()) : [],
    reminders: Array.isArray(eventData.reminders) ? eventData.reminders.map(reminder => ({
      type: (reminder.type || 'popup').toUpperCase(),
      minutes: parseInt(reminder.minutes) || 15
    })) : [{ type: 'POPUP', minutes: 15 }]
  };
};

// Format event data from API (convert backend format to frontend format)
const formatEventFromAPI = (event) => {
  const parseDateTime = (dateString) => {
    if (!dateString) return new Date();
    // Handle both ISO string and LocalDateTime format
    return new Date(dateString);
  };

  return {
    id: event.id,
    title: event.title || '',
    description: event.description || '',
    start: parseDateTime(event.start),
    end: parseDateTime(event.end),
    location: event.location || '',
    category: (event.category || 'WORK').toLowerCase(), // Convert from backend enum to frontend format
    priority: (event.priority || 'MEDIUM').toLowerCase(), // Convert from backend enum to frontend format
    isAllDay: Boolean(event.isAllDay),
    isRecurring: Boolean(event.isRecurring),
    attendees: Array.isArray(event.attendees) ? event.attendees.map(a => a.email || a) : [],
    reminders: Array.isArray(event.reminders) ? event.reminders.map(r => ({
      id: r.id,
      type: (r.type || 'POPUP').toLowerCase(),
      minutes: r.minutes || 15,
      isSent: r.isSent || false
    })) : [],
    createdAt: event.createdAt ? parseDateTime(event.createdAt) : null,
    updatedAt: event.updatedAt ? parseDateTime(event.updatedAt) : null,
    createdBy: event.createdBy
  };
};

export const calendarAPI = {
  // Get all events
  async getEvents() {
    try {
      console.log('API: Getting all events...');
      const events = await apiCall('/events');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting events:', error);
      throw new Error('Failed to fetch events. Please check your connection and try again.');
    }
  },

  // Get events by date range
  async getEventsByDateRange(startDate, endDate) {
    try {
      console.log('API: Getting events by date range...', startDate, endDate);
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      const events = await apiCall(`/events/range?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`);
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting events by date range:', error);
      throw new Error('Failed to fetch events by date range.');
    }
  },

  // Get single event by ID
  async getEventById(eventId) {
    try {
      console.log('API: Getting event by ID:', eventId);
      const event = await apiCall(`/events/${eventId}`);
      return formatEventFromAPI(event);
    } catch (error) {
      console.error('API: Error getting event by ID:', error);
      if (error.message.includes('404')) {
        throw new Error('Event not found.');
      }
      throw new Error('Failed to fetch event details.');
    }
  },

  // Create new event
  async createEvent(eventData) {
    try {
      console.log('API: Creating event...', eventData);
      
      // Validate required fields
      if (!eventData.title || !eventData.title.trim()) {
        throw new Error('Event title is required.');
      }
      if (!eventData.start || !eventData.end) {
        throw new Error('Event start and end times are required.');
      }
      if (new Date(eventData.start) >= new Date(eventData.end)) {
        throw new Error('Event end time must be after start time.');
      }

      const formattedData = formatEventForAPI(eventData);
      const event = await apiCall('/events', {
        method: 'POST',
        body: JSON.stringify(formattedData)
      });
      return formatEventFromAPI(event);
    } catch (error) {
      console.error('API: Error creating event:', error);
      throw new Error(error.message || 'Failed to create event.');
    }
  },

  // Update existing event
  async updateEvent(eventId, eventData) {
    try {
      console.log('API: Updating event...', eventId, eventData);
      
      // Validate required fields
      if (!eventData.title || !eventData.title.trim()) {
        throw new Error('Event title is required.');
      }
      if (!eventData.start || !eventData.end) {
        throw new Error('Event start and end times are required.');
      }
      if (new Date(eventData.start) >= new Date(eventData.end)) {
        throw new Error('Event end time must be after start time.');
      }

      const formattedData = formatEventForAPI(eventData);
      const event = await apiCall(`/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(formattedData)
      });
      return formatEventFromAPI(event);
    } catch (error) {
      console.error('API: Error updating event:', error);
      if (error.message.includes('404')) {
        throw new Error('Event not found.');
      }
      throw new Error(error.message || 'Failed to update event.');
    }
  },

  // Delete event
  async deleteEvent(eventId) {
    try {
      console.log('API: Deleting event...', eventId);
      await apiCall(`/events/${eventId}`, {
        method: 'DELETE'
      });
      return { success: true };
    } catch (error) {
      console.error('API: Error deleting event:', error);
      if (error.message.includes('404')) {
        throw new Error('Event not found.');
      }
      throw new Error('Failed to delete event.');
    }
  },

  // Search events
  async searchEvents(query) {
    try {
      console.log('API: Searching events...', query);
      if (!query || !query.trim()) {
        return [];
      }
      const events = await apiCall(`/events/search?q=${encodeURIComponent(query.trim())}`);
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error searching events:', error);
      throw new Error('Failed to search events.');
    }
  },

  // Get events by category
  async getEventsByCategory(category) {
    try {
      console.log('API: Getting events by category...', category);
      const apiCategory = category.toUpperCase();
      const events = await apiCall(`/events/category/${apiCategory}`);
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting events by category:', error);
      throw new Error('Failed to fetch events by category.');
    }
  },

  // Get upcoming events (next 7 days)
  async getUpcomingEvents() {
    try {
      console.log('API: Getting upcoming events...');
      const events = await apiCall('/events/upcoming');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting upcoming events:', error);
      throw new Error('Failed to fetch upcoming events.');
    }
  },

  // Get today's events
  async getTodayEvents() {
    try {
      console.log('API: Getting today\'s events...');
      const events = await apiCall('/events/today');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting today\'s events:', error);
      throw new Error('Failed to fetch today\'s events.');
    }
  },

  // Get events statistics
  async getEventStats() {
    try {
      console.log('API: Getting event statistics...');
      const stats = await apiCall('/events/stats');
      return {
        total: stats.total || 0,
        byCategory: {
          work: stats.workEvents || 0,
          personal: stats.personalEvents || 0,
          health: stats.healthEvents || 0,
          education: stats.educationEvents || 0
        },
        byPriority: {
          high: 0, // Add these to backend if needed
          medium: 0,
          low: 0
        },
        upcoming: stats.upcomingEvents || 0,
        today: stats.todayEvents || 0
      };
    } catch (error) {
      console.error('API: Error getting event stats:', error);
      return {
        total: 0,
        byCategory: { work: 0, personal: 0, health: 0, education: 0 },
        byPriority: { high: 0, medium: 0, low: 0 },
        upcoming: 0,
        today: 0
      };
    }
  },

  // Utility method to test API connection
  async testConnection() {
    try {
      console.log('API: Testing connection...');
      await apiCall('/events/stats');
      return { success: true, message: 'API connection successful' };
    } catch (error) {
      console.error('API: Connection test failed:', error);
      return { success: false, message: error.message };
    }
  }
};

// Export helper functions for advanced usage
export const apiHelpers = {
  // Manual API call for custom endpoints
  makeApiCall: apiCall,
  
  // Format helpers
  formatEventForAPI,
  formatEventFromAPI,
  
  // Get API base URL
  getApiBaseUrl: () => API_BASE_URL,
  
  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  },
  
  // Set user ID
  setUserId: (userId) => {
    if (userId) {
      localStorage.setItem('userId', userId.toString());
    } else {
      localStorage.removeItem('userId');
    }
  }
};

export default calendarAPI;