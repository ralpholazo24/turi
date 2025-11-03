<!-- 24656ba2-d6ad-4d48-9881-5f0d0c784d30 248906e8-cddd-4799-8e30-f289ba36802e -->
# Firebase Cloud Sync & Subscription Features Implementation Plan

## Overview

This plan outlines the implementation of cloud-based features including:

- Firebase integration for cloud storage and real-time sync
- User authentication and account management
- Group invitations via code/link
- Role-based access control (owner vs invited members)
- Subscription/payment model for premium features

---

## Phase 1: Firebase Setup & Authentication

### 1.1 Firebase Project Setup

- [ ] Create Firebase project in Firebase Console
- [ ] Enable Authentication (Email/Password, Anonymous optional)
- [ ] Enable Firestore Database
- [ ] Enable Cloud Functions (for invitation handling)
- [ ] Configure Firebase for React Native (expo-firebase or @react-native-firebase)
- [ ] Add Firebase config to app (environment variables)
- [ ] Set up Firestore security rules
- [ ] Set up Firebase Storage (for future profile images)

### 1.2 Authentication System

- [ ] Create authentication store (`store/use-auth-store.ts`)
- [ ] Implement sign up flow (email/password)
- [ ] Implement sign in flow
- [ ] Implement sign out flow
- [ ] Add password reset functionality
- [ ] Add email verification (optional)
- [ ] Create authentication screens (SignIn, SignUp, ForgotPassword)
- [ ] Add authentication state persistence
- [ ] Handle authentication state changes
- [ ] Add loading states during authentication

### 1.3 User Profile Management

- [ ] Create User type/interface (extends Member with userId, email, displayName)
- [ ] Create user profile collection in Firestore
- [ ] Implement user profile creation on signup
- [ ] Implement user profile update
- [ ] Add profile picture upload (optional, future)
- [ ] Create user profile screen

---

## Phase 2: Data Migration & Cloud Storage

### 2.1 Data Structure Design

- [ ] Design Firestore collections:
  - `users/{userId}` - User profiles
  - `groups/{groupId}` - Group data
  - `groupMembers/{groupId}/{memberId}` - Member data
  - `tasks/{groupId}/{taskId}` - Task data
  - `groupInvitations/{inviteId}` - Invitation codes/links
  - `subscriptions/{userId}` - Subscription data
- [ ] Define data models with Firebase compatibility
- [ ] Plan data migration strategy (local → cloud)
- [ ] Add versioning for data migrations

### 2.2 Cloud Storage Service

- [ ] Create `services/firebase-service.ts` for Firestore operations
- [ ] Implement CRUD operations for groups
- [ ] Implement CRUD operations for members
- [ ] Implement CRUD operations for tasks
- [ ] Implement real-time listeners for data changes
- [ ] Add offline persistence support
- [ ] Implement data synchronization (local ↔ cloud)
- [ ] Add conflict resolution strategy
- [ ] Implement data migration from AsyncStorage to Firestore

### 2.3 Store Refactoring

- [ ] Refactor `use-app-store.ts` to support both local and cloud modes
- [ ] Add mode detection (local vs authenticated)
- [ ] Implement dual storage (local fallback + cloud sync)
- [ ] Add sync status indicator
- [ ] Handle offline mode gracefully
- [ ] Add sync queue for offline operations
- [ ] Implement optimistic updates

---

## Phase 3: Group Sharing & Invitations

### 3.1 Invitation System

- [ ] Design invitation code generation (6-8 character alphanumeric)
- [ ] Create invitation link generation (deep links)
- [ ] Create `groupInvitations` collection structure
- [ ] Implement invitation creation (owner generates code/link)
- [ ] Implement invitation expiration (optional, e.g., 7 days)
- [ ] Add invitation limit per group (configurable)
- [ ] Create invitation sharing UI (code display, link copy)

### 3.2 Invitation Acceptance Flow

- [ ] Create invitation acceptance screen
- [ ] Implement code validation
- [ ] Implement deep link handling for invitation links
- [ ] Add user to group members on acceptance
- [ ] Create welcome flow for new members
- [ ] Handle duplicate invitations
- [ ] Handle expired invitations
- [ ] Add invitation status tracking (pending, accepted, expired)

### 3.3 Role-Based Access Control

- [ ] Define role types: `owner`, `member`
- [ ] Add role field to group members
- [ ] Implement permission checks:
  - Owner: Full access (create/edit/delete groups, tasks, members)
  - Member: Limited access (mark done, skip, view only)
