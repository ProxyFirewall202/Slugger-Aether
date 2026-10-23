Slugger NEO v0.5.4.1 — Username Accounts & Cloud Social

PUBLISHING
- GitHub Pages publishing folder is docs/.
- For this modular build, publish all contents of docs/ together: index.html, css/, js/, icons/, and manifest.webmanifest. Do not upload only index.html, because it references external modules.
- Keep cloudflare-worker/ OUT of docs/. It is server-side code for the Cloudflare dashboard.
- The TURN Worker URL is preserved at https://slugger-turn-ice.tholloway540.workers.dev/ice-servers. Username login uses the same Worker at /username-token.

v0.5.4.1 CHANGES
- Replaced email/password controls with username-only sign-in through the existing Cloudflare Worker. Anyone who knows or guesses a username can access that account. The login screen displays this warning.
- Usernames are mapped server-side to Firebase custom tokens. The Worker uses a Cloudflare Secret named FIREBASE_SERVICE_ACCOUNT_JSON and a Firestore usernameIndex.
- The Worker can match an existing Firestore user profile by username if exactly one old profile matches, preserving that Firebase UID and its existing save/chat identity. Duplicate legacy usernames are rejected rather than choosing arbitrarily.
- Friend ID SLUG-XXXX is persisted on the cloud user profile and restored at subsequent sign-ins/devices. Only one active PeerJS session can claim a given ID at a time.
- Successful peer-to-peer connections automatically add each other to cloud friend lists when both are username accounts. The separate friend-request action was removed; use Connect with a friend's Friend ID.
- Authenticated direct messages are written to Firestore even while the recipient is offline and the recent message history is hydrated from Firestore on another device. If cloud storage fails, the UI reports that the message was only sent directly and not saved to cloud.
- Existing local friend caches from the earlier unscoped version are best-effort migrated on the first username login. Contacts that have no cloud account cannot be found/reconnected when offline; reconnect to those contacts to sync them once they use username accounts.
- The earlier mobile controls, CSS, PWA assets, gameplay, PvP, connection modes, and TURN endpoint are retained.

ONE-TIME CLOUDFLARE UPDATE FOR v0.5.4.1
The current Worker must be redeployed with cloudflare-worker/worker.js. Keep the existing METERED_DOMAIN, ALLOWED_ORIGINS, and METERED_CREDENTIAL_API_KEY settings. Add FIREBASE_SERVICE_ACCOUNT_JSON as a Cloudflare Worker Secret containing the full service-account JSON. The associated service account needs Cloud Datastore User (roles/datastore.user) on the Firebase project. Keep its JSON secret out of docs/ and GitHub. See cloudflare-worker/README.txt for click-by-click instructions.

FIRESTORE ACCESS
The game uses its existing authenticated Firestore client to save profiles, saves, presence, friend IDs and chat messages. Existing Firestore Security Rules must allow authenticated users to read the public user-profile fields needed to resolve friends, update their own users/{uid} and presence/{uid} documents, read/write their own saves/{uid}, and read/write permitted chats/{chatId}/messages. Do not replace existing rules blindly. If the app reports permission-denied for DMs, inspect the current Firebase Console > Firestore Database > Rules before changing rules; the code displays the cloud write error in the game diagnostics.

NORMAL FUTURE RELEASES
- Publish the new docs/ contents to GitHub Pages.
- Preserve the constants in js/06-turn-peer-lifecycle.js and js/01-core-save-auth.js that point to the existing Worker endpoints unless the Worker URL is intentionally changed.
- No Metered or service-account secret needs to be edited for ordinary game releases. Update a Worker secret only if the related credential is rotated/revoked or compromised, or if the backend design changes.

KNOWN LIMITS
- Username-only login has no password and no ownership verification by design. Anyone can impersonate a username. Do not use it to protect sensitive data.
- Only one device can actively claim the same stable PeerJS Friend ID at once. Sign out or close the session on the first device before signing into that account on another device.
- Cloud DMs are supported between username accounts; Guest-only messages remain direct/local and are not guaranteed to sync across devices. The UI loads the latest 60 cloud messages for a chat.


v0.5.4.1 LOGIN TROUBLESHOOTING
- Username sign-in now shows which stage failed (Cloudflare request, Firebase custom-token sign-in, or profile load) instead of a generic network error.
- The Worker has a safe GET /health endpoint. From the live game site, open https://slugger-turn-ice.tholloway540.workers.dev/health in a new tab; if the browser rejects the origin, check ALLOWED_ORIGINS. The response only reports whether configuration values are present; it never returns secrets.
- ALLOWED_ORIGINS can be a full GitHub Pages URL by mistake; this Worker normalizes configured URLs to their origin, but exact scheme/hostname still must match.
- If Firebase reports auth/network-request-failed after the Worker returns HTTP 200, check Firebase Authentication availability, API-key HTTP referrer restrictions, and browser console network errors.
