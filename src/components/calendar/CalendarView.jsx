import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { useAuth } from '../context/AuthContext'
import { useCalendar } from '../context/CalendarContext'
import { calendarAPI } from '../services/calendarApi'
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
  RefreshCw
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

  // Load events from API
  const loadEvents = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      
      const eventsData = await calendarAPI.getEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
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
    const handleEventCreated = () => loadEvents(true)
    const handleEventUpdated = () => loadEvents(true)
    const handleEventDeleted = () => loadEvents(true)
    const handleCalendarSync = () => loadEvents(true)

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
      const newEvent = await calendarAPI.createEvent(eventData)
      setEvents(prev => [...prev, newEvent])
      setShowEventForm(false)
      setSelectedEvent(null)
      
      // Send WebSocket notification
      sendEventCreated(newEvent)
      
      toast.success('Event created successfully!')
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Failed to create event')
    }
  }

  // Handle event update
  const handleUpdateEvent = async (eventData) => {
    try {
      const updatedEvent = await calendarAPI.updateEvent(selectedEvent.id, eventData)
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e))
      setShowEventModal(false)
      setShowEventForm(false)
      setSelectedEvent(null)
      
      // Send WebSocket notification
      sendEventUpdated(updatedEvent)
      
      toast.success('Event updated successfully!')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(error.message || 'Failed to update event')
    }
  }

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    try {
      await calendarAPI.deleteEvent(eventId)
      const deletedEvent = events.find(e => e.id === eventId)
      setEvents(prev => prev.filter(e => e.id !== eventId))
      setShowEventModal(false)
      setSelectedEvent(null)
      
      // Send WebSocket notification
      if (deletedEvent) {
        sendEventDeleted(deletedEvent)
      }
      
      toast.success('Event deleted successfully!')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error(error.message || 'Failed to delete event')
    }
  }

  // Handle search
  const handleSearch = async (query) => {
    if (query.trim()) {
      try {
        setIsRefreshing(true)
        const searchResults = await calendarAPI.searchEvents(query)
        setEvents(searchResults)
      } catch (error) {
        console.error('Error searching events:', error)
        toast.error('Search failed')
      } finally {
        setIsRefreshing(false)
      }
    } else {
      loadEvents(true)
    }
  }

  // Handle category filter
  const handleCategoryFilter = async (category) => {
    setFilterCategory(category)
    
    if (category !== 'all') {
      try {
        setIsRefreshing(true)
        const categoryEvents = await calendarAPI.getEventsByCategory(category)
        setEvents(categoryEvents)
      } catch (error) {
        console.error('Error filtering by category:', error)
        toast.error('Filter failed')
      } finally {
        setIsRefreshing(false)
      }
    } else {
      loadEvents(true)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadEvents(true)}
                  disabled={isRefreshing}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
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
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
              </select>
            </div>
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
      <div className="flex-1 flex flex-col overflow-hidden">
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
                  selectable
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
                    noEventsInRange: 'No events in this range.',
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