---
title: 'Setting up 9router API Proxy on VPS with PM2 and Cloudflared'
slug: 'cai-dat-9router-api-proxy-tren-vps'
excerpt: 'Complete guide to installing 9router API proxy on VPS using PM2 and Cloudflared Tunnel. Manage multiple AI API keys (OpenAI, Anthropic, Google), rotate providers, hide credentials, and control costs.'
coverImage: '/og/setup-9router-api-proxy-on-vps.webp'
publishedAt: 2026-05-08
updatedAt: 2026-05-08
tags: ['9router', 'vps', 'ai', 'proxy', 'cloudflare-tunnel', 'pm2', 'api-gateway']
language: 'en'
category: 'tutorials'
---

Running a proxy between your application and AI providers helps you centrally manage API keys, rotate providers when hitting rate limits, and hide real credentials from clients. 9router does exactly that.

This guide covers the complete setup of 9router on VPS using PM2 for headless mode and Cloudflared Tunnel to expose the service externally without opening ports.

## Why API Proxy?

- **Rotate API keys** — Automatically switch to backup keys when the primary runs out of quota
- **Hide credentials** — Clients only see your endpoint, never the real keys
- **Manage rate limits** — Distribute requests across multiple providers (OpenAI, Anthropic, Google)
- **Logging and control** — Track usage and costs per project

## Requirements

- VPS Linux (Ubuntu/Debian)
- Node.js ≥ 18
- [PM2](https://pm2.keymetrics.io/) (process manager)
- [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/) (Cloudflare Tunnel)
- Port 20128 open locally

## Installation

```bash
# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts

# Install 9router
npm install -g 9router
```

Reference: [9router on npm](https://www.npmjs.com/package/9router)

Check version:

```bash
9router --version  # 0.4.20+
```

## Running on VPS

VPS has no GUI, so run in headless mode:

```bash
9router --headless
```

**Running persistently with PM2 (recommended):**

```bash
npm install -g pm2

pm2 start --name 9router "9router --headless"
pm2 startup
pm2 save
```

Output:

```
🚀 9router v0.4.20
Server: http://localhost:20128
💡 Router is now running in headless mode.
```

Test immediately:

```bash
curl http://localhost:20128/v1/models
```

Check status:

```bash
pm2 list
pm2 logs 9router
```

## Configuring API Keys

Open Web UI (`http://vps-ip:20128`) or config via API. Add keys from providers:

- OpenAI: `sk-...`
- Anthropic: `sk-ant-...`
- Google: `AIza...`

9router automatically selects the provider based on the model in the request.

## Accessing from Outside

### Using Cloudflare Tunnel (recommended)

Cloudflared doesn't need open ports, proxying through Cloudflare is more secure:

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Create tunnel
cloudflared tunnel create 9router

# Run tunnel
cloudflared tunnel run --url http://localhost:20128 9router
```

Reference: [Cloudflare Tunnel Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/)

### Tunnel Management

```bash
# List tunnels
cloudflared tunnel list

# Create new tunnel
cloudflared tunnel create <tunnel-name>

# Delete tunnel
cloudflared tunnel delete <tunnel-name-or-id>

# Check tunnel info
cloudflared tunnel info <tunnel-name>

# Run tunnel (quick run)
cloudflared tunnel run <tunnel-name>

# Run with specific config file
cloudflared tunnel --config /etc/cloudflared/config.yml run <tunnel-name>

# Test connection (from local)
curl -I https://proxy.yourdomain.com
```

### Service vs Quick Run

**Quick run** — run directly, config at `~/.cloudflared/config.yml`:

```bash
cloudflared tunnel run 9router
```

**Service (production)** — run as systemd service, config at `/etc/cloudflared/`:

```bash
# Move credentials file
sudo mv ~/.cloudflared/<tunnel-id>.json /etc/cloudflared/
sudo chown root:root /etc/cloudflared/<tunnel-id>.json
sudo chmod 600 /etc/cloudflared/<tunnel-id>.json

# Create service file
sudo cloudflared service install
```

Config file for service: `/etc/cloudflared/config.yml` (not `~/.cloudflared/`)

```yaml
tunnel: <tunnel-name>
credentials-file: /etc/cloudflared/<tunnel-id>.json
protocol: http2
metrics: 127.0.0.1:9090
retries: 5
grace-period: 30s

ingress:
  - hostname: proxy.yourdomain.com
    service: http://127.0.0.1:20128
    originRequest:
      connectTimeout: 30s
      tlsTimeout: 30s
      tcpKeepAlive: 30s
      keepAliveConnections: 100
      keepAliveTimeout: 90s
      noTLSVerify: true
      httpHostHeader: proxy.yourdomain.com
      disableChunkedEncoding: false
  - service: http_status:404
```

**Check service:**

```bash
sudo systemctl status cloudflared
sudo systemctl restart cloudflared
journalctl -u cloudflared -f
```

> **Note:** Credentials file contains sensitive secret key — place at `/etc/cloudflared/` with `600` permissions and owned by `root`.

Then run:

```bash
pm2 start --name cloudflared "cloudflared tunnel run 9router"
pm2 startup
pm2 save
```

Or if using service:

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

Access via `https://proxy.yourdomain.com` (need to create DNS record first).

### Direct Port Open (not recommended)

```bash
sudo ufw allow 20128
```

With this method, endpoint will be `http://vps-ip:20128`.

## Using in Your Application

Change endpoint from provider to your proxy:

```bash
# Before
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxx"

# After (using cloudflared tunnel URL)
curl https://proxy.yourdomain.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxx"
```

Or set environment variable:

```bash
export OPENAI_API_BASE="https://proxy.yourdomain.com/v1"
```

## Checking Status

```bash
pm2 status           # Check both 9router and cloudflared tunnel
pm2 logs 9router     # 9router logs
pm2 logs cloudflared-tunnel  # Tunnel logs
```

## Conclusion

With a small VPS, 9router, PM2 and Cloudflared, you have a **production-ready API proxy** to manage AI keys, distribute requests, and control costs — no open ports or VPN needed.

Advantages over other solutions:

- No Cloudflare Worker costs
- No need for domain pointed directly to VPS
- More secure since traffic goes through Cloudflare
- Fully self-hosted with a cheap VPS
