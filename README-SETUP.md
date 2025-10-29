# Anonymous Feedback Web App - Setup Guide

## 🚀 Project Overview

This is a React-based anonymous feedback application that allows users to submit feedback anonymously via a public URL, while admins can view and manage feedback through a protected dashboard. The app features a clean, professional design with smooth animations.

## 📋 Features

- **Anonymous Feedback Form**: Public form for submitting feedback with optional attachments
- **Admin Authentication**: Firebase-based login system for admins
- **Protected Dashboard**: Secure admin area to view all feedback submissions
- **File Upload**: Support for attachments stored in Firebase Storage
- **Modern UI**: Clean design with Framer Motion animations and Tailwind CSS
- **Responsive**: Works on all device sizes

## 🔧 Firebase Setup Before Running

**Important**: You must configure Firebase before the app will work properly.

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or "Add project")
3. Enter your project name and follow the setup wizard
4. Enable the required services (see below)

### 2. Enable Required Firebase Services

In your Firebase project, enable these services:

#### Authentication:
1. Go to Authentication > Sign-in method
2. Enable "Email/Password" provider

#### Firestore Database:
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (you can adjust security rules later)
4. Select a location for your database

#### Storage:
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode" (you can adjust security rules later)

### 3. Get Your Firebase Configuration

1. Go to Project settings (gear icon) > General
2. Scroll down to "Your apps" section
3. Click "Add app" > Web app (</>) if you haven't added one
4. Copy the configuration object (apiKey, authDomain, etc.)

### 4. Configure the App

1. Open `src/firebase/config.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🏃‍♂️ Running the Application

### Installation

```bash
# Clone or navigate to the project directory
cd anonymous-feedback-app

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open in your browser at `http://localhost:3000`

## 📱 Usage

### For Users (Public Access):
1. Visit the main page (`/`)
2. Fill out the feedback form
3. Add a subject and message (required)
4. Optionally attach a file
5. Submit feedback anonymously

### For Admins:
1. Visit `/login`
2. Sign in with your admin credentials
3. Access the dashboard at `/admin` to view all feedback

## 🔐 Creating Admin Users

To create admin accounts:

1. Go to Firebase Console > Authentication > Users
2. Click "Add user"
3. Enter email and password
4. Note: These credentials will be used to log into the admin dashboard

## 🎨 Design Features

- **Color Scheme**: Deep blue (#003399) and white theme
- **Animations**: Smooth transitions with Framer Motion
- **Responsive**: Mobile-friendly design
- **Accessibility**: Proper form labels and keyboard navigation

## 🛠️ Project Structure

```
src/
├── components/
│   └── ProtectedRoute.js          # Route protection component
├── pages/
│   ├── FeedbackForm.js           # Public feedback submission page
│   ├── AdminLogin.js            # Admin authentication page
│   └── AdminDashboard.js        # Protected admin dashboard
├── firebase/
│   └── config.js               # Firebase configuration
├── App.js                     # Main app component with routing
└── index.js                   # App entry point
```

## 📦 Dependencies

- **React** - UI framework
- **React Router** - Client-side routing
- **Firebase** - Backend services (Auth, Firestore, Storage)
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **PostCSS/Autoprefixer** - CSS processing

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting (Recommended)

1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init hosting
   ```

3. Deploy:
   ```bash
   firebase deploy
   ```

## 🔒 Security Notes

- **Current Setup**: The app starts with test mode Firestore and Storage security rules
- **Production**: Update security rules to restrict access appropriately
- **Authentication**: Currently uses email/password auth
- **Data Privacy**: Feedback is stored as submitted - consider data retention policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues:

1. **Firebase configuration errors**: Double-check your config values in `config.js`
2. **Auth errors**: Ensure Authentication is enabled in Firebase Console
3. **Firestore errors**: Verify Firestore is initialized and security rules allow access
4. **Storage errors**: Check Storage is enabled and rules are configured

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase project configuration
3. Ensure all required services are enabled
4. Check that dependencies are properly installed

---

**Note**: This application requires active Firebase configuration to function. The placeholder values in the config file must be replaced with your actual Firebase project details.
