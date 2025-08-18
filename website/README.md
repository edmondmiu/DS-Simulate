# Design System Website - Epic 4 V2 Testing Portal

**🌐 Interactive testing portal and design system showcase**

A Vue.js application with Firebase backend for Epic 4 V2 testing, designer feedback collection, and two-repo architecture showcase.

## 🚀 Features

### **Epic 4 V2 Testing Portal**
- ✅ Interactive two-repo workflow testing
- ✅ OKLCH color optimization validation
- ✅ Real-time progress tracking
- ✅ Firebase Firestore data collection
- ✅ Responsive design for all devices

### **Design System Showcase**
- ✅ Beautiful landing page with Epic 4 V2 features
- ✅ Two-repository architecture explanation
- ✅ 25 color families and OKLCH optimization highlights
- ✅ Dark/light mode support
- ✅ Token Studio integration guide

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Firebase Project** (for data collection)
- **Firebase CLI** (for deployment)

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd website
npm install
```

### 2. Firebase Project Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Create a project"
   - Name: "design-system-testing" (or your preferred name)
   - Enable Google Analytics (optional)

2. **Enable Firestore Database:**
   - In Firebase Console → Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select your region

3. **Get Firebase Configuration:**
   - Project Settings → General → Your apps
   - Click "Web app" icon (</>)
   - Register app name: "design-system-website"
   - Copy the configuration object

4. **Update Firebase Config:**
   ```javascript
   // src/composables/useFirebase.js
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

5. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
   - Select "Firestore" and "Hosting"
   - Choose your Firebase project
   - Use default Firestore rules file
   - Set public directory to "dist"
   - Configure as single-page app: Yes

### 3. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Automatic Deployment
```bash
# Build and deploy in one command
npm run deploy
```

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## 📊 Firebase Collections

### `epic4-testing` Collection
Each test submission creates a document with:

```javascript
{
  testerInfo: {
    name: "Designer Name",
    email: "designer@company.com",
    figmaVersion: "Desktop v116.12.4",
    tokenStudioVersion: "v2.12.3"
  },
  testResults: {
    "token-import": "pass",
    "token-sets": "pass",
    "oklch-colors": "fail",
    // ... all test results
  },
  testNotes: {
    "oklch-colors": "Colors appear slightly different than expected"
  },
  summary: {
    totalTests: 15,
    completedTests: 15,
    passedTests: 14,
    failedTests: 1,
    completionPercentage: 100,
    passPercentage: 93
  },
  systemInfo: {
    tokenCount: 662,
    tokenSets: 9,
    themes: 4,
    fileSize: "154KB"
  },
  timestamp: "2025-08-11T10:30:00Z",
  version: "Epic 4 Complete"
}
```

## 🎨 Customization

### Styling
- Uses **Tailwind CSS** for styling
- Design system colors defined in `tailwind.config.js`
- Custom components in `src/style.css`

### Testing Checklist
- Modify test data in `src/data/testingChecklist.js`
- Add/remove test phases and individual tests
- Update expected results and steps

### Branding
- Update colors in `tailwind.config.js`
- Modify logo and branding in components
- Customize hero section content

## 📱 Responsive Design

The website is fully responsive and works on:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)  
- ✅ Mobile (320px - 767px)
- ✅ Dark/Light mode support

## 🔒 Security Notes

### Production Firestore Rules
Update `firestore.rules` for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restrict testing results to authenticated users only
    match /epic4-testing/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && validateTestingData(request.resource.data);
    }
  }
  
  function validateTestingData(data) {
    return data.keys().hasAll(['testerInfo', 'testResults', 'summary']) &&
           data.testerInfo.name is string &&
           data.summary.totalTests is number;
  }
}
```

### Environment Variables
For sensitive configuration, use environment variables:

```bash
# .env.local
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 📈 Analytics & Monitoring

### Built-in Analytics
- Test completion rates
- Pass/fail statistics  
- User submission tracking
- System performance metrics

### Adding Google Analytics
```javascript
// Add to main.js
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

## 🛠 Development Guide

### Project Structure
```
website/
├── src/
│   ├── components/
│   │   ├── TestingChecklist.vue     # Main testing interface
│   │   └── DesignSystemShowcase.vue # Landing page
│   ├── composables/
│   │   └── useFirebase.js           # Firebase integration
│   ├── data/
│   │   └── testingChecklist.js      # Test configuration
│   ├── style.css                    # Global styles
│   └── main.js                      # App entry point
├── public/                          # Static assets
├── dist/                           # Built application
└── firebase.json                   # Firebase configuration
```

### Component Architecture
- **App.vue** - Main app shell with navigation
- **TestingChecklist.vue** - Interactive testing form
- **DesignSystemShowcase.vue** - Marketing/showcase page
- **useFirebase.js** - Firebase data operations

## 🚀 Future Enhancements

### Phase 2 Features
- **Admin Dashboard** - View all test results and analytics
- **Token Browser** - Interactive token exploration
- **Theme Switcher** - Live theme preview
- **Component Gallery** - Showcase design system components

### Management Features
- **Executive Reports** - High-level testing summaries
- **Team Analytics** - Department-wise usage statistics
- **Integration Status** - Real-time system health monitoring
- **ROI Metrics** - Design system adoption and impact

## 🎯 Success Metrics

### Designer Engagement
- **Testing Completion Rate:** Target >80%
- **Feedback Quality:** Detailed notes for failures
- **Time to Complete:** Average <20 minutes
- **Return Usage:** Designers testing multiple times

### System Performance  
- **Load Time:** <3 seconds first load
- **Submission Success:** >95% success rate
- **Mobile Experience:** Full functionality on all devices
- **Accessibility:** WCAG AA compliance

---

## 🚀 Quick Start Commands

```bash
# Initial setup
npm install
npm run dev

# Deploy to Firebase
npm run build
firebase deploy

# View live site
firebase hosting:channel:open live
```

**🎉 Your Epic 4 testing portal is ready!**

Share the deployed URL with your design team to start collecting Epic 4 MVP feedback immediately.