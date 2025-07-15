# NCC ABYAS 2.0 - Modern Migration

This is the modern migration of the NCC ABYAS project using FastAPI (backend) and Next.js (frontend).

## 🚀 Features

- **Modern UI/UX**: Clean, mobile-first design optimized for 10th standard cadets
- **AI Chat Assistant**: Powered by Gemini AI for instant help
- **Knowledge Quizzes**: Interactive quizzes with progress tracking
- **Video Guides**: Instructional videos for drill and ceremonies
- **Progress Dashboard**: Comprehensive learning analytics with charts and insights
- **Syllabus Explorer**: Interactive syllabus navigation with bookmarking
- **Role-Based Access**: Admin/Cadet role switching with different UI features
- **PWA Support**: Install as a mobile/desktop app
- **Real-time Updates**: Modern real-time features
- **Secure Authentication**: Firebase Auth integration

## 🏗️ Project Structure

```text
test_ncc_new/                # Modern migration project
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints
│   ├── app_models.py       # Data models including progress tracking
│   ├── routers/            # API route modules
│   │   └── progress.py     # Progress dashboard endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment variables
└── frontend/               # Next.js frontend
    ├── app/               # App router structure
    │   ├── components/    # React components
    │   │   ├── progress/  # Progress dashboard components
    │   │   ├── quiz/      # Quiz/assessment components
    │   │   ├── videos/    # Video player components
    │   │   ├── syllabus/  # Syllabus explorer components
    │   │   └── *.tsx      # Shared components
    │   ├── context/      # React contexts
    │   ├── lib/          # Utilities and config
    │   ├── globals.css   # Global styles
    │   ├── layout.tsx    # Root layout
    │   └── page.tsx      # Home page
    ├── public/           # Static assets
    ├── package.json      # Dependencies
    ├── tailwind.config.js # Tailwind CSS config
    └── next.config.js    # Next.js config
```

## 🎨 Design Principles

### Simple Navigation

- **Windows-style sidebar**: Icon-only navigation with hover tooltips
- **Mobile-friendly**: Collapsible sidebar for mobile devices
- **Visual hierarchy**: Clear categorization of features

### NCC Brand Colors

