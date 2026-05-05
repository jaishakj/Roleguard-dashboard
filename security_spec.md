# Security Specification - RoleGuard Dashboard

## 1. Data Invariants
- A `Record` MUST belong to a valid `userId`.
- A user can only see their own `Record` unless they are an `admin`.
- `admin` role can read all `User` and `Record` documents.
- `editor` role can read and update their own records.
- `viewer` role can only read their own records.
- Users cannot change their own `role` field.
- Document IDs must be alphanumeric.

## 2. The "Dirty Dozen" Payloads (Deny Test Cases)
1. **Identity Theft**: User A tries to read Record of User B.
2. **Role Escalation**: Viewer tries to update their own role to 'admin'.
3. **Ghost Record**: Creating a record with a `userId` that doesn't match the authenticated user.
4. **Invalid Role**: Creating a user with role 'super-god'.
5. **ID Poisoning**: Creating a record with a 2KB string as ID.
6. **PII Leak**: Viewer tries to list all entries in `/users`.
7. **Shadow Update**: Updating a record with extra fields like `isModerated: true`.
8. **Time Travel**: Setting `createdAt` to a future date instead of `request.time`.
9. **Admin Spoof**: Authenticated user (non-admin) tries to delete another user's record.
10. **Orphan Record**: Creating a record for a `userId` that does not exist in `/users`.
11. **Malicious Content**: Injecting a 2MB string into `title`.
12. **Status Bypass**: (N/A for current schema, but good practice).

## 3. The Test Runner Plan
I will implement `firestore.rules` that address these cases.
