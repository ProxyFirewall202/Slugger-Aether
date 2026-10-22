Slugger (NEO) v0.5.1 Hotfix — GitHub Pages PWA bundle with automatic ICE/TURN fallback, manual connection modes, and connection diagnostics

DEPLOY
Deploy every file and folder in this bundle to the same directory in your GitHub Pages site. Keep index.html, manifest.webmanifest, and icons/ together.

CONFIGURE TURN ONCE IN THE CODE
1. Any TURN credential previously shared in chat should be disabled or deleted. Create a fresh Metered credential before publishing.
2. Wait up to two minutes after creating the fresh credential.
3. Copy the Metered app hostname from Developers (it ends in .metered.live). On the TURN credential row, choose Get credential -> Show API Key and copy the credential-scoped API key.
4. In index.html, search for TURN_AUTO_CONFIG. Replace YOUR_APP.metered.live with your Metered app hostname and PASTE_NEW_CREDENTIAL_SCOPED_API_KEY_HERE with the new credential-scoped API key. Do not put the account-wide Secret Key or TURN password in this block.
5. Publish the updated files. Browser JavaScript is public, so only use the credential-scoped API key intended for front-end use and monitor its quota. Without this configuration, Auto mode uses PeerJS default ICE; Direct-only mode uses STUN, and Relay-only mode cannot establish a connection without valid TURN servers.

MANUAL CONNECTION MODES
Friends & network includes a Switch mode button that cycles:
- AUTO: enables the configured ICE servers; WebRTC prefers a viable direct path and can select TURN relay candidates when needed.
- DIRECT ONLY: uses host/STUN candidates and disables TURN. This is useful for comparison/testing, but may fail on restrictive networks.
- TURN RELAY ONLY: filters to TURN candidates and sets iceTransportPolicy to relay. Requires valid Metered credentials and can add latency/bandwidth use.

Changing mode restarts the local PeerJS instance and closes existing data connections. The Friend ID is kept; after signalling reconnects, press Connect again. Mode changes are blocked during an active 1v1 to avoid interrupting a match. For a clean comparison, set both devices to the mode you want to test, reconnect them, and compare the diagnostic logs.

CONNECTION DIAGNOSTICS
Friends & network separates PeerJS signalling status from the actual data channel. It logs ICE checking/connected/failed states, reports Direct P2P versus TURN RELAY ACTIVE when browser WebRTC stats expose the selected pair, and times out failed connection attempts with actionable messages. PeerJS warning/error logs are also enabled in the browser console. Credentials are not printed to the logs.

INSTALL ON IOS 16
Open your HTTPS GitHub Pages URL in Safari, tap Share, choose Add to Home Screen, and confirm Add. Launch from the new Home Screen icon for standalone app mode. iOS does not turn an ordinary Safari tab into an app automatically.

This bundle does not add offline gameplay caching; the game still loads external font, PeerJS, Firebase and, when configured, Metered resources, and requires network access.
