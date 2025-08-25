# Music Selection System

This document explains how the music selection system works in the frontend application.

## Overview

The music selection system allows both guest users and logged-in users to select music tracks. Guest selections are stored locally and can be associated with user accounts after login/registration.

## Features

### 1. Landing Page Music Selection
- **Guest Users**: Can select multiple musics using device IDs stored in localStorage
- **Logged-in Users**: Can select multiple musics using their user ID
- **Selection Button**: Each music card has a selection button (plus/check icon)
- **Visual Feedback**: Selected musics show a green checkmark, unselected show a plus icon

### 2. Guest User Experience
- Device ID is automatically generated and stored in localStorage
- Selections are saved locally using the device ID
- Guest users cannot access the User Dashboard directly
- "Go to Dashboard" button redirects guests to the login page

### 3. User Dashboard
- **"For You" Section**: Displays musics selected by the current user
- **"Other Musics" Section**: Displays all remaining musics
- **Stats**: Shows total tracks, selected tracks, and artist count

### 4. Selection Association
- After login/registration, guest selections are automatically linked to the user account
- Device ID is cleared after successful association
- User sees a success toast confirming their selections were linked

## Technical Implementation

### API Functions (Backend-based)

#### `saveMusicSelection(musicId, userId, deviceId)`
- Calls `POST /selection-musics` API endpoint
- Sends `{ musicId, userId }` or `{ musicId, deviceId }`
- Backend saves selection to database

#### `fetchSelectedMusics(userId, deviceId)`
- Calls `GET /selection-musics?userId=<id>` or `GET /selection-musics?deviceId=<id>`
- Backend returns selection data from database
- Handles both user and device selections

#### `associateGuestSelections(userId, deviceId)`
- Calls `POST /selection-musics/associate-guest` API endpoint
- Sends `{ userId, deviceId }`
- Backend updates device selections with userId
- Handles duplicate prevention

#### `removeMusicSelection(musicId, userId, deviceId)`
- Calls `DELETE /selection-musics` API endpoint
- Sends `{ musicId, userId }` or `{ musicId, deviceId }`
- Backend removes selection from database

### Data Storage

The system now uses your backend database instead of localStorage:

#### User Selections
- Stored in database with `userId` field
- Retrieved via `GET /selection-musics?userId=<id>`

#### Device Selections
- Stored in database with `deviceId` field
- Retrieved via `GET /selection-musics?deviceId=<id>`
- After login, `deviceId` is updated to `userId` via associate endpoint

### Component Structure

#### Landing Page (`src/components/Landing/Landing.jsx`)
- Manages selection state
- Handles both guest and user selections
- Loads existing selections on mount
- Provides "Go to Dashboard" button

#### Music Grid (`src/components/Landing/MusicGrid.jsx`)
- Displays music cards with selection buttons
- Uses `MusicSelectionCard` component
- Shows selection status

#### Music Selection Card (`src/components/Common/MusicSelectionCard.jsx`)
- Reusable component for music display
- Configurable buttons (selection, play, favorite, download)
- Handles selection interactions

#### User Dashboard (`src/components/User/UserDashboard.jsx`)
- Shows "For You" and "Other Musics" sections
- Loads user's selected musics
- Displays selection statistics

## User Flow

### Guest User Flow
1. Visit landing page
2. Device ID is automatically generated
3. Select multiple musics (stored with device ID)
4. Click "Go to Dashboard" → redirected to login
5. After login/registration → selections are linked to account
6. Access User Dashboard → see selections in "For You" section

### Logged-in User Flow
1. Visit landing page
2. Select musics (stored with user ID)
3. Click "Go to Dashboard" → navigate to User Dashboard
4. View selections in "For You" section

## Backend Integration

The system is now fully integrated with your backend API:

1. **POST /selection-musics** - Save music selection
2. **DELETE /selection-musics** - Remove music selection  
3. **POST /selection-musics/associate-guest** - Associate guest selections with user
4. **GET /selection-musics** - Fetch selected musics

All selections are stored in your database and properly associated with users after login.

## CSS Classes

The system uses Tailwind CSS with custom classes:
- `glass` - Glassmorphism effect
- `btn-hover` - Button hover animations
- `animate-fade-in` - Fade-in animations
- `animate-float` - Floating animations

## Error Handling

- Network errors show user-friendly messages
- Selection failures don't break the user experience
- Toast notifications provide feedback
- Proper error handling for all API endpoints
- Console logging for debugging API calls
