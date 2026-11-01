# With-NestJs | API

## Getting Started

First, run the development server:

```bash
pnpm run dev
```

By default, your server will run at [http://localhost:3000](http://localhost:3000). You can use your favorite API platform like [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/) to test your APIs

You can start editing the demo **APIs** by modifying [linksService](./src/links/links.service.ts) provider.

### ⚠️ Note about build

If you plan to only build this app. Please make sure you've built the packages first.

## Learn More

To learn more about NestJs, take a look at the following resources:

- [Official Documentation](https://docs.nestjs.com) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- [Official NestJS Courses](https://courses.nestjs.com) - Learn everything you need to master NestJS and tackle modern backend applications at any scale.
- [GitHub Repo](https://github.com/nestjs/nest)


## Apple and Google sign-in

Native clients first call `POST /auth/social/challenge` with
`{ "provider": "apple" | "google" }`. The API returns `challenge_id` and a random
64-character hex `nonce`, valid for five minutes. Pass this exact nonce to
AppleAuthentication or Google Sign-In, then send the provider-issued token to
`POST /auth/social/signin`:

```json
{
  "provider": "apple",
  "challenge_id": "UUID returned by the challenge endpoint",
  "id_token": "provider-issued ID token",
  "name": "Optional Apple first-authorization display name"
}
```

The response uses the existing `{ access_token, refresh_token, user }` contract.
New accounts have `onboarded=false`. Existing accounts retain their user ID,
languages and learning data. Google display names come from signed token claims;
client names are used only for Apple's first-authorization display name.

Configure API environment variables before enabling the buttons in a client:

```dotenv
APPLE_CLIENT_IDS=digital.whitesquirrel.wordsapp
GOOGLE_WEB_CLIENT_IDS=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Both settings accept comma-separated audiences for multiple explicitly trusted
builds. Missing configuration disables only that provider (503). Native Apple
sign-in needs the bundle ID as audience, and no Apple signing key or client
secret. The Google audience must be the Web OAuth client ID used by the native
SDK, not its iOS or Android client ID. Configure the OAuth consent screen,
iOS bundle ID and Android package/signing-certificate SHA-1 in Google Cloud.
The mobile configuration is documented in `wordsapp/README.md`.

Token verification uses the providers' fixed JWKS endpoints, restricts JWTs to
RS256, and checks issuer, audience, expiration, subject and nonce. Challenges
are bound to the provider and consumed atomically with Redis `GETDEL`
(requires Redis 6.2+). Expired, reused and mismatched challenges return 401.
Provider tokens are never stored. Only `(provider, subject) -> user_id` is stored
in `social_identity`, so returning Apple users do not need to supply email/name
again. Private relay addresses are supported.

Verified provider email links an existing account only when the provider is
an authority for the address: Apple, Gmail or Google Workspace (`hd`). Google
accounts using a third-party address return 409 for an existing account, with
an instruction to sign in by email. Existing identities always resolve by
subject first. Per-identity and per-email PostgreSQL transaction locks serialize
concurrent social sign-ins. Tokens returned to clients omit password hashes.

Deployment order:

1. For `DB_SYNCHRONIZE=false`, review and run `scripts/add-social-identities.sql`
   against the intended database. With synchronization enabled, TypeORM creates
   the additive table from entity metadata. No existing columns change.
2. Deploy the API with provider audiences and Redis 6.2+ configured.
3. Enable Sign in with Apple for the App ID in Apple Developer; configure Google
   OAuth clients and mobile public client IDs, then rebuild the native app.
4. Verify first sign-in, returning sign-in, cancellation, private relay,
   onboarding and existing-account progress on actual iOS/Android devices.

Old mobile clients and email sign-in continue to use existing routes. Rolling
back the API leaves the additive identity table in place; preserve it to keep
provider associations when the feature is deployed again. No client-side DB,
SecureStore keys, or persisted progress format changes are required.