- [ ] Create permission utility functions
- [ ] Add UI restrictions based on role
- [ ] Hide edit/delete buttons for members
- [ ] Add role badges in UI
- [ ] Implement role change (owner can promote/demote)

---

## Phase 4: Real-Time Sync

### 4.1 Real-Time Listeners

- [ ] Implement Firestore real-time listeners for groups
- [ ] Implement Firestore real-time listeners for tasks
- [ ] Implement Firestore real-time listeners for members
- [ ] Add optimistic updates for better UX
- [ ] Handle concurrent edits (conflict resolution)
- [ ] Add presence indicators (who's online)
- [ ] Implement typing indicators (optional, future)

### 4.2 Sync Status & Offline Support

- [ ] Create sync status indicator component
- [ ] Show sync status in UI (syncing, synced, error)
- [ ] Implement offline queue for operations
- [ ] Sync queued operations when online
- [ ] Handle sync errors gracefully
- [ ] Add manual sync trigger
- [ ] Show last sync timestamp

### 4.3 Notification System Updates

- [ ] Update notification system for cloud mode
- [ ] Sync notification preferences across devices
- [ ] Implement push notifications via FCM (Firebase Cloud Messaging)
- [ ] Add notification permissions for cloud users
- [ ] Send notifications when tasks assigned to you
- [ ] Send notifications when tasks completed by others

---

## Phase 5: Subscription & Payment Integration

### 5.1 Subscription Model Design

- [ ] Define subscription tiers:
  - Free: Limited groups/tasks, no invitations
  - Premium: Unlimited groups/tasks, unlimited invitations
- [ ] Create subscription plans (monthly/annual)
- [ ] Design subscription benefits UI
- [ ] Create subscription store (`store/use-subscription-store.ts`)
- [ ] Add subscription status to user profile

### 5.2 Payment Integration

- [ ] Choose payment provider (RevenueCat recommended for React Native)
- [ ] Set up RevenueCat account (or Stripe/alternative)
- [ ] Configure products in App Store Connect (iOS)
- [ ] Configure products in Google Play Console (Android)
- [ ] Integrate RevenueCat SDK
- [ ] Implement purchase flow
- [ ] Implement restore purchases
- [ ] Handle subscription status changes
- [ ] Add subscription status checks
- [ ] Implement subscription renewal handling

### 5.3 Subscription UI

- [ ] Create subscription/pricing screen
- [ ] Create upgrade prompt screens
- [ ] Add subscription status in settings
- [ ] Show feature limitations for free users
- [ ] Add "Upgrade" CTAs throughout app
- [ ] Create subscription management screen
- [ ] Add subscription expiration warnings

### 5.4 Feature Gating

- [ ] Implement feature gates based on subscription
- [ ] Limit group creation for free users (e.g., max 3 groups)
- [ ] Limit task creation for free users (e.g., max 10 tasks per group)
- [ ] Disable invitations for free users
- [ ] Show upgrade prompts when limits reached
- [ ] Add usage tracking (groups/tasks count)

---

## Phase 6: UI/UX Updates

### 6.1 Onboarding & Authentication Screens

- [ ] Create welcome/onboarding flow
- [ ] Create sign up screen
- [ ] Create sign in screen
- [ ] Create forgot password screen
- [ ] Add "Continue as Guest" option (local mode)
- [ ] Create account creation success screen
- [ ] Add smooth transitions between auth states

### 6.2 Group Sharing UI

- [ ] Add "Share Group" button in group screen
- [ ] Create invitation modal/screen
- [ ] Add invitation code display
- [ ] Add "Copy Link" functionality
- [ ] Add invitation list (pending invitations)
- [ ] Add member list with roles
- [ ] Add "Remove Member" functionality (owner only)
- [ ] Add role badges

### 6.3 Settings Updates

- [ ] Add "Account" section in settings
- [ ] Add sign out option
- [ ] Add subscription status display
- [ ] Add "Manage Subscription" link
- [ ] Add "Upgrade to Premium" option
- [ ] Show sync status
- [ ] Add "Sync Now" button

---

## Phase 7: Testing & Migration

### 7.1 Testing

- [ ] Test authentication flows (sign up, sign in, sign out)
- [ ] Test data migration from local to cloud
- [ ] Test invitation creation and acceptance
- [ ] Test role-based permissions
- [ ] Test real-time sync across multiple devices
- [ ] Test offline mode and sync queue
- [ ] Test subscription purchase flow
- [ ] Test feature gating
- [ ] Test concurrent edits and conflicts
- [ ] Performance testing with large datasets

### 7.2 Data Migration

- [ ] Create migration utility
- [ ] Implement one-time migration flow
- [ ] Add migration progress indicator
- [ ] Handle migration errors
- [ ] Add migration rollback option
- [ ] Test migration with various data sizes
- [ ] Add migration analytics

### 7.3 Backward Compatibility

- [ ] Maintain local mode for users who don't sign up
- [ ] Allow users to switch between local and cloud modes
- [ ] Handle users who sign out (revert to local mode)
- [ ] Ensure existing local data remains accessible
- [ ] Add "Export Data" for local users
- [ ] Add "Import Data" for cloud users

---

## Phase 8: Security & Performance

### 8.1 Security

- [ ] Design Firestore security rules:
  - Users can only read/write their own data
  - Group owners have full access
  - Group members have limited access
  - Invitations are readable by code
- [ ] Implement input validation
- [ ] Add rate limiting for API calls
- [ ] Implement invitation code expiration
- [ ] Add abuse prevention (spam invitations)
- [ ] Secure subscription data
- [ ] Add data encryption for sensitive fields

### 8.2 Performance

- [ ] Optimize Firestore queries (indexes)
- [ ] Implement pagination for large lists
- [ ] Add data caching strategy
- [ ] Optimize real-time listeners (unsubscribe when not needed)
- [ ] Reduce unnecessary syncs
- [ ] Add performance monitoring
- [ ] Optimize bundle size

---

## Technical Considerations

### Dependencies to Add

- `@react-native-firebase/app` or `expo-firebase` (Firebase SDK)
- `@react-native-firebase/firestore` (Firestore)
- `@react-native-firebase/auth` (Authentication)
- `@react-native-firebase/messaging` (Push notifications)
- `react-native-purchases` (RevenueCat for subscriptions)
- `expo-linking` (already installed, for deep links)

### File Structure

```
services/
  firebase-service.ts
  auth-service.ts
  subscription-service.ts
  invitation-service.ts

store/
  use-auth-store.ts (new)
  use-subscription-store.ts (new)
  use-app-store.ts (refactored)

app/
  (auth)/
    sign-in.tsx
    sign-up.tsx
    forgot-password.tsx
  invite/
    [code].tsx (invitation acceptance)
  subscription/
    pricing.tsx
    manage.tsx
```

### Data Model Updates

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  subscriptionStatus: 'free' | 'premium' | 'expired';
  subscriptionExpiresAt?: string;
}

