import { NCCActivity, NCCUnit, NCCBattalion, NCCSong } from './types'

// Mock data for NCC information
export const nccActivities: NCCActivity[] = [
  // Camps
  {
    id: 'annual-training-camp',
    title: 'Annual Training Camp (ATC)',
    description: 'The premier training event for NCC cadets with comprehensive military training',
    category: 'camps',
    details: [
      '10-day intensive training program',
      'Weapon training and drill competitions',
      'Adventure activities and obstacle courses',
      'Cultural programs and campfire nights',
      'Leadership development sessions'
    ],
    icon: 'Tent',
    emoji: '🏕️'
  },
  {
    id: 'combined-annual-training',
    title: 'Combined Annual Training Camp (CATC)',
    description: 'Inter-state training camp bringing cadets from different regions together',
    category: 'camps',
    details: [
      'Multi-state participation',
      'Advanced military training',
      'Inter-unit competitions',
      'Cultural exchange programs',
      'Best cadet selection'
    ],
    icon: 'Users',
    emoji: '🤝'
  },
  {
    id: 'thal-sainik-camp',
    title: 'Thal Sainik Camp (TSC)',
    description: 'Specialized army training camp for selected cadets',
    category: 'camps',
    details: [
      'Elite training program',
      'Advanced weapon handling',
      'Tactical exercises',
      'Physical endurance training',
      'Certificate of participation'
    ],
    icon: 'Shield',
    emoji: '🛡️'
  },

  // Social Activities
  {
    id: 'environment-day',
    title: 'World Environment Day',
    description: 'Environmental awareness and conservation activities',
    category: 'social',
    details: [
      'Tree plantation drives',
      'Cleanliness campaigns',
      'Awareness rallies',
      'Eco-friendly initiatives',
      'Community participation'
    ],
    icon: 'Leaf',
    emoji: '🌱'
  },
  {
    id: 'yoga-day',
    title: 'International Yoga Day',
    description: 'Promoting health and wellness through yoga',
    category: 'social',
    details: [
      'Mass yoga sessions',
      'Health awareness campaigns',
      'Meditation workshops',
      'Community yoga classes',
      'Wellness seminars'
    ],
    icon: 'Heart',
    emoji: '🧘'
  },
  {
    id: 'blood-donation',
    title: 'Blood Donation Camps',
    description: 'Regular blood donation drives for social service',
    category: 'social',
    details: [
      'Voluntary blood donation',
      'Health checkups',
      'Awareness about blood donation',
      'Collaboration with hospitals',
      'Life-saving initiative'
    ],
    icon: 'Heart',
    emoji: '❤️'
  },

  // Cultural Activities
  {
    id: 'republic-day',
    title: 'Republic Day Parade',
    description: 'Participation in national celebrations and parades',
    category: 'cultural',
    details: [
      'Marching contingents',
      'Cultural performances',
      'Flag hoisting ceremonies',
      'Patriotic songs',
      'Award ceremonies'
    ],
    icon: 'Flag',
    emoji: '🇮🇳'
  },
  {
    id: 'cultural-competition',
    title: 'Inter-Unit Cultural Competition',
    description: 'Showcase of talents in various cultural activities',
    category: 'cultural',
    details: [
      'Dance competitions',
      'Singing contests',
      'Drama performances',
      'Art exhibitions',
      'Poetry recitation'
    ],
    icon: 'Music',
    emoji: '🎭'
  },
  {
    id: 'project-presentation',
    title: 'Project Presentation',
    description: 'Academic and technical project showcases',
    category: 'cultural',
    details: [
      'Science exhibitions',
      'Technical presentations',
      'Innovation showcases',
      'Research projects',
      'Knowledge sharing'
    ],
    icon: 'Presentation',
    emoji: '📊'
  }
]

// 13 MAH Battalion Khamgaon Information
export const localBattalion: NCCBattalion = {
  id: '13-mah-khamgaon',
  name: '13 Maharashtra Battalion NCC',
  location: 'Khamgaon, Maharashtra',
  headquarters: 'Khamgaon',
  totalCadets: 1200,
  establishedYear: 1985,
  commandingOfficer: 'Colonel Omesh Shukla',
  groupHeadquarters: 'Group Headquarters Amravati',
  companies: [
    {
      id: 'alpha-company',
      name: 'Alpha Company',
      type: 'company',
      location: 'Khamgaon',
      colleges: [
        'Govt. College Khamgaon',
        'Arts & Commerce College',
        'Shri Shivaji College'
      ]
    },
    {
      id: 'bravo-company',
      name: 'Bravo Company',
      type: 'company',
      location: 'Akola',
      colleges: [
        'Govt. College Akola',
        'Rashtrasant Tukadoji College',
        'P.D.V.V.P College'
      ]
    },
    {
      id: 'charlie-company',
      name: 'Charlie Company',
      type: 'company',
      location: 'Buldana',
      colleges: [
        'Shri Shivaji College Buldana',
        'Arts Science & Commerce College',
        'Lokmanya Tilak College'
      ]
    }
  ]
}

