import { useState, useEffect } from 'react'
import { X, Plus, Minus, Calendar, Clock, MapPin, Users, FileText, Tag, AlertTriangle, Bell, Save } from 'lucide-react'
import moment from 'moment'

export default function EventForm({ event, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    category: 'work',
    priority: 'medium',
    location: '',
    attendees: [],
    reminders: [{ type: 'popup', minutes: 15 }],
    isAllDay: false,
    isRecurring: false
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (event) {
      // Parse dates properly from different formats
      const parseDate = (dateValue) => {
        if (!dateValue) return new Date()
        if (dateValue instanceof Date) return dateValue
        return new Date(dateValue)
      }

      setFormData({
        title: event.title || '',
        description: event.description || '',
        start: parseDate(event.start),
        end: parseDate(event.end),
        category: event.category || 'work',
        priority: event.priority || 'medium',
        location: event.location || '',
        attendees: Array.isArray(event.attendees) ? [...event.attendees] : [],
        reminders: Array.isArray(event.reminders) && event.reminders.length > 0 
          ? event.reminders.map(r => ({
              type: r.type || 'popup',
              minutes: parseInt(r.minutes) || 15
            }))
          : [{ type: 'popup', minutes: 15 }],
        isAllDay: Boolean(event.isAllDay),
        isRecurring: Boolean(event.isRecurring)
      })
    }
  }, [event])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Auto-adjust end time when start time changes
    if (field === 'start' && value) {
      const startDate = new Date(value)
      const currentEnd = new Date(formData.end)
      const currentStart = new Date(formData.start)
      
      // If end time is before or equal to new start time, adjust it
      if (currentEnd <= startDate) {
        const newEnd = new Date(startDate.getTime() + (60 * 60 * 1000)) // Add 1 hour
        setFormData(prev => ({ ...prev, end: newEnd }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length > 255) {
      newErrors.title = 'Title must be less than 255 characters'
    }

    // Date validation
    const startDate = new Date(formData.start)
    const endDate = new Date(formData.end)
    
    if (isNaN(startDate.getTime())) {
      newErrors.start = 'Valid start date is required'
    }
    
    if (isNaN(endDate.getTime())) {
      newErrors.end = 'Valid end date is required'
    }
    
    if (startDate >= endDate) {
      newErrors.end = 'End time must be after start time'
    }

    // Check if start date is too far in the past (optional)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    if (startDate < oneYearAgo) {
      newErrors.start = 'Start date cannot be more than one year in the past'
    }

    // Location validation (optional)
    if (formData.location && formData.location.length > 500) {
      newErrors.location = 'Location must be less than 500 characters'
    }

    // Description validation (optional)
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters'
    }

    // Attendees validation
    const invalidEmails = formData.attendees.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return email.trim() && !emailRegex.test(email.trim())
    })
    
    if (invalidEmails.length > 0) {
      newErrors.attendees = 'Please enter valid email addresses'
    }

    // Reminders validation
    const invalidReminders = formData.reminders.filter(reminder => 
      !reminder.minutes || reminder.minutes < 0 || reminder.minutes > 10080 // Max 1 week
    )
    
    if (invalidReminders.length > 0) {
      newErrors.reminders = 'Reminder times must be between 0 and 10080 minutes (1 week)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // Clean up attendees (remove empty entries and trim)
      const cleanedAttendees = formData.attendees
        .map(email => email.trim())
        .filter(email => email.length > 0)

      // Prepare data for API
      const submitData = {
        ...formData,
        attendees: cleanedAttendees,
        // Ensure dates are properly formatted
        start: new Date(formData.start),
        end: new Date(formData.end)
      }

      await onSave(submitData)
    } catch (error) {
      console.error('Error saving event:', error)
      // Display server errors
      if (error.message) {
        setErrors({ submit: error.message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addAttendee = () => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, '']
    }))
  }

  const removeAttendee = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }))
  }

  const updateAttendee = (index, value) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => i === index ? value : attendee)
    }))
  }

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { type: 'popup', minutes: 30 }]
    }))
  }

  const removeReminder = (index) => {
    if (formData.reminders.length > 1) {
      setFormData(prev => ({
        ...prev,
        reminders: prev.reminders.filter((_, i) => i !== index)
      }))
    }
  }

  const updateReminder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map((reminder, i) => 
        i === index ? { ...reminder, [field]: field === 'minutes' ? parseInt(value) || 0 : value } : reminder
      )
    }))
  }

  const formatDateTimeLocal = (date) => {
    if (!date) return ''
    return moment(date).format('YYYY-MM-DDTHH:mm')
  }

  const parseDateTimeLocal = (value) => {
    return new Date(value)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {event?.id ? 'Edit Event' : 'Create New Event'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar" onSubmit={handleSubmit}>
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error saving event</h3>
                  <p className="mt-2 text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter event title"
              maxLength={255}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(formData.start)}
                onChange={(e) => handleChange('start', parseDateTimeLocal(e.target.value))}
                className={`input-field ${errors.start ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.start && (
                <p className="mt-1 text-sm text-red-600">{errors.start}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-2" />
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(formData.end)}
                onChange={(e) => handleChange('end', parseDateTimeLocal(e.target.value))}
                className={`input-field ${errors.end ? 'border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.end && (
                <p className="mt-1 text-sm text-red-600">{errors.end}</p>
              )}
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.isAllDay}
              onChange={(e) => handleChange('isAllDay', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="allDay" className="ml-2 block text-sm text-gray-900">
              All day event
            </label>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-2" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="input-field"
                disabled={isLoading}
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="input-field"
                disabled={isLoading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={`input-field ${errors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter event location"
              maxLength={500}
              disabled={isLoading}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`input-field resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter event description"
              maxLength={2000}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <Users className="h-4 w-4 inline mr-2" />
                Attendees
              </label>
              <button
                type="button"
                onClick={addAttendee}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.attendees.map((attendee, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={attendee}
                    onChange={(e) => updateAttendee(index, e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter email address"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => removeAttendee(index)}
                    className="text-red-600 hover:text-red-700 p-2"
                    disabled={isLoading}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.attendees && (
              <p className="mt-1 text-sm text-red-600">{errors.attendees}</p>
            )}
          </div>

          {/* Reminders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <Bell className="h-4 w-4 inline mr-2" />
                Reminders
              </label>
              <button
                type="button"
                onClick={addReminder}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.reminders.map((reminder, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={reminder.type}
                    onChange={(e) => updateReminder(index, 'type', e.target.value)}
                    className="input-field w-24"
                    disabled={isLoading}
                  >
                    <option value="popup">Popup</option>
                    <option value="email">Email</option>
                  </select>
                  <select
                    value={reminder.minutes}
                    onChange={(e) => updateReminder(index, 'minutes', e.target.value)}
                    className="input-field flex-1"
                    disabled={isLoading}
                  >
                    <option value={0}>At event time</option>
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={120}>2 hours before</option>
                    <option value={1440}>1 day before</option>
                    <option value={2880}>2 days before</option>
                    <option value={10080}>1 week before</option>
                  </select>
                  {formData.reminders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReminder(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                      disabled={isLoading}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.reminders && (
              <p className="mt-1 text-sm text-red-600">{errors.reminders}</p>
            )}
          </div>

          {/* Recurring Events */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => handleChange('isRecurring', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="recurring" className="ml-2 block text-sm text-gray-900">
              Recurring event
            </label>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="btn-primary flex items-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {event?.id ? 'Update Event' : 'Create Event'}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}