# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

```
GET /health
```

Returns server status.

### Authentication

#### Google OAuth
```
GET /auth/google
```

#### GitHub OAuth
```
GET /auth/github
```

#### Refresh Token
```
POST /auth/refresh
```

#### Logout
```
POST /auth/logout
```

### Users

#### Get Current User
```
GET /users/me
```

#### Update User Profile
```
PUT /users/me
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message"
  }
}
```

