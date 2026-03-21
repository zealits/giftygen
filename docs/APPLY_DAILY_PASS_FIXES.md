# Daily Pass: INR 0 / “Gift value” fix

## Why you saw **INR 0** and **Gift value**

1. **Wallet API** (`POST /api/wallet/generate-wallet-pass`) only received `formData`. It did **not** send `templateType` or `dailyFreeConfig`, so the server could not treat the card as a Daily Pass even when the UI did.
2. **Backend** `isDailyPassGiftCard` missed some legacy cards (e.g. **“Daily”** tag without `templateType`, or odd `amount` values).
3. **Listing UI** only checked `templateType === "dailyFree"`, so cards without that field still showed **₹0** and **Gift Value**.

## What was changed (already in repo)

- `utils/walletPassHelpers.js` — tag + merge rules so Daily Pass is detected and client `dailyFreeConfig` merges correctly.
- `frontend/src/utils/giftCardDisplay.js` — `isDailyPassCard()` + `getDailyPassOfferText()` shared on the frontend.
- `frontend/src/pages/marketing/BusinessPage.js` — Daily Pass row shows offer text, not **Gift value** / ₹0.

## Files you must apply locally (IDE had them locked)

These **updated copies** are in the repo; replace the originals when nothing has them open:

| Replace (original) | With |
|--------------------|------|
| `frontend/src/pages/user/GiftCardForm.js` | `frontend/src/pages/user/GiftCardForm.updated.js` |
| `frontend/src/pages/user/UserLanding.js` | `frontend/src/pages/user/UserLanding.updated.js` |
| `frontend/src/pages/user/GiftCardDetails.js` | `frontend/src/pages/user/GiftCardDetails.updated.js` |

**PowerShell** (from project root, after closing those files in the editor):

```powershell
Copy-Item -Force frontend\src\pages\user\GiftCardForm.updated.js frontend\src\pages\user\GiftCardForm.js
Copy-Item -Force frontend\src\pages\user\UserLanding.updated.js frontend\src\pages\user\UserLanding.js
Copy-Item -Force frontend\src\pages\user\GiftCardDetails.updated.js frontend\src\pages\user\GiftCardDetails.js
```

Then delete the `*.updated.js` files if you no longer need backups.

## After deploying

1. Restart the **Node** server so `walletPassHelpers.js` is loaded.
2. **Add a new pass** to Google/Apple Wallet — old passes keep old text until re-added.
3. Ensure gift cards in Mongo have `dailyFreeConfig` (or at least **Daily** tag / `templateType`) for the clearest behavior.
