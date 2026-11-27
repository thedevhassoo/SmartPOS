# Deployment guide

Use a central PostgreSQL and Node host. Install Node 22.16+ and PostgreSQL, create an empty database and restricted application role, configure server/.env, run npm install and npm run migrate in server. In client, run npm install and npm run build. Then in server, set NODE_ENV=production, HOST=0.0.0.0 and npm start. The Express server serves the built client and API. For local development keep HOST=127.0.0.1 and run the two development terminals described in README.md.

For actual retail LAN use, put the server behind an HTTPS reverse proxy, enable COOKIE_SECURE=true and restrict firewall access to approved workstations. Forward the original host header for same-origin checks. Do not expose PostgreSQL or developer ports to the LAN. Use synchronized host time, unique accounts and restricted database permissions. Test multiple workstations using the actual host address, login, checkout, disconnect behavior and USB HID scanners. No offline completion is supported.

Backup with pg_dump using a secure connection, then restore to a separate fresh database using pg_restore and verify counts and critical workflows. Do not test restoration over live data. Document actual host, network, clock, device and backup evidence before release.

The deployment and PostgreSQL checks have not been executed in this environment. The new schema targets a fresh database; no automatic conversion of old sample or JSONB prototype data is provided.
