# Authentication Service

This service provides comprehensive authentication functionality for the OneRoot application, including JWT token management, refresh tokens, and OTP-based authentication.

## Features

- **JWT Token Management**: Secure access and refresh token handling
- **Automatic Token Refresh**: Seamless token renewal on expiration
- **Mobile OTP Authentication**: Phone number + OTP login only
- **Token Verification**: Validate token authenticity and user data
- **User Profile Management**: Update profile information
- **Device ID Management**: Unique device identification for security

## API Endpoints

### Authentication
- `POST /auth/login` - Login with mobile number, OTP, and device ID
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `GET /auth/verify-token` - Verify token validity
- `POST /auth/logout` - User logout

### OTP
- `POST /otp/send` - Send OTP to mobile number with template
- `POST /otp/verify` - Verify OTP code

### User Management
- `PUT /user/update` - Update user profile

## Usage Examples

### Basic Authentication

```typescript
import { authService } from './authService';

// Login with mobile number and OTP
const deviceId = authService.generateDeviceId();
const loginResponse = await authService.login({
  mobileNumber: '+919606031878',
  otp: '6072',
  deviceId: deviceId
});

// Send OTP to mobile number
const otpResponse = await authService.sendOTP('9552948461', 'Markhet+Buyer');

// Check authentication status
const isAuthenticated = authService.isAuthenticated();
```

### Token Management

```typescript
// Get current tokens
const accessToken = authService.getAccessToken();
const refreshToken = authService.getRefreshToken();

// Refresh access token
const refreshed = await authService.refreshAccessToken();

// Verify token
const verification = await authService.verifyToken();
```

### User Operations

```typescript
// Get current user
const user = await authService.getCurrentUser();

// Update profile
const updateResponse = await authService.updateProfile({
  firstName: 'John',
  lastName: 'Doe'
});


```

### Automatic Token Refresh

The service automatically handles token refresh when making authenticated API calls. If a request returns a 401 status, the service will:

1. Attempt to refresh the access token using the refresh token
2. Retry the original request with the new token
3. Throw an error if refresh fails

```typescript
// This will automatically handle token refresh if needed
const response = await authService.updateProfile(profileData);
```

## Error Handling

All methods include comprehensive error handling:

```typescript
try {
  const response = await authService.login(credentials);
  if (response.success) {
    // Handle success
  } else {
    // Handle API error
    console.error(response.message);
  }
} catch (error) {
  // Handle network or unexpected errors
  console.error('Login failed:', error);
}
```

## Token Storage

The service manages tokens in memory during the session. For persistent storage across app restarts, consider:

1. **AsyncStorage** for React Native
2. **SecureStore** for sensitive data
3. **Redux Persist** for state management

## Security Features

- **Bearer Token Authentication**: Secure API communication
- **Automatic Token Refresh**: Prevents session expiration
- **Token Validation**: Verifies token authenticity
- **Secure Logout**: Clears all tokens on logout

## Configuration

Update the `API_CONFIG.BASE_URL` in `src/config/api.ts` with your backend URL:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-api.com', // Replace with actual backend URL
  // ... other config
};
```

## Dependencies

- React Native Fetch API
- TypeScript for type safety
- Expo for React Native development

## Testing

Use the `authServiceExample.ts` file for testing individual methods and understanding the service behavior.

## Notes

- Tokens are stored in memory and cleared on logout
- Automatic token refresh is handled transparently
- All API calls include proper error handling
- The service supports mobile OTP authentication only (no email/password)
- Device ID is required for login security
