// Updated calendarApi.js with user-specific features
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper function to get user info from localStorage
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Helper function for API calls with user context
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const user = getUserFromStorage();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // Add user context headers
      ...(user?.id && { 'User-ID': user.id.toString() }),
      ...(user?.email && { 'User-Email': user.email }),
      // Add authorization token if available
      ...(localStorage.getItem('authToken') && {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }),
      ...options.headers
    }
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    console.log(`Making API call to: ${url}`, { 
      method: config.method || 'GET', 
      userEmail: user?.email,
      userId: user?.id 
    });
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
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

// Format event data for API
const formatEventForAPI = (eventData) => {
  const formatDateTime = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().slice(0, 19);
  };

  return {
    title: eventData.title || '',
    description: eventData.description || '',
    start: formatDateTime(eventData.start),
    end: formatDateTime(eventData.end),
    location: eventData.location || '',
    category: (eventData.category || 'work').toUpperCase(),
    priority: (eventData.priority || 'medium').toUpperCase(),
    isAllDay: Boolean(eventData.isAllDay),
    isRecurring: Boolean(eventData.isRecurring),
    attendees: Array.isArray(eventData.attendees) ? eventData.attendees.filter(email => email && email.trim()) : [],
    reminders: Array.isArray(eventData.reminders) ? eventData.reminders.map(reminder => ({
      type: (reminder.type || 'popup').toUpperCase(),
      minutes: parseInt(reminder.minutes) || 15
    })) : [{ type: 'POPUP', minutes: 15 }]
  };
};

// Format event data from API with user-specific styling
const formatEventFromAPI = (event) => {
  const parseDateTime = (dateString) => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  // Determine event styling based on user relationship
  const getEventStyle = (userRelationship) => {
    switch (userRelationship) {
      case 'owner':
        return {
          borderColor: '#1d4ed8', // Blue-700
          backgroundColor: '#3b82f6', // Blue-500
          className: 'event-owned'
        };
      case 'attendee':
        return {
          borderColor: '#059669', // Green-600  
          backgroundColor: '#10b981', // Green-500
          className: 'event-attending'
        };
      default:
        return {
          borderColor: '#6b7280', // Gray-500
          backgroundColor: '#9ca3af', // Gray-400
          className: 'event-other'
        };
    }
  };

  const userRelationship = event.userRelationship || 'none';
  const eventStyle = getEventStyle(userRelationship);

  return {
    id: event.id,
    title: event.title || '',
    description: event.description || '',
    start: parseDateTime(event.start),
    end: parseDateTime(event.end),
    location: event.location || '',
    category: (event.category || 'WORK').toLowerCase(),
    priority: (event.priority || 'MEDIUM').toLowerCase(),
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
    createdBy: event.createdBy,
    // User relationship properties
    isOwner: Boolean(event.isOwner),
    isAttendee: Boolean(event.isAttendee),
    userRelationship: userRelationship,
    // Styling properties for calendar display
    eventStyle: eventStyle,
    resource: {
      userRelationship: userRelationship,
      isOwner: Boolean(event.isOwner),
      isAttendee: Boolean(event.isAttendee)
    }
  };
};