- **Red (#DC2626)**: Action buttons, alerts
- **Blue (#2563EB)**: Primary brand color, navigation
- **Sky Blue (#0EA5E9)**: Secondary accents, links
- **Yellow (#FACC15)**: Highlights, achievements

### User Experience

- **Accessibility-first**: Designed for 10th standard students
- **Progressive Web App**: Install and use offline
- **Responsive Design**: Works perfectly on all devices
- **Fast Loading**: Optimized performance

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:

    ```bash
    cd test_ncc_new/backend
    ```

2. **Option A: Using existing conda environment (recommended)**

    ```bash
    conda activate ncc_ai
    pip install fastapi uvicorn pydantic python-multipart
    ```

   #### Option B: Create new virtual environment

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env
    # Edit .env with your Firebase and Gemini credentials
    ```

4. Run the server:

    ```bash
    python main.py
    ```

   The API will be available at [http://localhost:8000](http://localhost:8000)

### Frontend Setup

1. Navigate to frontend directory:

    ```bash
    cd test_ncc_new/frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.local.example .env.local
    # Edit .env.local with your Firebase config
    ```

4. Run the development server:

    ```bash
    npm run dev
    ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

### Testing the Progress Dashboard

Once both servers are running:

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click on the "Analytics" tab (bar chart icon) in the navigation
3. The dashboard will load with mock data showing:
   - Overview cards with study statistics
   - Performance trend charts
   - Topic mastery levels
   - Recent activity feed
   - Learning recommendations

### Mobile Testing

For mobile testing on your local network:

```bash
# Frontend will be available on your local IP
npm run dev  # Starts on 0.0.0.0:3000
```

Find your local IP and access `http://YOUR-LOCAL-IP:3000` from mobile devices.

## 📱 Key Components

### Tab Navigation System

- **Desktop**: Icon-only sidebar with hover tooltips and smooth animations
- **Mobile**: Bottom navigation bar with full labels
- **Tabs**: Home, Videos, Assessment, Syllabus, Analytics (Dashboard), Settings
- **Role-based UI**: Different features available for Admin vs Cadet roles

### Progress Dashboard (Analytics Tab)

- **Overview Cards**: Study time, quiz completion, video progress, streak tracking
- **Performance Trends**: Interactive charts showing score progression over time
- **Topic Mastery**: Mastery levels (Beginner → Expert) with color-coded progress
- **Recent Activity**: Feed of recent learning activities with timestamps
- **Learning Recommendations**: AI-powered suggestions for improvement
- **Responsive Charts**: Built with Recharts for smooth mobile experience

### Assessment System

- **Custom Quiz Setup**: Select number of questions (1-15) for uploaded documents
- **Interactive Results**: Pie chart visualization with detailed question review
- **Topic-based Assessments**: Quick assessments from syllabus sections
- **Progress Tracking**: All quiz attempts tracked in analytics

### Video Learning

- **Responsive Player**: Mobile-optimized video controls
- **Category Organization**: Videos organized by instructional categories
- **Progress Tracking**: Watch time and completion tracking
- **Admin Tools**: Video management interface for instructors

### Syllabus Explorer

- **Interactive Navigation**: Expandable chapters with sections
- **Bookmarking System**: Save important sections for quick access
- **PDF Integration**: Direct links to specific pages in handbook
- **Assessment Integration**: "Take Assessment" buttons for major topics
- **Mobile-optimized**: Touch-friendly interface with improved button layouts

### Home Page

- **Hero Section**: Welcome message with quick actions
- **Role-based Features**: Different feature cards for Admin vs Cadet
- **Common Features**: Accessible features for all users
- **Stats Section**: Platform usage statistics
- **Floating Chat**: Always-accessible AI assistant

### Chat Assistant

- **Real-time Messaging**: Instant responses from Gemini AI
- **Context Awareness**: Remembers conversation history
- **Mobile Optimized**: Full-screen chat interface on mobile
- **Quick Actions**: Predefined helpful commands

## 🛠️ Development

### Adding New Features

1. **Backend**: Add endpoints in `backend/main.py`
2. **Frontend**: Create components in `app/components/`
3. **Navigation**: Update navigation items in `Navigation.tsx`

### Styling Guidelines

- Use Tailwind CSS classes
- Follow NCC color scheme
- Ensure mobile responsiveness
- Test accessibility features

## 🚀 Deployment

### Backend Deployment

- Deploy to Railway, Heroku, or similar platform
- Set environment variables in production
- Configure CORS for your frontend domain

### Frontend Deployment

- Deploy to Vercel, Netlify, or similar platform
- Set production environment variables
- Configure custom domain if needed

## 📊 Migration Progress

- [x] Project structure setup
- [x] Basic FastAPI backend with modular router system
- [x] Next.js frontend with Tailwind CSS and mobile-first design
- [x] Tab navigation system (desktop sidebar + mobile bottom nav)
- [x] Role-based access control (Admin/Cadet switching)
- [x] Chat assistant interface with floating design
- [x] Video player system with responsive controls
- [x] Quiz/Assessment system with custom question counts
- [x] Interactive syllabus explorer with bookmarking
- [x] **Progress Dashboard with comprehensive analytics**
- [x] Firebase authentication setup
- [x] PWA configuration
- [x] Glassmorphism design system
- [x] Mobile-optimized UI/UX
- [ ] Complete AI integration (Gemini API)
- [ ] Advanced data persistence and user profiles
- [ ] Offline functionality and caching
- [ ] Testing and optimization
- [ ] Production deployment

## 🔧 Technical Details

### Dependencies Added

**Frontend:**
- `recharts` - For interactive charts in Progress Dashboard
- `lucide-react` - Icon system
- `react-pdf` - PDF viewing capabilities

**Backend:**
- `fastapi` - Modern Python web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation

### Key Features Implemented

1. **Modular Architecture**: Clean separation of concerns
2. **Progress Tracking**: Comprehensive analytics system
3. **Responsive Design**: Mobile-first approach
4. **Glassmorphism UI**: Modern design system
5. **Role-based Features**: Admin/Cadet differentiation
6. **Interactive Elements**: Smooth animations and transitions

## 🏁 Next Steps

1. **Install dependencies and test the basic setup**
2. **Configure Firebase authentication**
3. **Migrate quiz functionality**
4. **Migrate video guides**
5. **Implement progress tracking**
6. **Add admin features**
7. **Testing and optimization**
8. **Production deployment**

## 🤝 Contributing

This is a migration project. Please follow the existing code structure and design patterns when adding features.

## 📧 Support

For questions about this migration, refer to the original project documentation or contact the development team.
