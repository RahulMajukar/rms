// services/calendarApi.js - Mock implementation with sample data

// Mock data for development
const mockEvents = [
  {
    id: 1,
    title: 'Team Meeting',
    description: 'Weekly team sync meeting',
    start: new Date(2024, 11, 20, 10, 0), // December 20, 2024, 10:00 AM
    end: new Date(2024, 11, 20, 11, 0),
    location: 'Conference Room A',
    category: 'work',
    priority: 'high',
    attendees: ['john@company.com', 'jane@company.com'],
    reminders: [{ type: 'popup', minutes: 15 }]
  },
  {
    id: 2,
    title: 'Doctor Appointment',
    description: 'Annual health checkup',
    start: new Date(2024, 11, 22, 14, 30), // December 22, 2024, 2:30 PM
    end: new Date(2024, 11, 22, 15, 30),
    location: 'City Medical Center',
    category: 'health',
    priority: 'medium',
    attendees: [],
    reminders: [{ type: 'popup', minutes: 30 }]
  },
  {
    id: 3,
    title: 'Birthday Party',
    description: "Sarah's birthday celebration",
    start: new Date(2024, 11, 25, 18, 0), // December 25, 2024, 6:00 PM
    end: new Date(2024, 11, 25, 22, 0),
    location: 'Home',
    category: 'personal',
    priority: 'low',
    attendees: ['sarah@email.com', 'mike@email.com'],
    reminders: [{ type: 'popup', minutes: 60 }]
  },
  {
    id: 4,
    title: 'Project Deadline',
    description: 'Complete Q4 project deliverables',
    start: new Date(2024, 11, 31, 9, 0), // December 31, 2024, 9:00 AM
    end: new Date(2024, 11, 31, 17, 0),
    location: 'Office',
    category: 'work',
    priority: 'high',
    attendees: ['team@company.com'],
    reminders: [{ type: 'popup', minutes: 1440 }] // 1 day before
  },
  {
    id: 5,
    title: 'Online Course',
    description: 'React Advanced Concepts',
    start: new Date(2024, 11, 18, 19, 0), // December 18, 2024, 7:00 PM
    end: new Date(2024, 11, 18, 21, 0),
    location: 'Online',
    category: 'education',
    priority: 'medium',
    attendees: [],
    reminders: [{ type: 'popup', minutes: 15 }]
  }
];

// Helper function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate unique IDs
let nextId = 6;
const generateId = () => nextId++;

// Format event data consistently
const formatEvent = (event) => ({
  id: event.id,
  title: event.title || '',
  description: event.description || '',
  start: new Date(event.start),
  end: new Date(event.end),
  location: event.location || '',
  category: event.category || 'work',
  priority: event.priority || 'medium',
  isAllDay: event.isAllDay || false,
  isRecurring: event.isRecurring || false,
  attendees: event.attendees || [],
  reminders: event.reminders || [{ type: 'popup', minutes: 15 }]
});

