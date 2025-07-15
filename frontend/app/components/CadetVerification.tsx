'use client'

import React, { useState } from 'react'
import { Shield, CheckCircle, AlertCircle, Info, User, Calendar, MapPin } from 'lucide-react'
import { 
  validateRegimentalNumberInput, 
  parseRegimentalNumber, 
  formatRegimentalNumber,
  getStateName,
  getFullYear,
  getDivisionName,
  getWingName,
  NCC_DIVISIONS,
  NCC_WINGS 
} from '../lib/ncc-verification'

interface CadetVerificationProps {
  onVerificationComplete: (verificationData: {
    regimentalNumber: string;
    isVerified: boolean;
    stateCode: string;
    division: string;
    wing: string;
    year: string;
    stateName: string;
    divisionName: string;
    wingName: string;
  }) => void;
  loading?: boolean;
}

export default function CadetVerification({ onVerificationComplete, loading = false }: CadetVerificationProps) {
  const [regNumber, setRegNumber] = useState('')
  const [validation, setValidation] = useState({
    isValid: false,
    error: '',
    suggestion: ''
  })
  const [isVerified, setIsVerified] = useState(false)
  const [verificationData, setVerificationData] = useState<any>(null)

  const handleRegNumberChange = (value: string) => {
    setRegNumber(value)
    setIsVerified(false)
    setVerificationData(null)
    
    const validationResult = validateRegimentalNumberInput(value)
    setValidation(validationResult)
    
    // Auto-verify if valid format
    if (validationResult.isValid) {
      const parsed = parseRegimentalNumber(value)
      if (parsed.isValid) {
        const data = {
          regimentalNumber: value.toUpperCase(),
          isVerified: true,
          stateCode: parsed.stateCode,
          division: parsed.division,
          wing: parsed.wing,
          year: parsed.year,
          stateName: getStateName(parsed.stateCode),
          divisionName: getDivisionName(parsed.division),
          wingName: getWingName(parsed.wing)
        }
        setVerificationData(data)
        setIsVerified(true)
        onVerificationComplete(data)
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">NCC Cadet Verification</h3>
          <p className="text-sm text-gray-600">Enter your regimental number to verify your cadet status</p>
        </div>
      </div>

      {/* Regimental Number Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Regimental Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={regNumber}
          onChange={(e) => handleRegNumberChange(e.target.value)}
          placeholder="Enter your NCC regimental number"
          className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
            regNumber && validation.isValid
              ? 'border-green-300 focus:ring-green-500 bg-green-50'
              : regNumber && !validation.isValid
              ? 'border-red-300 focus:ring-red-500 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={loading}
        />
        
        {/* Validation Messages */}
        {regNumber && (
          <div className="mt-2">
            {validation.isValid ? (
              <div className="flex items-start gap-2 text-green-600">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Valid regimental number!</p>
                  <p className="text-green-700">{validation.suggestion}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-red-600">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{validation.error}</p>
                  <p className="text-red-700">{validation.suggestion}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verification Status */}
      {isVerified && verificationData && (
        <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Cadet Verified Successfully</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-gray-600">State</p>
                <p className="font-medium text-gray-900">{verificationData.stateName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-gray-600">Division</p>
                <p className="font-medium text-gray-900">{verificationData.divisionName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-gray-600">Wing</p>
                <p className="font-medium text-gray-900">{verificationData.wingName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-gray-600">Year</p>
                <p className="font-medium text-gray-900">{getFullYear(verificationData.year)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Regimental Number Required:</p>
            <p className="text-blue-700">
              Enter your official NCC regimental number as provided by your unit.
            </p>
            <p className="text-blue-700 mt-1 text-xs">
              Contact your unit admin if you need assistance with your regimental number.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
