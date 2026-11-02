# Security Policy

LaunchScope Open performs **lightweight website checks**, not active security scanning. It is not a substitute for penetration testing, compliance assessment, or a vulnerability scanner.

## Safe use

Run scans only against public websites that you own or are authorized to check. The server enforces URL filtering, DNS/address checks, payload limits, timeouts and request throttling. These are defense-in-depth measures and require further security review if you expose your own instance to untrusted internet traffic.

## Reporting a vulnerability

Please do not publish exploitable details or credentials in a public issue. Contact the repository owner through GitHub's private vulnerability reporting feature if available, or open a non-sensitive issue asking for a secure disclosure channel. Avoid including real user data.

## Production guidance

Before launching a public-facing production instance, arrange independent testing of SSRF protections, proxy configuration, rate limiting, outgoing network access and container hardening. Disable open outbound network access if your deployment does not require it.

## Supported versions

The latest `main` branch receives updates; no separate long-term support releases are guaranteed.