// Mock API implementation
export const calendarAPI = {
  // Get all events
  async getEvents() {
    try {
      console.log('Mock API: Getting all events...');
      await delay(500); // Simulate network delay
      return mockEvents.map(formatEvent);
    } catch (error) {
      console.error('Mock API: Error getting events:', error);
      return [];
    }
  },

  // Get events by date range
  async getEventsByDateRange(startDate, endDate) {
    try {
      console.log('Mock API: Getting events by date range...', startDate, endDate);
      await delay(300);
      
      const filteredEvents = mockEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= startDate && eventDate <= endDate;
      });
      
      return filteredEvents.map(formatEvent);
    } catch (error) {
      console.error('Mock API: Error getting events by date range:', error);
      return [];
    }
  },

  // Get single event by ID
  async getEventById(eventId) {
    try {
      console.log('Mock API: Getting event by ID:', eventId);
      await delay(200);
      
      const event = mockEvents.find(e => e.id === parseInt(eventId));
      if (!event) {
        throw new Error('Event not found');
      }
      
      return formatEvent(event);
    } catch (error) {
      console.error('Mock API: Error getting event by ID:', error);
      throw error;
    }
  },

  // Create new event
  async createEvent(eventData) {
    try {
      console.log('Mock API: Creating event...', eventData);
      await delay(800); // Longer delay to simulate creation
      
      const newEvent = {
        id: generateId(),
        title: eventData.title,
        description: eventData.description,
        start: new Date(eventData.start),
        end: new Date(eventData.end),
        location: eventData.location,
        category: eventData.category,
        priority: eventData.priority,
        isAllDay: eventData.isAllDay,
        isRecurring: eventData.isRecurring,
        attendees: eventData.attendees,
        reminders: eventData.reminders,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockEvents.push(newEvent);
      return formatEvent(newEvent);
    } catch (error) {
      console.error('Mock API: Error creating event:', error);
      throw error;
    }
  },

  // Update existing event
  async updateEvent(eventId, eventData) {
    try {
      console.log('Mock API: Updating event...', eventId, eventData);
      await delay(600);
      
      const eventIndex = mockEvents.findIndex(e => e.id === parseInt(eventId));
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      
      const updatedEvent = {
        ...mockEvents[eventIndex],
        title: eventData.title,
        description: eventData.description,
        start: new Date(eventData.start),
        end: new Date(eventData.end),
        location: eventData.location,
        category: eventData.category,
        priority: eventData.priority,
        isAllDay: eventData.isAllDay,
        isRecurring: eventData.isRecurring,
        attendees: eventData.attendees,
        reminders: eventData.reminders,
        updatedAt: new Date()
      };
      
      mockEvents[eventIndex] = updatedEvent;
      return formatEvent(updatedEvent);
    } catch (error) {
      console.error('Mock API: Error updating event:', error);
      throw error;
    }
  },

  // Delete event
  async deleteEvent(eventId) {
    try {
      console.log('Mock API: Deleting event...', eventId);
      await delay(400);
      
      const eventIndex = mockEvents.findIndex(e => e.id === parseInt(eventId));
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      
      mockEvents.splice(eventIndex, 1);
      return { success: true };
    } catch (error) {
      console.error('Mock API: Error deleting event:', error);
      throw error;
    }
  },

  // Search events
  async searchEvents(query) {
    try {
      console.log('Mock API: Searching events...', query);
      await delay(300);
      
      const lowerQuery = query.toLowerCase();
      const filteredEvents = mockEvents.filter(event => 
        event.title.toLowerCase().includes(lowerQuery) ||
        (event.description && event.description.toLowerCase().includes(lowerQuery)) ||
        (event.location && event.location.toLowerCase().includes(lowerQuery))
      );
      
      return filteredEvents.map(formatEvent);
    } catch (error) {
      console.error('Mock API: Error searching events:', error);
      return [];
    }
  },

  // Get events by category
  async getEventsByCategory(category) {
    try {
      console.log('Mock API: Getting events by category...', category);
      await delay(250);
      
      const filteredEvents = mockEvents.filter(event => 
        event.category === category
      );
      
      return filteredEvents.map(formatEvent);
    } catch (error) {
      console.error('Mock API: Error getting events by category:', error);
      return [];
    }
  },

  // Get upcoming events (next 7 days)
  async getUpcomingEvents() {
    try {
      console.log('Mock API: Getting upcoming events...');
      await delay(300);
      
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      
      const upcomingEvents = mockEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= now && eventDate <= nextWeek;
      });
      
      // Sort by start date
      upcomingEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
      
      return upcomingEvents.map(formatEvent);
    } catch (error) {
      console.error('Mock API: Error getting upcoming events:', error);
      return [];
    }
  },

  // Get today's events
  async getTodayEvents() {
    try {
      console.log('Mock API: Getting today\'s events...');
      await delay(200);
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const todayEvents = mockEvents.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= startOfDay && eventDate <= endOfDay;
      });
      
      // Sort by start time
      todayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
      
      return todayEvents.map(formatEvent);
    } catch (error) {
      console.error('Mock API: Error getting today\'s events:', error);
      return [];
    }
  },

  // Get events statistics
  async getEventStats() {
    try {
      console.log('Mock API: Getting event statistics...');
      await delay(200);
      
      const stats = {
        total: mockEvents.length,
        byCategory: {
          work: mockEvents.filter(e => e.category === 'work').length,
          personal: mockEvents.filter(e => e.category === 'personal').length,
          health: mockEvents.filter(e => e.category === 'health').length,
          education: mockEvents.filter(e => e.category === 'education').length
        },
        byPriority: {
          high: mockEvents.filter(e => e.priority === 'high').length,
          medium: mockEvents.filter(e => e.priority === 'medium').length,
          low: mockEvents.filter(e => e.priority === 'low').length
        },
        upcoming: await this.getUpcomingEvents().then(events => events.length),
        today: await this.getTodayEvents().then(events => events.length)
      };
      
      return stats;
    } catch (error) {
      console.error('Mock API: Error getting event stats:', error);
      return {
        total: 0,
        byCategory: { work: 0, personal: 0, health: 0, education: 0 },
        byPriority: { high: 0, medium: 0, low: 0 },
        upcoming: 0,
        today: 0
      };
    }
  }
};

// Export helper functions for testing
export const mockHelpers = {
  // Add multiple events at once
  addMockEvents: (events) => {
    events.forEach(event => {
      mockEvents.push({
        ...event,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  },
  
  // Clear all events
  clearAllEvents: () => {
    mockEvents.length = 0;
  },
  
  // Reset to default events
  resetToDefaults: () => {
    mockEvents.length = 0;
    mockEvents.push(...[
      {
        id: 1,
        title: 'Team Meeting',
        description: 'Weekly team sync meeting',
        start: new Date(2024, 11, 20, 10, 0),
        end: new Date(2024, 11, 20, 11, 0),
        location: 'Conference Room A',
        category: 'work',
        priority: 'high',
        attendees: ['john@company.com', 'jane@company.com'],
        reminders: [{ type: 'popup', minutes: 15 }]
      }
      // Add other default events...
    ]);
    nextId = 6;
  },
  
  // Get current mock data
  getCurrentEvents: () => [...mockEvents]
};

export default calendarAPI;