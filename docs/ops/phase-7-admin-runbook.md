# Phase 7 Admin Runbook

This runbook covers the private Neon Auth admin area, dashboard, and inbox. Do not paste auth URLs, user IDs, cookie secrets, passwords, contact contents, or database rows into issues, reports, shell history, or chat.

## Access Model

- Neon Auth owns the admin identity and session cookies.
- The application authorizes exactly one user: the value stored in `ADMIN_USER_ID`.
- `/admin/login` is anonymous. `/admin`, `/admin/inbox`, admin queries, and admin mutations require the exact configured user ID.
- Neon currently warns that anyone on the web can sign up. Until Neon exposes a working restricted-signup control in this project UI, the app blocks signup-related `/api/auth/*` routes and rejects every non-admin user ID server-side.

## Verify The Single Administrator

1. Open the Neon Console project connected to Vercel.
2. Select the intended branch.
3. Open **Auth** -> **Users**.
4. Confirm there is exactly one intended administrator.
5. Open that user and confirm its ID matches the private `ADMIN_USER_ID` value configured in Vercel.
6. If any unexpected user exists, delete or disable it in Neon Auth. The app still rejects it unless its ID equals `ADMIN_USER_ID`.

## Emergency Revocation

To revoke access immediately:

1. Delete/disable the Neon Auth user, or replace `ADMIN_USER_ID` with a new approved user ID.
2. Redeploy the Vercel project so serverless functions receive the changed variable.
3. Verify the old session can no longer load `/admin`.

Rotating `ADMIN_USER_ID` or deleting/disabling the Neon Auth user is the emergency access-revocation control.

## Cookie Secret Rotation

1. Generate a new high-entropy `NEON_AUTH_COOKIE_SECRET`.
2. Set it in every required Vercel environment scope.
3. Redeploy.
4. Verify existing sessions are invalidated and the admin can sign in again.

## Login Rate Limit

- Admin login uses the application rate-limit table with scope `admin-login`.
- Limit: 5 attempts per request key per 900 seconds.
- Invalid email, unknown email, and wrong password return the same generic message.
- Recovery is to wait for the fixed window to expire; do not lower the limiter for testing.

## Outages

- Neon Auth/session errors redirect private pages to `/admin/login?reason=expired`.
- Login provider failures return a generic unavailable state.
- Database failures on dashboard/inbox show generic admin error states and never expose SQL/provider detail.

## Inbox Boundaries

- Inbox pages read 20 messages at a time using keyset pagination.
- Delete is permanent from the app UI. For accidental deletion, restore through Neon backup/restore tooling for the affected branch/database.
- Do not delete inherited real messages during Preview testing; only delete synthetic Preview records created for the test.

## Indexing And Caching

Verify:

- `/robots.txt` disallows `/admin`.
- `/admin/*` emits `X-Robots-Tag: noindex, nofollow, noarchive`.
- `/admin/*` and `/api/auth/*` emit `Cache-Control: private, no-store`.
- Admin pages export noindex metadata.

## Admin Analytics Exclusion

- Authenticated admin `/api/track` requests return the same generic `202` but skip rate limiting and analytics inserts.
- Contact messages submitted by the admin are saved, but the `contact_submit` analytics event is omitted.
- Anonymous public tracking and contact submissions retain Phase 6 behavior.

## Preview Lifecycle

1. Use a Vercel Preview deployment with its isolated Neon branch.
2. Confirm branch-specific Neon Auth URL/config is present without printing values.
3. Sign in only through `/admin/login`.
4. Exercise dashboard ranges and one synthetic inbox record.
5. Delete only synthetic Preview data.
6. Remove any temporary local credential file before committing or pushing.

## Production Promotion And Rollback

- Do not promote Phase 7 to Production until the draft PR, Preview verification, and final user approval are complete.
- Rollback order: revert the Vercel deployment first, then adjust Neon Auth/admin env values only if access must be revoked.
- Do not run manual Phase 7 migrations against Production outside the approved deployment path.
