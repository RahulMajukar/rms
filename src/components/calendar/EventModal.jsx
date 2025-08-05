import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Tag, 
  AlertTriangle,
  Edit,
  Trash2,
  Bell
} from 'lucide-react'
import moment from 'moment'

export default function EventModal({ event, onClose, onEdit, onDelete }) {
  const getCategoryColor = (category) => {
    const colors = {
      work: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      health: 'bg-yellow-100 text-yellow-800',
      education: 'bg-purple-100 text-purple-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    }
    return colors[priority] || 'text-gray-600'
  }

  const formatDateTime = (date) => {
    return moment(date).format('MMM DD, YYYY [at] h:mm A')
  }

  const formatDuration = (start, end) => {
    const duration = moment.duration(moment(end).diff(moment(start)))
    const hours = duration.hours()
    const minutes = duration.minutes()
    
    if (hours === 0) return `${minutes}m`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {event.title || 'Untitled Event'}
            </h3>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                <Tag className="h-3 w-3 mr-1" />
                {event.category}
              </span>
              <span className={`inline-flex items-center text-sm font-medium ${getPriorityColor(event.priority)}`}>
                <AlertTriangle className="h-4 w-4 mr-1" />
                {event.priority} priority
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">
                  {formatDateTime(event.start)}
                </div>
                <div className="text-sm text-gray-500">
                  to {formatDateTime(event.end)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-3 text-gray-400" />
              <span>Duration: {formatDuration(event.start, event.end)}</span>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center text-gray-700">
              <MapPin className="h-5 w-5 mr-3 text-gray-400" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start text-gray-700">
              <FileText className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium mb-1">Description</div>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-start text-gray-700">
              <Users className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium mb-2">Attendees ({event.attendees.length})</div>
                <div className="space-y-1">
                  {event.attendees.map((attendee, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {attendee}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reminders */}
          {event.reminders && event.reminders.length > 0 && (
            <div className="flex items-start text-gray-700">
              <Bell className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium mb-2">Reminders</div>
                <div className="space-y-1">
                  {event.reminders.map((reminder, index) => {
                    const timeText = reminder.minutes === 0 ? 'At event time' :
                                   reminder.minutes < 60 ? `${reminder.minutes} minutes before` :
                                   reminder.minutes === 60 ? '1 hour before' :
                                   reminder.minutes === 1440 ? '1 day before' :
                                   `${Math.floor(reminder.minutes / 60)} hours before`
                    
                    return (
                      <div key={index} className="text-sm text-gray-600">
                        {reminder.type === 'popup' ? '🔔' : '📧'} {timeText}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="btn-primary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this event?')) {
                onDelete()
              }
            }}
            className="btn-danger flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}