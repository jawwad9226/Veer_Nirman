// NCC Cadet Verification Utilities
export interface NCCRegimentalNumber {
  stateCode: string;
  year: string;
  division: string;
  wing: string;
  uniqueNumber: string;
  isValid: boolean;
}

// List of valid NCC state codes
export const NCC_STATE_CODES = [
  'AN', 'AP', 'AR', 'AS', 'BR', 'CH', 'CG', 'DN', 'DD', 'DL', 'GA', 'GJ', 'HR', 'HP', 'JK', 'JH',
  'KA', 'KL', 'LA', 'LD', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL', 'OD', 'PY', 'PB', 'RJ', 'SK',
  'TN', 'TG', 'TR', 'UP', 'UT', 'WB'
];

// NCC Division/Wing codes and their full names
export const NCC_DIVISIONS = {
  'JD': 'Junior Division (Male)',
  'JW': 'Junior Wing (Female)',
  'SD': 'Senior Division (Male)', 
  'SW': 'Senior Wing (Female)'
} as const;

// NCC Wing codes (Army/Naval/Air Force)
export const NCC_WINGS = {
  'A': 'Army Wing',
  'N': 'Naval Wing',
  'AF': 'Air Force Wing'
} as const;

/**
 * Parse and validate NCC regimental number
 * Format: [StateCode][Year][Division][Wing][UniqueNumber]
 * Example: MH2023SDA014262, WB2021JDA123456
 */
export function parseRegimentalNumber(regNumber: string): NCCRegimentalNumber {
  const result: NCCRegimentalNumber = {
    stateCode: '',
    year: '',
    division: '',
    wing: '',
    uniqueNumber: '',
    isValid: false
  };

  if (!regNumber || typeof regNumber !== 'string') {
    return result;
  }

  // Remove spaces and convert to uppercase
  const cleanRegNumber = regNumber.replace(/\s/g, '').toUpperCase();

  // Validate length (minimum 12 characters for new format)
  if (cleanRegNumber.length < 12) {
    return result;
  }

  try {
    // Extract components for new format: MH2023SDA014262
    result.stateCode = cleanRegNumber.substring(0, 2);     // MH
    result.year = cleanRegNumber.substring(2, 6);          // 2023
    result.division = cleanRegNumber.substring(6, 8);      // SD
    result.wing = cleanRegNumber.substring(8, 9);          // A
    
    // Check if it's Air Force (AF) - takes 2 characters
    if (cleanRegNumber.substring(8, 10) === 'AF') {
      result.wing = 'AF';
      result.uniqueNumber = cleanRegNumber.substring(10);  // Rest after AF
    } else {
      result.wing = cleanRegNumber.substring(8, 9);       // A or N
      result.uniqueNumber = cleanRegNumber.substring(9);   // Rest after single wing
    }

    // Validate state code
    if (!NCC_STATE_CODES.includes(result.stateCode)) {
      return result;
    }

    // Validate year (should be between 2000-2030)
    const yearNum = parseInt(result.year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2030) {
      return result;
    }

    // Validate division
    if (!Object.keys(NCC_DIVISIONS).includes(result.division)) {
      return result;
    }

    // Validate wing
    if (!Object.keys(NCC_WINGS).includes(result.wing)) {
      return result;
    }

    // Validate unique number (should contain alphanumeric characters)
    if (!/^[A-Z0-9]+$/.test(result.uniqueNumber)) {
      return result;
    }

    // If all validations pass
    result.isValid = true;
    
  } catch (error) {
    console.error('Error parsing regimental number:', error);
    return result;
  }

  return result;
}

/**
 * Get full year (now already in 4-digit format)
 */
export function getFullYear(year: string): number {
  return parseInt(year);
}

/**
 * Get division name from division code
 */
export function getDivisionName(divisionCode: string): string {
  return NCC_DIVISIONS[divisionCode as keyof typeof NCC_DIVISIONS] || 'Unknown Division';
}

/**
 * Get wing name from wing code
 */
export function getWingName(wingCode: string): string {
  return NCC_WINGS[wingCode as keyof typeof NCC_WINGS] || 'Unknown Wing';
}

/**
 * Get state name from state code
 */
