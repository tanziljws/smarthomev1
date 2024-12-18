'use client'
import { useState } from 'react'
import { DAYS, SCENES } from '@/lib/automationUtils'

export default function Automation() {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      name: 'Morning Routine',
      time: '06:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      scene: 'morning',
      active: true
    },
    {
      id: 2,
      name: 'Night Mode',
      time: '22:00',
      days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      scene: 'night',
      active: true
    }
  ])

  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    time: '00:00',
    days: [],
    scene: 'morning',
    active: true
  })

  const addSchedule = (e) => {
    e.preventDefault()
    setSchedules([...schedules, { ...newSchedule, id: Date.now() }])
    setShowAddSchedule(false)
    setNewSchedule({
      name: '',
      time: '00:00',
      days: [],
      scene: 'morning',
      active: true
    })
  }

  const toggleSchedule = (id) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id ? { ...schedule, active: !schedule.active } : schedule
    ))
  }

  const deleteSchedule = (id) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(schedule => schedule.id !== id))
    }
  }

  const activateScene = (sceneName) => {
    const scene = SCENES[sceneName]
    console.log(`Activating scene: ${scene.name}`)
    // Implement your device control logic here
    scene.actions.forEach(action => {
      console.log(`- ${action.device}: ${action.action}`, action)
    })
  }

  return (
    <div className="space-y-6">
      {/* Scenes Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Room Scenes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(SCENES).map(([key, scene]) => (
            <button 
              key={key}
              onClick={() => activateScene(key)}
              className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all
                       hover:shadow-md active:scale-95"
            >
              <div className="text-4xl mb-3">{scene.icon}</div>
              <div className="font-medium text-gray-800">{scene.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {scene.actions.length} actions
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Schedules Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Schedules</h2>
          <button
            onClick={() => setShowAddSchedule(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                     transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Schedule
          </button>
        </div>

        <div className="space-y-4">
          {schedules.map(schedule => (
            <div key={schedule.id} 
                 className={`border rounded-lg p-4 transition-colors
                           ${schedule.active ? 'bg-white' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{schedule.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" 
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">{schedule.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`w-12 h-6 rounded-full transition-colors
                              ${schedule.active ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform
                                  ${schedule.active ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {DAYS.map(day => (
                  <span
                    key={day.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                              ${schedule.days.includes(day.id)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-400'}`}
                  >
                    {day.label}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-gray-500">
                <span className="text-2xl">{SCENES[schedule.scene].icon}</span>
                <span>{SCENES[schedule.scene].name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center 
                      justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <form onSubmit={addSchedule} className="p-6">
              <h3 className="text-xl font-bold mb-4">Add New Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    value={newSchedule.name}
                    onChange={e => setNewSchedule({...newSchedule, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newSchedule.time}
                    onChange={e => setNewSchedule({...newSchedule, time: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => {
                          const days = newSchedule.days.includes(day.id)
                            ? newSchedule.days.filter(d => d !== day.id)
                            : [...newSchedule.days, day.id]
                          setNewSchedule({...newSchedule, days})
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center
                                  ${newSchedule.days.includes(day.id)
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-600'}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scene
                  </label>
                  <select
                    value={newSchedule.scene}
                    onChange={e => setNewSchedule({...newSchedule, scene: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(SCENES).map(([key, scene]) => (
                      <option key={key} value={key}>
                        {scene.icon} {scene.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddSchedule(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg
                           transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                           hover:bg-blue-600 transition-colors"
                >
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 