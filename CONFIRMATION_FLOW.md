# Email Confirmation Flow for Membership Registration

## Overview

This document describes the email confirmation flow implemented for the AL-SALAM E.V. membership registration system.

## Flow Description

### 1. User Registration

1. User fills out the membership registration form at `/[lang]/support`
2. Form includes personal info, contact info, and SEPA direct debit mandate
3. Upon submission, the system:
   - Validates all input data using Zod schema
   - Checks for duplicate email addresses
   - Generates a unique 64-character confirmation token (using crypto.randomBytes)
   - Inserts the membership record with status='pending' and the confirmation token
   - Sends a confirmation email to the user's email address

### 2. Confirmation Email

The confirmation email includes:

- Personalized greeting with first and last name
- Clear call-to-action button to confirm membership
- Information about what happens after confirmation (status becomes 'active', payment collection begins)
- Monthly fee amount (30 Euro)
- Contact information for questions

**Email is sent in the user's chosen language** (German, French, or Arabic)

### 3. User Clicks Confirmation Link

- Link format: `{BASE_URL}/api/membership/confirm?token={confirmationToken}`
- When clicked, the user is redirected to the confirmation API endpoint

### 4. Confirmation API Processing

The `/api/membership/confirm` endpoint:

1. Extracts the token from the query string
2. Looks up the membership record by confirmation token
3. Checks if the membership has already been confirmed
4. If already confirmed: redirects to `/de/support?confirmed=already`
5. If not yet confirmed:
   - Updates the membership status to 'active'
   - Sets confirmed_at timestamp to current time
   - Clears the confirmation_token (sets to NULL)
   - Redirects to `/de/support?confirmed=success`

### 5. Confirmation Success Page

The support page displays different messages based on the `confirmed` query parameter:

**Success (`?confirmed=success`)**:

- Green success banner with checkmark icon
- "Membership Confirmed!" heading
- Message: "Your membership has been successfully activated. We will soon begin the monthly fee collection."

**Already Confirmed (`?confirmed=already`)**:

- Blue info banner with info icon
- "Already Confirmed" heading
- Message: "Your membership has already been confirmed and is active."

## Database Schema Changes

### New Columns Added to `memberships` Table

```sql
confirmation_token VARCHAR(64)     -- Unique token for email confirmation
confirmed_at TIMESTAMP NULL        -- Timestamp when user confirmed
```

### New Index

```sql
INDEX idx_confirmation_token (confirmation_token)
```

## Status Flow

1. **pending** - Initial status after registration, before email confirmation
2. **active** - After user clicks confirmation link (payment collection can begin)
3. **approved/rejected** - Admin-managed statuses (can be added later)
4. **inactive** - Can be set by admin if needed

## Security Features

- 64-character random token (32 bytes hex-encoded)
- Token is cleared after successful confirmation (one-time use)
- Checks for already-confirmed memberships to prevent duplicate processing
- Token is indexed for fast lookups

## Environment Variables Required

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Change to production URL when deploying
DB_HOST=srv1805.hstgr.io
DB_USER=u917895091_alsalam
DB_PASSWORD=your_password
DB_NAME=u917895091_alsalam
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@alsalam-loerrach.org
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@alsalam-loerrach.org
```

## API Endpoints

### POST `/api/membership`

Registers a new membership and sends confirmation email.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1990-01-01",
  "gender": "male",
  "address": "123 Main St, City",
  "email": "john@example.com",
  "phone": "+49123456789",
  "maritalStatus": "single",
  "sepaAccountHolder": "John Doe",
  "sepaIban": "DE89370400440532013000",
  "sepaBic": "COBADEFFXXX",
  "sepaBank": "Bank Name",
  "sepaMandate": true,
  "lang": "de"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Membership registration successful"
}
```

### GET `/api/membership/confirm?token={token}`

Confirms a membership registration using the email confirmation token.

**Success Response:**

- Redirects to `/de/support?confirmed=success`

**Already Confirmed Response:**

- Redirects to `/de/support?confirmed=already`

**Error Response:**

```json
{
  "error": "Invalid or expired confirmation token"
}
```

## Translation Keys Added

All three language files (de.json, fr.json, ar.json) now include:

- `confirmationSuccess` - "Membership Confirmed!" heading
- `confirmationSuccessMessage` - Success message text
- `alreadyConfirmed` - "Already Confirmed" heading
- `alreadyConfirmedMessage` - Already confirmed message text

## Files Modified

1. `/database/create_memberships_table.sql` - Added confirmation_token and confirmed_at columns
2. `/src/app/api/membership/route.ts` - Generate and store confirmation token
3. `/src/lib/email.ts` - Added confirmationToken parameter and updated email templates
4. `/src/app/[lang]/support/page.tsx` - Added confirmation message display
5. `/src/i18n/dictionaries/de.json` - Added confirmation translations
6. `/src/i18n/dictionaries/fr.json` - Added confirmation translations
7. `/src/i18n/dictionaries/ar.json` - Added confirmation translations

## Files Created

1. `/src/app/api/membership/confirm/route.ts` - Confirmation API endpoint

## Testing Checklist

- [ ] Submit a new membership registration
- [ ] Check email inbox for confirmation email
- [ ] Verify email content and button styling
- [ ] Click confirmation link
- [ ] Verify redirect to success page with green banner
- [ ] Check database - status should be 'active', confirmed_at should be set, confirmation_token should be NULL
- [ ] Try clicking the confirmation link again
- [ ] Verify "Already Confirmed" message appears (blue banner)
- [ ] Test in all three languages (German, French, Arabic)

## Production Deployment Notes

1. Update `NEXT_PUBLIC_BASE_URL` in production environment to your live domain
2. Run database migration: `npm run init-db` or `node scripts/init-db.mjs`
3. Verify SMTP credentials are working in production
4. Test end-to-end flow in production environment
5. Consider adding email notification to admin when new membership is confirmed
