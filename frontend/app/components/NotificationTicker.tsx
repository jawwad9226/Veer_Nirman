'use client'

import React from 'react'

const notifications = [
  "Welcome to VEER NIRMAN 2.0! 🎉 New features available now",
  "Quiz Competition: Register for the Annual NCC Knowledge Challenge",
  "New Video Guide: Drill & Ceremonies - Basic Movements",
  "Admin Notice: System maintenance scheduled for weekend",
  "Achievement Unlocked: 500+ cadets completed basic training!"
]

export default function NotificationTicker() {
  return (
    <div className="fixed top-20 left-0 right-0 z-40 bg-ncc-yellow text-ncc-blue py-2 overflow-hidden border-b h-10">
      <div className="relative h-full flex items-center">
        <div className="ticker-text whitespace-nowrap text-sm font-medium px-4">
          {notifications.join(' • ')} • 
        </div>
      </div>
    </div>
  )
}