export const calendarAPI = {
  // Get current user info
  getCurrentUser() {
    return getUserFromStorage();
  },

  // Get all events (admin view)
  async getAllEvents() {
    try {
      console.log('API: Getting all events...');
      const events = await apiCall('/events');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting events:', error);
      throw new Error('Failed to fetch events. Please check your connection and try again.');
    }
  },

  // Get user-specific events (owned + attending)
  async getUserEvents() {
    try {
      console.log('API: Getting user events...');
      const events = await apiCall('/events/user');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting user events:', error);
      throw new Error('Failed to fetch your events. Please check your connection and try again.');
    }
  },

  // Get events created by user
  async getEventsCreatedByUser() {
    try {
      console.log('API: Getting events created by user...');
      const events = await apiCall('/events/user/created');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting events created by user:', error);
      throw new Error('Failed to fetch events you created.');
    }
  },

  // Get events user is attending
  async getEventsUserAttending() {
    try {
      console.log('API: Getting events user is attending...');
      const events = await apiCall('/events/user/attending');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting events user is attending:', error);
      throw new Error('Failed to fetch events you are attending.');
    }
  },

  // Get events by date range for user
  async getUserEventsByDateRange(startDate, endDate) {
    try {
      console.log('API: Getting user events by date range...', startDate, endDate);
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      const events = await apiCall(`/events/user/range?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`);
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting user events by date range:', error);
      throw new Error('Failed to fetch events by date range.');
    }
  },

  // Get single event by ID with user context
  async getEventById(eventId) {
    try {
      console.log('API: Getting event by ID with user context:', eventId);
      const event = await apiCall(`/events/${eventId}/user`);
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
      } else if (error.message.includes('403') || error.message.includes('permission')) {
        throw new Error('You do not have permission to update this event.');
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
      } else if (error.message.includes('403') || error.message.includes('permission')) {
        throw new Error('Only the event creator can delete this event.');
      }
      throw new Error('Failed to delete event.');
    }
  },

  // Search user events
  async searchUserEvents(query) {
    try {
      console.log('API: Searching user events...', query);
      if (!query || !query.trim()) {
        return [];
      }
      const events = await apiCall(`/events/user/search?q=${encodeURIComponent(query.trim())}`);
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error searching user events:', error);
      throw new Error('Failed to search events.');
    }
  },

  // Get events by category for user
  async getUserEventsByCategory(category) {
    try {
      console.log('API: Getting user events by category...', category);
      const apiCategory = category.toUpperCase();
      const events = await apiCall(`/events/user/category/${apiCategory}`);
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting user events by category:', error);
      throw new Error('Failed to fetch events by category.');
    }
  },

  // Get upcoming events for user
  async getUserUpcomingEvents() {
    try {
      console.log('API: Getting user upcoming events...');
      const events = await apiCall('/events/user/upcoming');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting user upcoming events:', error);
      throw new Error('Failed to fetch upcoming events.');
    }
  },

  // Get today's events for user
  async getUserTodayEvents() {
    try {
      console.log('API: Getting user today\'s events...');
      const events = await apiCall('/events/user/today');
      return Array.isArray(events) ? events.map(formatEventFromAPI) : [];
    } catch (error) {
      console.error('API: Error getting user today\'s events:', error);
      throw new Error('Failed to fetch today\'s events.');
    }
  },

  // Get user-specific event statistics
  async getUserEventStats() {
    try {
      console.log('API: Getting user event statistics...');
      const stats = await apiCall('/events/user/stats');
      return {
        total: stats.total || 0,
        byCategory: {
          work: stats.workEvents || 0,
          personal: stats.personalEvents || 0,
          health: stats.healthEvents || 0,
          education: stats.educationEvents || 0
        },
        byOwnership: {
          owned: stats.createdEvents || 0,
          attending: stats.attendingEvents || 0
        },
        upcoming: stats.upcomingEvents || 0,
        today: stats.todayEvents || 0
      };
    } catch (error) {
      console.error('API: Error getting user event stats:', error);
      return {
        total: 0,
        byCategory: { work: 0, personal: 0, health: 0, education: 0 },
        byOwnership: { owned: 0, attending: 0 },
        upcoming: 0,
        today: 0
      };
    }
  },

  // Legacy methods for backward compatibility
  async getEvents() {
    return this.getUserEvents();
  },

  async searchEvents(query) {
    return this.searchUserEvents(query);
  },

  async getEventsByCategory(category) {
    return this.getUserEventsByCategory(category);
  },

  async getUpcomingEvents() {
    return this.getUserUpcomingEvents();
  },

  async getTodayEvents() {
    return this.getUserTodayEvents();
  },

  async getEventStats() {
    return this.getUserEventStats();
  },

  // Utility method to test API connection
  async testConnection() {
    try {
      console.log('API: Testing connection...');
      await apiCall('/events/user/stats');
      return { success: true, message: 'API connection successful' };
    } catch (error) {
      console.error('API: Connection test failed:', error);
      return { success: false, message: error.message };
    }
  }
};

// Export helper functions
export const apiHelpers = {
  makeApiCall: apiCall,
  formatEventForAPI,
  formatEventFromAPI,
  getApiBaseUrl: () => API_BASE_URL,
  getCurrentUser: getUserFromStorage,
  
  // Event styling helpers
  getEventStyleClass: (userRelationship) => {
    switch (userRelationship) {
      case 'owner': return 'event-owned';
      case 'attendee': return 'event-attending';
      default: return 'event-other';
    }
  },
  
  getEventColors: (userRelationship) => {
    switch (userRelationship) {
      case 'owner':
        return { backgroundColor: '#3b82f6', borderColor: '#1d4ed8' };
      case 'attendee':
        return { backgroundColor: '#10b981', borderColor: '#059669' };
      default:
        return { backgroundColor: '#9ca3af', borderColor: '#6b7280' };
    }
  }
};

export default calendarAPI;