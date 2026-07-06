# auth.md

Instructions for AI Agent authentication and registration on duyet.net.

## Discovery

This service supports automated agent registration using the auth.md protocol.

- **Protected Resource Metadata (PRM)**: [/.well-known/oauth-protected-resource](file:///.well-known/oauth-protected-resource)
- **Authorization Server Metadata**: [/.well-known/oauth-authorization-server](file:///.well-known/oauth-authorization-server)

## Registration Flow

Agents can obtain API keys or session credentials programmatically by registering at the identity endpoints.

### Anonymous Flow

For public or rate-limited access:
1. Make a POST request to `https://api.duyet.net/agent/register` with `{"type": "anonymous"}`.
2. The endpoint will return an `api_key` to use as a bearer token in the `Authorization` header.

### Identity Assertion Flow

To link credentials to an external verified identity:
1. Present a verified identity assertion (e.g. ID-JAG token or verified email) to `https://api.duyet.net/agent/register`.
2. The registration endpoint returns a scoped `access_token` or `api_key`.
