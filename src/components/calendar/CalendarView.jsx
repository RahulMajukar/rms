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
  CalendarDays,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  User,
  Crown,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const views = ['month', 'week', 'day', 'agenda', 'year']

// Updated event style getter with user-specific colors
const eventStyleGetter = (event) => {
  const userRelationship = event.userRelationship || event.resource?.userRelationship || 'none'
  
  const relationshipColors = {
    owner: { 
      backgroundColor: '#2563eb', // Blue-600 (darker for better contrast)
      borderColor: '#1d4ed8',     // Blue-700
      color: 'white'
    },
    attendee: { 
      backgroundColor: '#059669', // Green-600 
      borderColor: '#047857',     // Green-700
      color: 'white'
    },
    none: { 
      backgroundColor: '#6b7280', // Gray-500
      borderColor: '#4b5563',     // Gray-600
      color: 'white'
    }
  }
  
  const colors = relationshipColors[userRelationship] || relationshipColors.none
  
  return {
    style: {
      ...colors,
      borderRadius: '6px',
      border: `2px solid ${colors.borderColor}`,
      fontSize: '12px',
      padding: '2px 6px',
      fontWeight: userRelationship === 'owner' ? '600' : '500'
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
  const [eventFilter, setEventFilter] = useState('all') // 'all', 'owned', 'attending'
  const [showSidebar, setShowSidebar] = useState(true)
  const [calendarLayout, setCalendarLayout] = useState('calendar')
  const [connectionStatus, setConnectionStatus] = useState('connected')
  const [error, setError] = useState(null)
  const [userStats, setUserStats] = useState(null)

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    eventType: true,
    category: true,
    legend: false
  })

  // Get current user from localStorage or auth context
  const currentUser = user || calendarAPI.getCurrentUser()

  // Toggle section expansion
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  // Initialize API connection
  useEffect(() => {
    testApiConnection()
  }, [])

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

  // Load events with user-specific filtering
  const loadEvents = useCallback(async (showRefreshIndicator = false) => {
    try {
      setError(null)
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      let eventsData = []
      
      // Load events based on filter
      switch (eventFilter) {
        case 'owned':
          eventsData = await calendarAPI.getEventsCreatedByUser()
          break
        case 'attending':
          eventsData = await calendarAPI.getEventsUserAttending()
          break
        default:
          eventsData = await calendarAPI.getUserEvents()
      }
      
      setEvents(Array.isArray(eventsData) ? eventsData : [])
      setConnectionStatus('connected')
      
      // Load user statistics
      const stats = await calendarAPI.getUserEventStats()
      setUserStats(stats)
      
    } catch (error) {
      console.error('Error loading events:', error)
      setError(error.message)
      setConnectionStatus('disconnected')
      toast.error(error.message || 'Failed to load events')
      setEvents([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [eventFilter])

  // Initial load
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Listen for WebSocket events
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

    window.addEventListener('event-created', handleEventCreated)
    window.addEventListener('event-updated', handleEventUpdated)
    window.addEventListener('event-deleted', handleEventDeleted)

    return () => {
      window.removeEventListener('event-created', handleEventCreated)
      window.removeEventListener('event-updated', handleEventUpdated)
      window.removeEventListener('event-deleted', handleEventDeleted)
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
      
      if (sendEventCreated) {
        sendEventCreated(newEvent)
      }
      
      toast.success('Event created successfully!')
      loadEvents(true) // Refresh to get updated stats
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
      
      if (sendEventUpdated) {
        sendEventUpdated(updatedEvent)
      }
      
      toast.success('Event updated successfully!')
      loadEvents(true) // Refresh to get updated stats
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
      
      if (sendEventDeleted && deletedEvent) {
        sendEventDeleted(deletedEvent)
      }
      
      toast.success('Event deleted successfully!')
      loadEvents(true) // Refresh to get updated stats
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
        const searchResults = await calendarAPI.searchUserEvents(query)
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

  // Handle category filter
  const handleCategoryFilter = async (category) => {
    try {
      setError(null)
      setFilterCategory(category)
      
      if (category !== 'all') {
        setIsRefreshing(true)
        const categoryEvents = await calendarAPI.getUserEventsByCategory(category)
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

  // Handle event filter change (owned/attending/all)
  const handleEventFilterChange = (filter) => {
    setEventFilter(filter)
    setSearchQuery('')
    setFilterCategory('all')
  }

  // Handle date/month click from year view
  const handleDateClick = (date) => {
    setDate(date)
    setView('day')
  }

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
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AGI Calendar</h2>
                {currentUser && (
                  <p className="text-sm text-gray-600 mt-1">
                    {currentUser.name || currentUser.email}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
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
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedEvent({
                  start: new Date(),
                  end: new Date(Date.now() + 60 * 60 * 1000),
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

          {/* Collapsible Event Type Filter */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('eventType')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Event Type</span>
                {userStats && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {userStats.total}
                  </span>
                )}
              </div>
              {expandedSections.eventType ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            {expandedSections.eventType && (
              <div className="px-6 pb-4 space-y-2">
                <button
                  onClick={() => handleEventFilterChange('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                    eventFilter === 'all' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="h-4 w-4 mr-2" />
                  All My Events
                  {userStats && (
                    <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {userStats.total}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => handleEventFilterChange('owned')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                    eventFilter === 'owned' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Created by Me
                  {userStats && (
                    <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {userStats.byOwnership?.owned || 0}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => handleEventFilterChange('attending')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                    eventFilter === 'attending' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Attending
                  {userStats && (
                    <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      {userStats.byOwnership?.attending || 0}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
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
          </div>

          {/* Collapsible Category Filter */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('category')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Category</span>
                {filterCategory !== 'all' && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs capitalize">
                    {filterCategory}
                  </span>
                )}
              </div>
              {expandedSections.category ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            {expandedSections.category && (
              <div className="px-6 pb-4">
                <div className="space-y-2">
                  {['all', 'work', 'personal', 'health', 'education'].map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryFilter(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${
                        filterCategory === category
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      disabled={connectionStatus === 'disconnected'}
                    >
                      <span className="mr-2">
                        {category === 'all' ? '📋' : 
                         category === 'work' ? '💼' :
                         category === 'personal' ? '👤' :
                         category === 'health' ? '🏥' : '📚'}
                      </span>
                      <span className="capitalize">
                        {category === 'all' ? 'All Categories' : category}
                      </span>
                      {userStats && category !== 'all' && (
                        <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {userStats.byCategory?.[category] || 0}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-6 border-b border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Legend */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => toggleSection('legend')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                {expandedSections.legend ? (
                  <Eye className="h-4 w-4 mr-2 text-gray-500" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-2 text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-700">Event Colors</span>
              </div>
              {expandedSections.legend ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            {expandedSections.legend && (
              <div className="px-6 pb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                      <Crown className="h-3 w-3 mr-1 text-blue-600" />
                      <span className="text-gray-600">Created by you</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                      <UserCheck className="h-3 w-3 mr-1 text-green-600" />
                      <span className="text-gray-600">You're attending</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                      <User className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-gray-600">Other events</span>
                    </div>
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
      <div className={`flex-1 flex flex-col overflow-scroll ${connectionStatus === 'disconnected' ? 'mt-12' : ''}`}>
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
                  views={views.filter(v => v !== 'year')}
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
                        {event.userRelationship === 'owner' && (
                          <Crown className="h-3 w-3" />
                        )}
                        {event.userRelationship === 'attendee' && (
                          <UserCheck className="h-3 w-3" />
                        )}
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