# API Testing

## Test if backend is running:

```bash
curl https://api.254-capital.com/api/v1/employers/
```

Should return JSON with employers list.

## Test clients endpoint:

```bash
# Replace YOUR_TOKEN with actual admin token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.254-capital.com/api/v1/clients/
```

Should return JSON with clients list.

## Common Issues:

1. **CORS Error** - Backend CORS settings need to allow your frontend domain
2. **401 Unauthorized** - Token expired or invalid
3. **404 Not Found** - Endpoint doesn't exist (backend not deployed)
4. **500 Server Error** - Backend code error

## Get your token:

Open browser console on the app, type:
```javascript
localStorage.getItem('salary_checkoff_access_token')
```

Copy that token and use it in curl commands above.
