# Firebase Security Rules

Add these rules to your Firebase Realtime Database to limit write rate and protect data:

```json
{
  "rules": {
    "bills": {
      "$billId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['billName', 'people', 'items', 'payments', 'updatedAt'])",
        "billName": {
          ".validate": "newData.isString() && newData.val().length <= 100"
        },
        "people": {
          ".validate": "newData.hasChildren()",
          "$personId": {
            ".validate": "newData.hasChildren(['id', 'name']) && newData.child('id').val() === $personId && newData.child('name').isString() && newData.child('name').val().length > 0"
          }
        },
        "items": {
          "$itemId": {
            ".validate": "newData.hasChildren(['id', 'name', 'price', 'payerId', 'sharedBy']) && newData.child('id').val() === $itemId && newData.child('price').isNumber() && newData.child('price').val() > 0"
          }
        },
        "updatedAt": {
          ".validate": "newData.isNumber()"
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
