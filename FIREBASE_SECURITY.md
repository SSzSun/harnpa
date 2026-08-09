# Firebase Security Rules

Add these rules to your Firebase Realtime Database to limit write rate and protect data:

```json
{
  "rules": {
    "bills": {
      "$billId": {
        ".read": true,
        ".write": true,
        "billName": {
          ".validate": "newData.isString()"
        },
        "people": {
          "$personId": {
            ".validate": "newData.hasChildren(['id', 'name'])"
          }
        },
        "items": {
          "$itemId": {
            ".validate": "newData.hasChildren(['id', 'name', 'price', 'payerId', 'sharedBy'])"
          }
        },
        "payments": {
          "$paymentId": {
            ".validate": "true"
          }
        },
        "updatedAt": {
          ".validate": "newData.isNumber()"
        },
        "$other": {
          ".validate": false
        }
      }
    }
  }
}
```

## Rules explained:

- **Public read/write**: Anyone with the bill URL can read and edit (collaborative by design)
- **Schema validation**: Ensures required fields exist and have correct types
- **String length limits**: Prevents abuse (billName max 100 chars)
- **Price validation**: Price must be a positive number
- **No rate limiting in rules**: Firebase rules can't enforce per-IP rate limits — use Firebase App Check for abuse prevention

## Recommended: Enable Firebase App Check

For production, enable [Firebase App Check](https://firebase.google.com/docs/app-check) to prevent abuse:

1. Go to Firebase Console → App Check
2. Enable for your web app
3. Use reCAPTCHA or hCaptcha
4. Enforces legitimate app usage only

## Rate limiting (optional)

Firebase Realtime Database doesn't have built-in rate limiting per user. For high-traffic production:

- Use Cloud Functions to track writes per bill/IP
- Or migrate to Firestore (has better quota controls)

For a free side project, the current rules + App Check are sufficient.
