# Security Guidelines

## Authentication & Authorization

### Supabase Auth Implementation

- **JWT-based Authentication**: Secure token-based authentication using Supabase Auth
- **Social Login**: Secure OAuth integration with Kakao and Google
- **Email Verification**: Required for email-based signups
- **Password Policies**: Minimum 8 characters with complexity requirements
- **Session Management**: Secure session handling with proper expiration

### Authorization Controls

- **Row Level Security (RLS)**: Supabase RLS policies to restrict data access
- **Protected Routes**: Client-side and server-side route protection
- **Role-Based Access**: Owner-only access to invitation management

## Data Protection

### Personal Information Handling

- **Data Minimization**: Collect only necessary personal information
- **Secure Storage**: Encrypted storage of sensitive information
- **Data Retention**: Clear policies on data retention periods
- **User Deletion**: Complete account deletion functionality

### API Security

- **Input Validation**: Zod schema validation for all API inputs
- **Rate Limiting**: Prevent abuse through rate limiting
- **CORS Policies**: Proper Cross-Origin Resource Sharing configuration
- **Error Handling**: Secure error responses without leaking implementation details

## File Upload Security

### Supabase Storage Security

- **File Type Validation**: Restrict uploads to allowed file types (images only)
- **File Size Limits**: Maximum 5MB per upload
- **Metadata Stripping**: Remove EXIF data from uploaded images
- **Virus Scanning**: Optional virus scanning for uploaded files

## Frontend Security

- **XSS Prevention**: Proper escaping of user-generated content
- **CSP Headers**: Content Security Policy implementation
- **HTTPS Only**: Force HTTPS for all connections
- **Secure Cookies**: HttpOnly and Secure flags for cookies

## Implementation Status

- ✅ Basic Supabase Auth integration
- ✅ Protected routes implementation
- ✅ Input validation with Zod
- 🔄 Row Level Security policies implementation
- 🔄 File upload security measures
- ⏳ Rate limiting implementation
- ⏳ Complete security audit
