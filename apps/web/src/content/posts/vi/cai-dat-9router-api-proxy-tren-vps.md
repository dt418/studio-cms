---
title: 'Cài đặt 9router API Proxy trên VPS với PM2 và Cloudflared'
slug: 'cai-dat-9router-api-proxy-tren-vps'
excerpt: 'Hướng dẫn chi tiết cách cài đặt 9router API proxy trên VPS dùng PM2 và Cloudflared Tunnel. Quản lý nhiều API key AI (OpenAI, Anthropic, Google), xoay vòng provider, ẩn credentials và kiểm soát chi phí.'
coverImage: '/og/setup-9router-api-proxy-on-vps.webp'
publishedAt: 2026-05-08
updatedAt: 2026-05-08
tags: ['9router', 'vps', 'ai', 'proxy', 'cloudflare-tunnel', 'pm2', 'api-gateway']
category: 'tutorials'
---

Chạy một proxy trung gian giữa ứng dụng của bạn và các AI provider giúp tập trung quản lý API keys, xoay vòng provider khi rate limit, và ẩn credentials thật khỏi client. 9router làm chính xác việc đó.

Bài viết này hướng dẫn chi tiết cách cài đặt 9router trên VPS sử dụng PM2 để chạy headless mode và Cloudflared Tunnel để expose service ra bên ngoài mà không cần mở port.

## Tại sao cần API Proxy?

- **Xoay vòng API keys** — Tự động chuyển sang key dự phòng khi key chính hết quota
- **Ẩn credentials** — Client chỉ biết endpoint của bạn, không thấy key thật
- **Quản lý rate limit** — Phân phối request qua nhiều provider (OpenAI, Anthropic, Google)
- **Log và kiểm soát** — Theo dõi usage, chi phí theo project

## Yêu cầu

- VPS Linux (Ubuntu/Debian)
- Node.js ≥ 18
- [PM2](https://pm2.keymetrics.io/) (process manager)
- [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/) (Cloudflare Tunnel)
- Port 20128 mở local

## Cài đặt

```bash
# Cài Node.js qua nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts

# Cài 9router
npm install -g 9router
```

Tham khảo: [9router trên npm](https://www.npmjs.com/package/9router)

Kiểm tra version:

```bash
9router --version  # 0.4.20+
```

## Chạy trên VPS

VPS không có GUI nên chạy ở headless mode:

```bash
9router --headless
```

**Chạy bền bỉ với PM2 (khuyến nghị):**

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

Test ngay:

```bash
curl http://localhost:20128/v1/models
```

Kiểm tra:

```bash
pm2 list
pm2 logs 9router
```

## Cấu hình API Keys

Mở Web UI (`http://vps-ip:20128`) hoặc config qua API. Thêm keys của các provider:

- OpenAI: `sk-...`
- Anthropic: `sk-ant-...`
- Google: `AIza...`

9router tự chọn provider theo model trong request.

## Truy cập từ bên ngoài

### Dùng Cloudflare Tunnel (khuyến nghị)

Cloudflared không cần open port, proxy qua Cloudflare an toàn hơn:

```bash
# Cài cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Tạo tunnel
cloudflared tunnel create 9router

# Chạy tunnel
cloudflared tunnel run --url http://localhost:20128 9router
```

Tham khảo: [Hướng dẫn Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/tunnel-guide/)

### Quản lý Tunnel

```bash
# Liệt kê tunnels
cloudflared tunnel list

# Tạo tunnel mới
cloudflared tunnel create <tunnel-name>

# Xóa tunnel
cloudflared tunnel delete <tunnel-name-or-id>

# Kiểm tra tunnel đang chạy
cloudflared tunnel info <tunnel-name>

# Chạy tunnel (quick run)
cloudflared tunnel run <tunnel-name>

# Chạy với config file cụ thể
cloudflared tunnel --config /etc/cloudflared/config.yml run <tunnel-name>

# Kiểm tra kết nối (từ local)
curl -I https://proxy.yourdomain.com
```

### Chạy như service vs quick run

**Quick run** — chạy trực tiếp, config ở `~/.cloudflared/config.yml`:

```bash
cloudflared tunnel run 9router
```

**Service (production)** — chạy như systemd service, config ở `/etc/cloudflared/`:

```bash
# Di chuyển credentials file
sudo mv ~/.cloudflared/<tunnel-id>.json /etc/cloudflared/
sudo chown root:root /etc/cloudflared/<tunnel-id>.json
sudo chmod 600 /etc/cloudflared/<tunnel-id>.json

# Tạo service file
sudo cloudflared service install
```

File config cho service: `/etc/cloudflared/config.yml` (không phải `~/.cloudflared/`)

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

**Kiểm tra service:**

```bash
sudo systemctl status cloudflared
sudo systemctl restart cloudflared
journalctl -u cloudflared -f
```

> **Lưu ý:** File credentials chứa secret key nhạy cảm — đặt ở `/etc/cloudflared/` với quyền `600` và owned by `root`.

Sau đó chạy:

```bash
pm2 start --name cloudflared "cloudflared tunnel run 9router"
pm2 startup
pm2 save
```

Hoặc nếu dùng service:

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

Truy cập qua `https://proxy.yourdomain.com` (cần tạo DNS record trước).

### Mở port trực tiếp (không khuyến nghị)

```bash
sudo ufw allow 20128
```

Với cách này, endpoint sẽ là `http://vps-ip:20128`.

## Dùng trong ứng dụng

Thay đổi endpoint từ provider gốc sang proxy của bạn:

```bash
# Trước
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxx"

# Sau (dùng URL từ cloudflared tunnel)
curl https://proxy.yourdomain.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxx"
```

Hoặc set biến môi trường:

```bash
export OPENAI_API_BASE="https://proxy.yourdomain.com/v1"
```

## Kiểm tra trạng thái

```bash
pm2 status           # Kiểm tra cả 9router và cloudflared tunnel
pm2 logs 9router     # Log 9router
pm2 logs cloudflared-tunnel  # Log tunnel
```

## Kết luận

Với một VPS nhỏ, 9router, PM2 và Cloudflared, bạn có một **API proxy production-ready** để quản lý AI keys, phân phối request và kiểm soát chi phí — không cần open port hay VPN.

Ưu điểm so với các giải pháp khác:

- Không tốn phí Cloudflare Worker
- Không cần domain pointed trực tiếp về VPS
- An toàn hơn vì traffic đi qua Cloudflare
- Tự chủ hoàn toàn với VPS giá rẻ