interface Group {
  // ... existing fields
  ownerId: string; // User ID of owner
  members: GroupMember[]; // Updated to include userId and role
}

interface GroupMember {
  id: string;
  userId?: string; // If linked to user account
  name: string;
  role: 'owner' | 'member';
  avatarColor: string;
  joinedAt: string;
}

interface GroupInvitation {
  id: string;
  groupId: string;
  code: string;
  link: string;
  createdBy: string; // User ID
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
}
```

---

## Estimated Timeline

- **Phase 1 (Firebase Setup & Auth):** 1-2 weeks
- **Phase 2 (Data Migration & Cloud Storage):** 2-3 weeks
- **Phase 3 (Group Sharing & Invitations):** 1-2 weeks
- **Phase 4 (Real-Time Sync):** 1-2 weeks
- **Phase 5 (Subscription & Payment):** 2-3 weeks
- **Phase 6 (UI/UX Updates):** 1-2 weeks
- **Phase 7 (Testing & Migration):** 1-2 weeks
- **Phase 8 (Security & Performance):** 1 week

**Total Estimated Time: 10-17 weeks (2.5-4 months)**

---

## Priority Order

1. **Phase 1 & 2** - Core infrastructure (Firebase + data migration)
2. **Phase 3** - Group sharing (main feature)
3. **Phase 4** - Real-time sync (enhances UX)
4. **Phase 5** - Subscriptions (monetization)
5. **Phase 6-8** - Polish and optimization

---

## Risks & Considerations

1. **Data Migration:** Need careful handling to avoid data loss
2. **Real-Time Sync:** Conflict resolution can be complex
3. **Subscription Compliance:** Must follow App Store/Play Store guidelines
4. **Backward Compatibility:** Need to maintain local mode for existing users
5. **Cost:** Firebase usage costs (Firestore reads/writes, storage)
6. **Performance:** Real-time listeners can impact performance with many groups
7. **Security:** Proper Firestore rules are critical
8. **Testing:** Need to test across multiple devices/users simultaneously

### To-dos

- [ ] Complete comprehensive testing of all core functionality (groups, members, tasks, rotation)
- [ ] Test app on real iOS and Android devices
- [ ] Test performance with large datasets (10+ groups, 50+ tasks)