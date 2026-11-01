# Security Policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems.

Report them privately through [GitHub Security Advisories](https://github.com/CPT-Dawn/AgriMedTrack/security/advisories/new). Include:

- what you found and where,
- steps to reproduce,
- the potential impact.

You'll get an acknowledgement as soon as possible, and we'll keep you updated until it's fixed.

## A note on Firebase config

The Firebase web config in [`services/firebase.ts`](services/firebase.ts) is a **client identifier, not a secret**. Every Firebase client app ships one. Data is protected by **Firestore Security Rules and Authentication**, not by keeping the config hidden.

If you deploy your own copy:

- use your own Firebase project,
- lock down Firestore rules so only signed-in users can read or write,
- restrict your API key to your app's bundle ID or package name in the Google Cloud console.

## Supported versions

Only the latest commit on `main` gets security fixes.
