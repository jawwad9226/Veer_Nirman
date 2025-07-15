'use client'

import React, { useState } from 'react'
import { MapPin, Users, Building, Phone, Mail, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { localBattalion } from './data'
import './ncc-glass.css'

export default function LocalNCC() {
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="text-6xl mr-4 bounce-icon">🏛️</div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Local NCC Information
            </h1>
            <p className="text-lg text-gray-700 mt-2">Your Local Battalion & Units</p>
          </div>
        </div>
      </div>

      {/* Battalion Information */}
      <div className="ncc-battalion-card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-full flex items-center justify-center mr-4 border-4 border-white shadow-lg">
              <span className="text-2xl">🇮🇳</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{localBattalion.name}</h2>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{localBattalion.location}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{localBattalion.totalCadets}</div>
            <div className="text-xs text-gray-600">Total Cadets</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white bg-opacity-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-lg font-bold text-gray-800">{localBattalion.establishedYear}</div>
            <div className="text-xs text-gray-600">Established</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-lg font-bold text-gray-800">{localBattalion.companies.length}</div>
            <div className="text-xs text-gray-600">Companies</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">👨‍✈️</div>
            <div className="text-sm font-bold text-gray-800">{localBattalion.commandingOfficer || 'Colonel Omesh Shukla'}</div>
            <div className="text-xs text-gray-600">Commanding Officer</div>
          </div>
        </div>

        <div className="bg-white bg-opacity-40 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Building className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Command Structure</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700">Battalion HQ: {localBattalion.headquarters}</span>
            </div>
            <div className="flex items-center">
              <Building className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700">{localBattalion.groupHeadquarters || 'Group Headquarters Amravati'}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700">Contact: +91-7263-234567</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700">Email: 13mah.ncc@gmail.com</span>
            </div>
          </div>
          
          {/* Command Chain Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <div className="text-lg mr-2">🎖️</div>
              <h4 className="font-semibold text-blue-800">Command Authority</h4>
            </div>
            <p className="text-sm text-blue-700">
              The 13 MAH Battalion NCC (Khamgaon) operates under the control of Group Headquarters Amravati, 
              with Colonel Omesh Shukla serving as the Commanding Officer.
            </p>
          </div>
        </div>
      </div>

      {/* Companies Section */}
      <div>
        <div className="flex items-center mb-6">
          <div className="text-3xl mr-3 bounce-icon">🏢</div>
          <h2 className="text-2xl font-bold text-gray-800">Companies & Units</h2>
        </div>

        <div className="space-y-4">
          {localBattalion.companies.map((company) => (
            <div key={company.id} className="ncc-company-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mr-3">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{company.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{company.location}</span>
                      <span className="mx-2">•</span>
                      <span>{company.colleges.length} Colleges</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedCompany(
                    expandedCompany === company.id ? null : company.id
                  )}
                  className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {expandedCompany === company.id ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </button>
              </div>

              {expandedCompany === company.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">Participating Colleges:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {company.colleges.map((college, index) => (
                      <div key={index} className="flex items-center p-2 bg-white bg-opacity-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700">{college}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="ncc-content-card">
        <div className="flex items-center mb-4">
          <div className="text-3xl mr-3 bounce-icon">📞</div>
          <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📍 Address</h3>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                13 Maharashtra Battalion NCC<br />
                NCC Headquarters<br />
                Near District Collectorate<br />
                Khamgaon, Maharashtra 444303
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📧 Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-white bg-opacity-50 rounded-lg">
                <Phone className="h-4 w-4 text-blue-600 mr-3" />
                <span className="text-sm text-gray-700">+91-7263-234567</span>
              </div>
              <div className="flex items-center p-3 bg-white bg-opacity-50 rounded-lg">
                <Mail className="h-4 w-4 text-blue-600 mr-3" />
                <span className="text-sm text-gray-700">13mah.ncc@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Units Map */}
      <div className="ncc-content-card">
        <div className="flex items-center mb-4">
          <div className="text-3xl mr-3 bounce-icon">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-800">Coverage Area</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { city: 'Khamgaon', colleges: 3, distance: '0 km', emoji: '🏛️' },
            { city: 'Akola', colleges: 3, distance: '45 km', emoji: '🏫' },
            { city: 'Buldana', colleges: 3, distance: '35 km', emoji: '🎓' }
          ].map((area, index) => (
            <div key={index} className="bg-white bg-opacity-50 rounded-lg p-4 text-center hover:bg-opacity-70 transition-all">
              <div className="text-2xl mb-2">{area.emoji}</div>
              <h4 className="font-bold text-gray-800">{area.city}</h4>
              <div className="text-sm text-gray-600 mt-1">
                <div>{area.colleges} Colleges</div>
                <div>{area.distance} from HQ</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
        <div className="flex justify-center space-x-3 mb-3">
          <span className="text-2xl">🤝</span>
          <span className="text-2xl">🎯</span>
          <span className="text-2xl">🚀</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Want to Join NCC?</h3>
        <p className="text-gray-600 text-sm mb-4">
          Contact your college NCC officer or visit the nearest company headquarters for enrollment details.
        </p>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition-all">
          Get Enrollment Info
        </button>
      </div>
    </div>
  )
}
