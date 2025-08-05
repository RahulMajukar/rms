import { useState } from 'react'
import moment from 'moment'
import { ChevronDown, ChevronUp, Calendar, Clock, MapPin, Users } from 'lucide-react'

export default function YearView({ date, events, onEventClick, onDateClick, onMonthClick }) {
  const [expandedMonths, setExpandedMonths] = useState({})
  
  const currentYear = moment(date).year()
  const today = moment()
  
  // Group events by month and date
  const getEventsForMonth = (monthIndex) => {
    const monthStart = moment().year(currentYear).month(monthIndex).startOf('month')
    const monthEnd = moment().year(currentYear).month(monthIndex).endOf('month')
    
    return events.filter(event => {
      const eventDate = moment(event.start)
      return eventDate.isBetween(monthStart, monthEnd, 'day', '[]')
    })
  }
  
  const getEventsForDate = (date) => {
    return events.filter(event => {
      return moment(event.start).isSame(date, 'day')
    })
  }
  
  const getCategoryColor = (category) => {
    const colors = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      health: 'bg-yellow-500',
      education: 'bg-purple-500'
    }
    return colors[category] || 'bg-gray-500'
  }
  
  const toggleMonthExpansion = (monthIndex) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthIndex]: !prev[monthIndex]
    }))
  }
  
  const renderMiniCalendar = (monthIndex) => {
    const monthStart = moment().year(currentYear).month(monthIndex).startOf('month')
    const monthEnd = moment().year(currentYear).month(monthIndex).endOf('month')
    const calendarStart = monthStart.clone().startOf('week')
    const calendarEnd = monthEnd.clone().endOf('week')
    
    const weeks = []
    let currentWeek = calendarStart.clone()
    
    while (currentWeek.isSameOrBefore(calendarEnd, 'day')) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const day = currentWeek.clone().add(i, 'day')
        week.push(day)
      }
      weeks.push(week)
      currentWeek.add(1, 'week')
    }
    
    return (
      <div className="grid grid-cols-7 gap-1 text-xs">
        {/* Weekday headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div 
            key={index} 
            className="h-6 flex items-center justify-center font-medium text-gray-500 text-center"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const isCurrentMonth = day.month() === monthIndex
            const isToday = day.isSame(today, 'day')
            const dayEvents = getEventsForDate(day)
            const hasEvents = dayEvents.length > 0
            
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => hasEvents && onDateClick(day.toDate())}
                className={`
                  h-8 flex flex-col items-center justify-center relative cursor-pointer rounded-sm transition-colors
                  ${isCurrentMonth 
                    ? 'text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-400'
                  }
                  ${isToday 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : ''
                  }
                  ${hasEvents && !isToday 
                    ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100' 
                    : ''
                  }
                `}
              >
                <span className="text-xs font-medium">
                  {day.date()}
                </span>
                
                {/* Event indicators */}
                {hasEvents && (
                  <div className="absolute bottom-0 flex space-x-0.5">
                    {dayEvents.slice(0, 3).map((event, index) => (
                      <div
                        key={index}
                        className={`w-1 h-1 rounded-full ${getCategoryColor(event.category)}`}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    )
  }
  
  const renderExpandedMonth = (monthIndex) => {
    const monthEvents = getEventsForMonth(monthIndex)
    const groupedEvents = {}
    
    monthEvents.forEach(event => {
      const dateKey = moment(event.start).format('YYYY-MM-DD')
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = []
      }
      groupedEvents[dateKey].push(event)
    })
    
    const sortedDates = Object.keys(groupedEvents).sort()
    
    return (
      <div className="mt-4 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
        {sortedDates.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No events this month
          </p>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(dateKey => {
              const dateEvents = groupedEvents[dateKey]
              const eventDate = moment(dateKey)
              
              return (
                <div key={dateKey} className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                    {eventDate.format('MMM DD, dddd')}
                  </div>
                  <div className="space-y-2">
                    {dateEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="flex items-start space-x-3 p-2 bg-white rounded-md hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200"
                      >
                        <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${getCategoryColor(event.category)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-2">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {moment(event.start).format('h:mm A')}
                            </span>
                            {event.location && (
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {event.location}
                              </span>
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {event.attendees.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Year Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{currentYear}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {events.length} events
            </span>
          </div>
        </div>
      </div>

      {/* Months Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const monthName = moment().month(monthIndex).format('MMMM')
            const monthEvents = getEventsForMonth(monthIndex)
            const isExpanded = expandedMonths[monthIndex]
            const isCurrentMonth = moment().year(currentYear).month(monthIndex).isSame(today, 'month')
            
            return (
              <div
                key={monthIndex}
                className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                  isCurrentMonth 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Month Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <button
                        onClick={() => onMonthClick(moment().year(currentYear).month(monthIndex).toDate())}
                        className={`text-lg font-semibold hover:text-blue-600 transition-colors ${
                          isCurrentMonth ? 'text-blue-600' : 'text-gray-900'
                        }`}
                      >
                        {monthName}
                      </button>
                      <div className="text-sm text-gray-500 mt-1">
                        {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMonthExpansion(monthIndex)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Month Content */}
                <div className="p-4">
                  {renderMiniCalendar(monthIndex)}
                  
                  {/* Expanded Event List */}
                  {isExpanded && renderExpandedMonth(monthIndex)}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Year Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            {currentYear} Summary
          </h3>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {events.length}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {events.filter(e => e.category === 'work').length}
              </div>
              <div className="text-sm text-gray-600">Work Events</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center border border-green-200">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {events.filter(e => e.category === 'personal').length}
              </div>
              <div className="text-sm text-gray-600">Personal Events</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-500 mb-1">
                {events.filter(e => e.category === 'health').length}
              </div>
              <div className="text-sm text-gray-600">Health Events</div>
            </div>
          </div>
          
          {/* Monthly Event Distribution Chart */}
          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Distribution</h4>
            <div className="flex items-end justify-between space-x-2 h-32">
              {Array.from({ length: 12 }, (_, monthIndex) => {
                const monthEvents = getEventsForMonth(monthIndex)
                const maxEvents = Math.max(...Array.from({ length: 12 }, (_, i) => getEventsForMonth(i).length), 1)
                const height = (monthEvents.length / maxEvents) * 100
                
                return (
                  <div key={monthIndex} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-t flex flex-col justify-end relative" style={{ height: '100px' }}>
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${moment().month(monthIndex).format('MMM')}: ${monthEvents.length} events`}
                      />
                      {monthEvents.length > 0 && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-5 text-xs font-medium text-gray-700">
                          {monthEvents.length}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-2 font-medium">
                      {moment().month(monthIndex).format('MMM')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}