// NCC Songs
export const nccSongs: NCCSong[] = [
  {
    id: 'ncc-song',
    title: 'NCC Song (Hum Sab Bharatiya Hain)',
    description: 'The official NCC song that embodies the spirit of unity and patriotism',
    lyrics: [
      'हम सब भारतीय हैं, हम सब भारतीय हैं',
      'अपनी मंजिल एक है, हा हा हा, अपनी मंजिल एक है',
      'हो कोई बंगाली, हो कोई मद्रासी',
      'हो कोई मराठी, हो कोई गुजराती',
      'हो कोई पंजाबी, हो कोई राजस्थानी',
      'सबका खून है एक, सबका प्यार एक',
      'हम सब भारतीय हैं, हम सब भारतीय हैं'
    ]
  },
  {
    id: 'qadam-qadam',
    title: 'Qadam Qadam Badhaye Ja',
    description: 'Inspirational marching song promoting progress and determination',
    lyrics: [
      'कदम कदम बढ़ाये जा, खुशी के गीत गाये जा',
      'ये जिंदगी है कौम की, तू कौम पे लुटाये जा',
      'कदम कदम बढ़ाये जा',
      'तू शेर-ए-हिन्द आगे बढ़, मर्दों का सरदार आगे बढ़',
      'हिन्दुस्तान की आँखों का तारा आगे बढ़'
    ]
  },
  {
    id: 'ncc-patriotic-song',
    title: 'NCC Patriotic Song',
    description: 'A patriotic song celebrating the spirit of NCC and service to the nation',
    lyrics: [
      'हम हैं राष्ट्र के सिपाही',
      'हम हैं राष्ट्र के सिपाही',
      'ये हमारी मातृभूमि',
      'ये हमारी मातृभूमि',
      'कंठ कंठ से निकले जयकारे',
      'हम वतन के रखवाले',
      'हम वतन के रखवाले',
      'दूर हो अंधकार सारे',
      'नेक काम में जुड़े हम सारे',
      'सेवा में लगे',
      'सेवा में लगे',
      'हम वीर योद्धा बने',
      'हम वीर योद्धा बने',
      'एकता और अनुशासन',
      'एकता और अनुशासन',
      'हमारा है प्रतीक चिन्ह',
      'ध्येय वाक्य',
      'हमारा है ध्येय वाक्य',
      'देश सेवा और राष्ट्र प्रेम',
      'देश सेवा और राष्ट्र प्रेम',
      'हमारा है संकल्प',
      'हमारा है संकल्प',
      'हम हैं राष्ट्र के सिपाही',
      'हम हैं राष्ट्र के सिपाही'
    ]
  }
]

// Cadet Commandments
export const cadetCommandments = [
  {
    id: 'discipline',
    title: 'Discipline',
    description: 'Maintain discipline in all aspects of life',
    details: [
      'Follow orders promptly and efficiently',
      'Maintain punctuality in all activities',
      'Respect hierarchy and chain of command',
      'Practice self-control and restraint'
    ],
    emoji: '⚡'
  },
  {
    id: 'unity',
    title: 'Unity and Brotherhood',
    description: 'Foster unity among all cadets regardless of background',
    details: [
      'Respect diversity in religion and culture',
      'Help fellow cadets in need',
      'Promote communal harmony',
      'Stand together for common goals'
    ],
    emoji: '🤝'
  },
  {
    id: 'service',
    title: 'Service Before Self',
    description: 'Dedicate yourself to serving the nation and community',
    details: [
      'Participate actively in social service',
      'Help during natural disasters',
      'Contribute to community development',
      'Put national interest above personal gain'
    ],
    emoji: '🙏'
  },
  {
    id: 'integrity',
    title: 'Integrity and Honesty',
    description: 'Maintain highest standards of moral conduct',
    details: [
      'Always speak the truth',
      'Be honest in all dealings',
      'Maintain personal integrity',
      'Set example for others'
    ],
    emoji: '✨'
  }
]

// About NCC Information
export const aboutNCC = {
  history: {
    title: 'History of NCC',
    content: [
      'The National Cadet Corps (NCC) is the Indian military cadet corps with its headquarters in New Delhi, India.',
      'It was formed with the National Cadet Corps Act of 1948.',
      'The NCC came into existence in 1948 and has grown to become one of the largest uniformed youth organizations in the world.',
      'It provides opportunities to the youth of the country for their all-round development.',
      'The organisation is headquartered in New Delhi and has directorates in 17 states across India.'
    ],
    emoji: '📚'
  },
  motto: {
    title: 'NCC Motto',
    content: [
      'The motto of NCC is "Unity and Discipline" (एकता और अनुशासन).',
      'This motto encapsulates the twin objectives of developing character and promoting national integration.',
      'Unity represents the bringing together of cadets from different backgrounds, religions, and regions.',
      'Discipline ensures proper conduct, punctuality, and respect for authority.'
    ],
    emoji: '🎯'
  },
  aims: {
    title: 'Aims of NCC',
    content: [
      'To develop character, comradeship, discipline, a secular outlook, the spirit of adventure and ideals of selfless service amongst young citizens.',
      'To create a human resource of organized, trained and motivated youth to provide leadership in all walks of life.',
      'To provide a suitable environment to motivate the youth to take up a career in the Armed Forces.',
      'To develop qualities of leadership and officer-like qualities amongst the cadets.'
    ],
    emoji: '🎖️'
  },
  role: {
    title: 'Role of NCC',
    content: [
      'Character Development: Building strong moral character and ethical values.',
      'Leadership Training: Developing leadership qualities and officer-like attributes.',
      'National Integration: Promoting unity among diverse communities.',
      'Social Service: Encouraging participation in community development activities.',
      'Adventure Training: Providing opportunities for adventure and outdoor activities.',
      'Career Guidance: Facilitating career opportunities in Armed Forces and other sectors.'
    ],
    emoji: '🌟'
  }
}
