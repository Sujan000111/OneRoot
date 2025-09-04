# Mobile OTP Authentication Summary

## Overview
This authentication service provides **mobile number + OTP authentication only**. No email/password functionality is included.

## API Endpoints

### 1. Send OTP
- **Endpoint**: `POST {{BASE_URL}}/otp/send`
- **Request Body**:
```json
{
  "template": "Markhet+Buyer",
  "mobileNumber": "9552948461"
}
```

### 2. Login with OTP
- **Endpoint**: `POST {{BASE_URL}}/auth/login`
- **Request Body**:
```json
{
  "mobileNumber": "+919606031878",
  "otp": "6072",
  "deviceId": "redmi-6-pro-unique-device-id"
}
```

### 3. Refresh Token
- **Endpoint**: `POST {{BASE_URL}}/auth/refresh`
- **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Verify Token
- **Endpoint**: `GET {{BASE_URL}}/auth/verify-token`
- **Headers**: `Authorization: Bearer {accessToken}`

## Usage Examples

### Send OTP
```typescript
import { authService } from './authService';

const otpResponse = await authService.sendOTP('9552948461', 'Markhet+Buyer');
```

### Login with OTP
```typescript
const deviceId = authService.generateDeviceId();
const loginResponse = await authService.login({
  mobileNumber: '+919606031878',
  otp: '6072',
  deviceId: deviceId
});
```

### Check Authentication
```typescript
const isAuthenticated = authService.isAuthenticated();
const accessToken = authService.getAccessToken();
```

## Key Features

✅ **Mobile OTP Only** - No email/password  
✅ **Device ID Required** - Security enhancement  
✅ **JWT Tokens** - Access + Refresh tokens  
✅ **Auto Token Refresh** - Seamless experience  
✅ **Token Verification** - Validate authenticity  

## What's NOT Included

❌ Email/password authentication  
❌ Password change/reset  
❌ Email-based features  

## Response Structure

### Login Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### OTP Send Response
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

## Security Features

- **Device ID**: Each login requires unique device identifier
- **Bearer Tokens**: Secure API communication
- **Token Refresh**: Automatic renewal on expiration
- **Token Validation**: Verify token authenticity

## Testing

Use `apiTestExamples.ts` to test all functionality:
```typescript
import { runAllTests } from './apiTestExamples';

// Run complete test suite
await runAllTests();
```

