# Membership Registration System - Setup Guide

## Overview

The membership registration system allows users to register for AL-SALAM E.V. membership through a comprehensive form that includes:

- Personal information (name, birth date, gender, marital status)
- Contact information (address, email, phone)
- SEPA direct debit mandate for automatic monthly payments (30 Euro)

## Features

✅ Multi-language support (German, French, Arabic)
✅ Email confirmation sent automatically upon registration
✅ MySQL database storage for all member data
✅ SEPA mandate acceptance with full legal text
✅ Form validation with Zod
✅ Responsive design

## Database Setup

### Prerequisites

- MySQL 5.7+ or MariaDB 10.2+
- Database credentials configured in `.env.local`

### Initial Setup

1. Ensure your `.env.local` file contains the correct database credentials:

   ```
   DB_HOST=srv1805.hstgr.io
   DB_PORT=3306
   DB_USER=u917895091_admin
   DB_PASSWORD=Z[XW?3i*kX2
   DB_NAME=u917895091_alsalam
   ```

2. Run the database initialization script:
   ```bash
   npm run init-db
   ```

This creates the `memberships` table with the following structure:

### Database Schema

**Table: `memberships`**

| Column                | Type                   | Description                               |
| --------------------- | ---------------------- | ----------------------------------------- |
| id                    | INT AUTO_INCREMENT     | Primary key                               |
| first_name            | VARCHAR(100)           | Member's first name                       |
| last_name             | VARCHAR(100)           | Member's last name                        |
| birth_date            | DATE                   | Date of birth                             |
| gender                | ENUM('male', 'female') | Gender                                    |
| address               | TEXT                   | Full address                              |
| email                 | VARCHAR(255) UNIQUE    | Email address (used for authentication)   |
| phone                 | VARCHAR(50)            | Phone number                              |
| marital_status        | ENUM(...)              | single/married/divorced/widowed           |
| sepa_account_holder   | VARCHAR(255)           | SEPA account holder name                  |
| sepa_iban             | VARCHAR(34)            | IBAN number                               |
| sepa_bic              | VARCHAR(11)            | BIC code (optional)                       |
| sepa_bank             | VARCHAR(255)           | Bank name                                 |
| sepa_mandate_accepted | BOOLEAN                | SEPA mandate acceptance                   |
| status                | ENUM(...)              | pending/approved/rejected/active/inactive |
| created_at            | TIMESTAMP              | Registration date                         |
| updated_at            | TIMESTAMP              | Last update date                          |

## Email Configuration

Email confirmations are sent using the SMTP settings from `.env.local`:

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@alsalam-loerrach.org
SMTP_PASS=gjoSNrBY1R83yGC*
FROM_EMAIL=noreply@alsalam-loerrach.org
```

## API Endpoints

### POST `/api/membership`

Register a new member

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "birthDate": "YYYY-MM-DD",
  "gender": "male" | "female",
  "address": "string",
  "email": "string",
  "phone": "string",
  "maritalStatus": "single" | "married" | "divorced" | "widowed",
  "sepaAccountHolder": "string",
  "sepaIban": "string",
  "sepaBic": "string (optional)",
  "sepaBank": "string",
  "sepaMandate": true,
  "lang": "de" | "fr" | "ar"
}
```

**Response (Success - 201):**

```json
{
  "success": true,
  "message": "Membership registration successful"
}
```

**Response (Error - 400):**

```json
{
  "error": "This email is already registered"
}
```

## Form Fields

### Personal Information

- **First Name** (required)
- **Last Name** (required)
- **Birth Date** (required)
- **Gender** (required): Male/Female
- **Marital Status** (required): Single/Married/Divorced/Widowed

### Contact Information

- **Address** (required): Full address with street, postal code, city
- **Email** (required): Used for authentication and confirmation
- **Phone** (required): Supports German (+49), French (+33), Swiss (+41) formats

### SEPA Direct Debit Mandate

- **Account Holder Name** (required)
- **IBAN** (required): International Bank Account Number
- **BIC** (optional): Bank Identifier Code
- **Bank Name** (required)
- **Mandate Acceptance** (required): Legal agreement for automatic debit

## Monthly Fee

**30 Euro per month** - Automatically debited via SEPA mandate

## Creditor Information

- **Creditor ID**: DE05ZZZ00002617424
- **Payee**: AL-SALAM E.V.

## Testing

To test the registration system:

1. Navigate to `/de/support`, `/fr/support`, or `/ar/support`
2. Fill out the membership form
3. Submit the registration
4. Check the database for the new entry
5. Verify the confirmation email was sent

## Troubleshooting

### Database Connection Issues

- Verify `.env.local` credentials are correct
- Check if the database server is accessible
- Ensure the database exists and user has proper permissions

### Email Not Sending

- Verify SMTP credentials in `.env.local`
- Check SMTP server is accepting connections on port 587
- Review email logs in the terminal/console

### Form Validation Errors

- All required fields must be filled
- Email must be valid format
- IBAN must be at least 15 characters
- SEPA mandate must be accepted

## Security Notes

- Passwords and sensitive data are stored in `.env.local` (not committed to git)
- Email addresses are unique (no duplicates allowed)
- All form inputs are validated server-side with Zod
- SEPA mandate acceptance is legally binding

## Dependencies

- `mysql2`: MySQL database driver
- `nodemailer`: Email sending
- `zod`: Schema validation
- `dotenv`: Environment variable loading
