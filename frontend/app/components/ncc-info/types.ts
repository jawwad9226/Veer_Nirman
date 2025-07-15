export interface NCCActivity {
  id: string
  title: string
  description: string
  category: 'camps' | 'social' | 'cultural'
  details: string[]
  icon: string
  emoji: string
}

export interface NCCUnit {
  id: string
  name: string
  type: 'battalion' | 'company' | 'unit'
  location: string
  colleges: string[]
  contact?: {
    phone?: string
    email?: string
    address?: string
  }
}

export interface NCCBattalion {
  id: string
  name: string
  location: string
  headquarters: string
  groupHeadquarters?: string
  companies: NCCUnit[]
  totalCadets: number
  establishedYear: number
  commandingOfficer?: string
}

export interface NCCSong {
  id: string
  title: string
  lyrics: string[]
  description: string
  audioUrl?: string
}

export interface NCCTabType {
  id: 'about' | 'commandments' | 'activities' | 'local'
  label: string
  icon: string
  emoji: string
}
