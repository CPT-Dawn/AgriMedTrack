# Contributing to AgriMedTrack

Thanks for stopping by. 🌾 This guide covers how to get set up and how to make changes that get merged.

## Before you start

- **Small fixes** like typos, small bugs, and polish can go straight to a pull request.
- **Bigger changes** like new features, data-model changes, or new dependencies should start as an [issue](https://github.com/CPT-Dawn/AgriMedTrack/issues). A five-minute chat can save you a weekend of rework.

## Setup

1. Fork the repo and clone your fork.
2. Run `npm install`.
3. Point [`services/firebase.ts`](services/firebase.ts) at **your own** Firebase project. Please don't test against the production one.
4. Run `npm start`.

## Branches and commits

- Branch off `main` and use a short, descriptive name, e.g. `feat/sale-reports` or `fix/expiry-badge`.
- Write commit messages in the present tense that say what the change does: `Add expiry filter to inventory`, not `stuff`.
- Keep each pull request to one change. Small PRs get reviewed faster.

## Conventions

| Area | Rule of thumb |
| :--- | :------------ |
| **Types** | Keep `types/`, hooks, and Firestore documents in sync. If a field changes, update all three. |
| **Data** | Follow the denormalized model in [`docs/datadesign.md`](docs/datadesign.md). Logs are append-only and never edited. |
| **Writes** | Multi-document writes belong in a transaction (or, eventually, a Cloud Function). |
| **UI** | Use tokens from [`theme/`](theme/index.ts) and the existing components. Don't hardcode colors. |
| **Feedback** | Use `useToast()` for messages and `useUI()` for confirmations. Please don't use `Alert.alert`. |
| **Stock** | Check available quantity before any sale operation. |

## Before you open a PR

- [ ] The app starts and the screens you touched behave correctly.
- [ ] Inventory, sales, and log flows still work if you changed anything in the data layer.
- [ ] `npx tsc --noEmit` passes.
- [ ] No secrets, credentials, or personal data are in the diff.
- [ ] Screenshots or a short clip are attached for UI changes.

## Reporting bugs

Open an issue with steps to reproduce, what you expected, what actually happened, and your device and OS. "It's broken" helps about as much as "the crop looks sad." 🙂

## Code of Conduct

By taking part, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

---

Thank you for helping this grow. 🌱
