import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { useAuth } from '../context/AuthContext'
import { useCalendar } from '../context/CalendarContext'
import { calendarAPI, apiHelpers } from '../services/calendarApi'
import EventModal from './EventModal'
import EventForm from './EventForm'
import CalendarToolbar from './CalendarToolbar'
import EventList from './EventList'
import YearView from './YearView'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid,
  List,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const views = ['month', 'week', 'day', 'agenda', 'year']

const eventStyleGetter = (event) => {
  const categoryColors = {
    work: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
    personal: { backgroundColor: '#10b981', borderColor: '#059669' },
    health: { backgroundColor: '#f59e0b', borderColor: '#d97706' },
    education: { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' },
    default: { backgroundColor: '#6b7280', borderColor: '#4b5563' }
  }
  
  const colors = categoryColors[event.category] || categoryColors.default
  
  return {
    style: {
      ...colors,
      borderRadius: '4px',
      border: `1px solid ${colors.borderColor}`,
      color: 'white',
      fontSize: '12px',
      padding: '2px 4px'
    }
  }
}

export default function CalendarView() {
  const { user } = useAuth()
  const { sendEventCreated, sendEventUpdated, sendEventDeleted } = useCalendar()
  
  const [events, setEvents] = useState([])
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showSidebar, setShowSidebar] = useState(true)
  const [calendarLayout, setCalendarLayout] = useState('calendar') // 'calendar' or 'list'
  const [connectionStatus, setConnectionStatus] = useState('connected') // 'connected', 'disconnected', 'checking'
  const [error, setError] = useState(null)

  // Initialize API connection and set user context
  useEffect(() => {
    if (user?.id) {
      apiHelpers.setUserId(user.id)
    }
    // Test API connection on component mount
    testApiConnection()
  }, [user])

  // Test API connection
  const testApiConnection = async () => {
    setConnectionStatus('checking')
    try {
      const result = await calendarAPI.testConnection()
      if (result.success) {
        setConnectionStatus('connected')
        setError(null)
      } else {
        setConnectionStatus('disconnected')
        setError(result.message)
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      setError('Unable to connect to calendar service')
      console.error('API connection test failed:', error)
    }
  }

  // Load events from API with error handling
  const loadEvents = useCallback(async (showRefreshIndicator = false) => {
    try {
      setError(null)
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      const eventsData = await calendarAPI.getEvents()
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      setConnectionStatus('connected')
    } catch (error) {
      console.error('Error loading events:', error)
      setError(error.message)
      setConnectionStatus('disconnected')
      toast.error(error.message || 'Failed to load events')
      
      // Set empty array on error to prevent UI crashes
      setEvents([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Listen for WebSocket events to refresh calendar
  useEffect(() => {
    const handleEventCreated = () => {
      console.log('WebSocket: Event created, refreshing calendar')
      loadEvents(true)
    }
    const handleEventUpdated = () => {
      console.log('WebSocket: Event updated, refreshing calendar')
      loadEvents(true)
    }
    const handleEventDeleted = () => {
      console.log('WebSocket: Event deleted, refreshing calendar')
      loadEvents(true)
    }
    const handleCalendarSync = () => {
      console.log('WebSocket: Calendar sync, refreshing calendar')
      loadEvents(true)
    }

    window.addEventListener('event-created', handleEventCreated)
    window.addEventListener('event-updated', handleEventUpdated)
    window.addEventListener('event-deleted', handleEventDeleted)
    window.addEventListener('calendar-sync', handleCalendarSync)

    return () => {
      window.removeEventListener('event-created', handleEventCreated)
      window.removeEventListener('event-updated', handleEventUpdated)
      window.removeEventListener('event-deleted', handleEventDeleted)
      window.removeEventListener('calendar-sync', handleCalendarSync)
    }
  }, [loadEvents])

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  // Handle event selection
  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  // Handle slot selection (creating new event)
  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent({
      start,
      end,
      title: '',
      description: '',
      category: 'work',
      priority: 'medium',
      attendees: [],
      location: '',
      reminders: [{ type: 'popup', minutes: 15 }],
      isAllDay: false,
      isRecurring: false
    })
    setShowEventForm(true)
  }

  // Handle event creation
  const handleCreateEvent = async (eventData) => {
    try {
      setError(null)
      const newEvent = await calendarAPI.createEvent(eventData)
      setEvents(prev => [...prev, newEvent])
      setShowEventForm(false)
      setSelectedEvent(null)
      
      // Send WebSocket notification
      if (sendEventCreated) {
        sendEventCreated(newEvent)
      }
      
      toast.success('Event created successfully!')
    } catch (error) {
      console.error('Error creating event:', error)
      setError(error.message)
      toast.error(error.message || 'Failed to create event')
    }
  }

  // Handle event update
  const handleUpdateEvent = async (eventData) => {
    try {
      setError(null)
      const updatedEvent = await calendarAPI.updateEvent(selectedEvent.id, eventData)
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e))
      setShowEventModal(false)
      setShowEventForm(false)
      setSelectedEvent(null)
      
      // Send WebSocket notification
      if (sendEventUpdated) {
        sendEventUpdated(updatedEvent)
      }
      
      toast.success('Event updated successfully!')
    } catch (error) {
      console.error('Error updating event:', error)
      setError(error.message)
      toast.error(error.message || 'Failed to update event')
    }
  }

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    try {
      setError(null)
      await calendarAPI.deleteEvent(eventId)
      const deletedEvent = events.find(e => e.id === eventId)
      setEvents(prev => prev.filter(e => e.id !== eventId))
      setShowEventModal(false)
      setSelectedEvent(null)
      
      // Send WebSocket notification
      if (sendEventDeleted && deletedEvent) {
        sendEventDeleted(deletedEvent)
      }
      
      toast.success('Event deleted successfully!')
    } catch (error) {
      console.error('Error deleting event:', error)
      setError(error.message)
      toast.error(error.message || 'Failed to delete event')
    }
  }

  // Handle search with API
  const handleSearch = async (query) => {
    try {
      setError(null)
      setSearchQuery(query)
      
      if (query.trim()) {
        setIsRefreshing(true)
        const searchResults = await calendarAPI.searchEvents(query)
        setEvents(searchResults)
      } else {
        loadEvents(true)
      }
    } catch (error) {
      console.error('Error searching events:', error)
      setError(error.message)
      toast.error('Search failed')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle category filter with API
  const handleCategoryFilter = async (category) => {
    try {
      setError(null)
      setFilterCategory(category)
      
      if (category !== 'all') {
        setIsRefreshing(true)
        const categoryEvents = await calendarAPI.getEventsByCategory(category)
        setEvents(categoryEvents)
      } else {
        loadEvents(true)
      }
    } catch (error) {
      console.error('Error filtering by category:', error)
      setError(error.message)
      toast.error('Filter failed')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle date click from year view
  const handleDateClick = (date) => {
    setDate(date)
    setView('day')
  }

  // Handle month click from year view
  const handleMonthClick = (date) => {
    setDate(date)
    setView('month')
  }

  // Handle retry connection
  const handleRetryConnection = () => {
    testApiConnection()
    loadEvents(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your calendar...</p>
          {connectionStatus === 'checking' && (
            <p className="mt-2 text-sm text-gray-500">Connecting to calendar service...</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Connection Status Banner */}
      {connectionStatus === 'disconnected' && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 z-50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center">
              <WifiOff className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Calendar service unavailable. {error && `Error: ${error}`}
              </span>
            </div>
            <button
              onClick={handleRetryConnection}
              className="text-sm bg-red-700 hover:bg-red-800 px-3 py-1 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
              <div className="flex items-center space-x-2">
                {/* Connection Status Indicator */}
                <div className={`flex items-center ${
                  connectionStatus === 'connected' ? 'text-green-600' : 
                  connectionStatus === 'checking' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {connectionStatus === 'connected' ? (
                    <Wifi className="h-4 w-4" />
                  ) : connectionStatus === 'checking' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                </div>
                
                <button
                  onClick={() => loadEvents(true)}
                  disabled={isRefreshing}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setCalendarLayout(calendarLayout === 'calendar' ? 'list' : 'calendar')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {calendarLayout === 'calendar' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedEvent({
                  start: new Date(),
                  end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
                  title: '',
                  description: '',
                  category: 'work',
                  priority: 'medium',
                  attendees: [],
                  location: '',
                  reminders: [{ type: 'popup', minutes: 15 }],
                  isAllDay: false,
                  isRecurring: false
                })
                setShowEventForm(true)
              }}
              disabled={connectionStatus === 'disconnected'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={connectionStatus === 'disconnected'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                disabled={connectionStatus === 'disconnected'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event List */}
          <div className="flex-1 overflow-y-auto">
            <EventList
              events={filteredEvents}
              onEventClick={handleSelectEvent}
              currentDate={date}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${connectionStatus === 'disconnected' ? 'mt-12' : ''}`}>
        {/* Calendar Toolbar */}
        <CalendarToolbar
          view={view}
          date={date}
          onNavigate={setDate}
          onViewChange={setView}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          showSidebar={showSidebar}
          layout={calendarLayout}
          onLayoutChange={setCalendarLayout}
        />

        {/* Calendar Content */}
        <div className="flex-1 p-6">
          {calendarLayout === 'calendar' ? (
            <div className="h-full">
              {view === 'year' ? (
                <YearView
                  date={date}
                  events={filteredEvents}
                  onEventClick={handleSelectEvent}
                  onDateClick={handleDateClick}
                  onMonthClick={handleMonthClick}
                />
              ) : (
                <Calendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  views={views.filter(v => v !== 'year')} // Exclude year from react-big-calendar views
                  view={view}
                  date={date}
                  onNavigate={setDate}
                  onView={setView}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable={connectionStatus === 'connected'}
                  eventPropGetter={eventStyleGetter}
                  style={{ height: '100%' }}
                  components={{
                    event: ({ event }) => (
                      <div className="flex items-center space-x-1 text-xs">
                        <span className="truncate">{event.title}</span>
                        {event.location && <MapPin className="h-3 w-3" />}
                        {event.attendees && event.attendees.length > 0 && <Users className="h-3 w-3" />}
                      </div>
                    )
                  }}
                  messages={{
                    allDay: 'All Day',
                    previous: 'Previous',
                    next: 'Next',
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    agenda: 'Agenda',
                    date: 'Date',
                    time: 'Time',
                    event: 'Event',
                    noEventsInRange: connectionStatus === 'disconnected' ? 
                      'Unable to load events. Please check your connection.' : 
                      'No events in this range.',
                    showMore: total => `+${total} more`
                  }}
                />
              )}
            </div>
          ) : (
            <div className="h-full">
              <EventList
                events={filteredEvents}
                onEventClick={handleSelectEvent}
                currentDate={date}
                detailed={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
          }}
          onEdit={() => {
            setShowEventModal(false)
            setShowEventForm(true)
          }}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
        />
      )}

      {showEventForm && selectedEvent && (
        <EventForm
          event={selectedEvent}
          onClose={() => {
            setShowEventForm(false)
            setSelectedEvent(null)
          }}
          onSave={selectedEvent.id ? handleUpdateEvent : handleCreateEvent}
        />
      )}
    </div>
  )
}