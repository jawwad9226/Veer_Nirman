'use client'

import React from 'react'

export default function SyllabusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        NCC Syllabus
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600 mb-4">
          This page will contain the complete NCC syllabus for different certificate levels.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">A Certificate</h3>
            <p className="text-orange-700 text-sm">1st Year - Foundation Level</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">B Certificate</h3>
            <p className="text-blue-700 text-sm">2nd Year - Intermediate Level</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">C Certificate</h3>
            <p className="text-green-700 text-sm">3rd Year - Advanced Level</p>
          </div>
        </div>
      </div>
    </div>
  )
}