export function getStateName(stateCode: string): string {
  const stateNames: { [key: string]: string } = {
    'AN': 'Andaman and Nicobar Islands',
    'AP': 'Andhra Pradesh',
    'AR': 'Arunachal Pradesh', 
    'AS': 'Assam',
    'BR': 'Bihar',
    'CH': 'Chandigarh',
    'CG': 'Chhattisgarh',
    'DN': 'Dadra and Nagar Haveli',
    'DD': 'Daman and Diu',
    'DL': 'Delhi',
    'GA': 'Goa',
    'GJ': 'Gujarat',
    'HR': 'Haryana',
    'HP': 'Himachal Pradesh',
    'JK': 'Jammu and Kashmir',
    'JH': 'Jharkhand',
    'KA': 'Karnataka',
    'KL': 'Kerala',
    'LA': 'Ladakh',
    'LD': 'Lakshadweep',
    'MP': 'Madhya Pradesh',
    'MH': 'Maharashtra',
    'MN': 'Manipur',
    'ML': 'Meghalaya',
    'MZ': 'Mizoram',
    'NL': 'Nagaland',
    'OD': 'Odisha',
    'PY': 'Puducherry',
    'PB': 'Punjab',
    'RJ': 'Rajasthan',
    'SK': 'Sikkim',
    'TN': 'Tamil Nadu',
    'TG': 'Telangana',
    'TR': 'Tripura',
    'UP': 'Uttar Pradesh',
    'UT': 'Uttarakhand',
    'WB': 'West Bengal'
  };
  
  return stateNames[stateCode] || stateCode;
}

/**
 * Format regimental number display
 */
export function formatRegimentalNumber(parsed: NCCRegimentalNumber): string {
  if (!parsed.isValid) return '';
  
  const stateName = getStateName(parsed.stateCode);
  const divisionName = getDivisionName(parsed.division);
  const wingName = getWingName(parsed.wing);
  const fullYear = getFullYear(parsed.year);
  
  return `${parsed.stateCode}${parsed.year}${parsed.division}${parsed.wing}${parsed.uniqueNumber} (${stateName}, ${divisionName}, ${wingName}, ${fullYear})`;
}

/**
 * Validate regimental number input in real-time
 */
export function validateRegimentalNumberInput(input: string): {
  isValid: boolean;
  error: string;
  suggestion: string;
} {
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      error: 'Regimental number is required',
      suggestion: 'Enter your NCC regimental number as provided by your unit'
    };
  }

  const parsed = parseRegimentalNumber(input);
  
  if (!parsed.isValid) {
    if (input.length < 12) {
      return {
        isValid: false,
        error: 'Regimental number appears incomplete',
        suggestion: 'Please enter your complete regimental number'
      };
    }
    
    if (!NCC_STATE_CODES.includes(input.substring(0, 2).toUpperCase())) {
      return {
        isValid: false,
        error: 'Invalid regimental number',
        suggestion: 'Please verify your regimental number with your unit'
      };
    }
    
    const yearPart = input.substring(2, 6);
    const year = parseInt(yearPart);
    if (isNaN(year) || year < 2000 || year > 2030) {
      return {
        isValid: false,
        error: 'Invalid regimental number',
        suggestion: 'Please verify your regimental number with your unit'
      };
    }
    
    const divisionPart = input.substring(6, 8).toUpperCase();
    if (!Object.keys(NCC_DIVISIONS).includes(divisionPart)) {
      return {
        isValid: false,
        error: 'Invalid regimental number',
        suggestion: 'Please verify your regimental number with your unit'
      };
    }
    
    const wingPart = input.substring(8, 10).toUpperCase();
    if (!Object.keys(NCC_WINGS).includes(wingPart) && !Object.keys(NCC_WINGS).includes(wingPart.substring(0, 1))) {
      return {
        isValid: false,
        error: 'Invalid regimental number',
        suggestion: 'Please verify your regimental number with your unit'
      };
    }
    
    return {
      isValid: false,
      error: 'Invalid regimental number format',
      suggestion: 'Please verify your regimental number with your unit'
    };
  }

  return {
    isValid: true,
    error: '',
    suggestion: formatRegimentalNumber(parsed)
  };
}
