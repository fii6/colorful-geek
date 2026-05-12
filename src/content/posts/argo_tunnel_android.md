---
title: "在 Android 设备上运行 Cloudflare Tunnel"
date: 2024-01-21 10:30:00
updated: 2026-05-09 12:00:00
categories: Android
tags:
  - cloudflare
  - tunnel
  - cloudflared
  - termux
  - 内网穿透
  - zerotrust
top_img: https://myimgbed.pages.dev/file/1734896088791_QmYFQSpcv4ktgS87V1DkCq1Cdt14TxmFT5NjBVSeExoyJf.2f0cqelhod5w.jpeg
cover: https://myimgbed.pages.dev/file/1734896088791_QmYFQSpcv4ktgS87V1DkCq1Cdt14TxmFT5NjBVSeExoyJf.2f0cqelhod5w.jpeg
---

Cloudflare Tunnel（早期叫 Argo Tunnel）通过反向连接到 Cloudflare 边缘网络，把本地服务暴露到公网，全程不需要公网 IP，也不需要在路由器上做端口映射。把这一套搬到 Android 设备上，旧手机就能立刻变成自带 HTTPS 与 Zero Trust 访问控制的轻量级内网入口。

本文给出两种在 Android 上跑 cloudflared 的方案，并补上后台保活与排错要点。

## 两种方案怎么选

| 方案 | 适用场景 | 复杂度 | 资源占用 |
| --- | --- | --- | --- |
| Termux + Token（推荐） | 单纯把本地端口透出去 | 低 | 低 |
| proot Debian + cert 登录 | 同时需要在 Debian 里跑其他服务 | 中 | 中 |

如果只是想暴露 Termux 里某个端口（如 SSH、Web 服务），直接用 Token 方案；如果机器上已经跑了 proot Debian 做开发环境，第二种方案能让 cloudflared 与其他工具共用同一套 rootfs。

## 准备工作

1. 一个已托管在 Cloudflare 的域名（DNS 服务器要切到 Cloudflare）
2. 从 [GitHub Releases](https://github.com/termux/termux-app/releases) 安装 Termux（不要装 Google Play 版，已停更）
3. 首次启动后更新软件源：

   ```bash
   pkg update && pkg upgrade
   ```

## 方案 A：Termux + Token（推荐）

### 1. 安装 cloudflared

Termux 官方源已经收录了 cloudflared：

```bash
pkg install cloudflared
cloudflared --version  # 验证安装成功
```

### 2. 在 Cloudflare 控制台创建隧道

进入 [Zero Trust Dashboard](https://one.dash.cloudflare.com/)：

1. **Networks → Tunnels → Create a tunnel**，选 `Cloudflared` 连接器
2. 给隧道起个名字，下一步会显示安装命令，**整段命令末尾的 token 字符串复制下来**
3. **Public Hostname** 选项卡里把要暴露的子域名指向 `http://localhost:<本地端口>`，例如把 `home.example.com` 指向 `http://localhost:8080`
4. 保存后回到 Termux

### 3. 启动隧道

```bash
cloudflared tunnel --edge-ip-version auto --protocol http2 run --token <粘贴你的 Token>
```

几秒后会看到 `Registered tunnel connection` 之类日志，控制台里隧道状态变绿色 `HEALTHY`，浏览器访问对应子域名即可。

> `--protocol http2` 是给 QUIC 在国内网络下不稳定时的备选；网络条件好的可去掉走默认 QUIC。

## 方案 B：proot Debian + cert 登录

### 1. 安装 proot Debian

```bash
pkg install proot-distro
proot-distro install debian
proot-distro login debian
```

进入容器后再装基础工具：

```bash
apt update && apt install -y wget curl
```

### 2. 安装 cloudflared

Termux + proot 的设备多数是 ARM64：

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
dpkg -i cloudflared-linux-arm64.deb
```

### 3. 登录并创建隧道

```bash
cloudflared tunnel login   # 复制日志中的 URL 在系统浏览器打开授权
cloudflared tunnel create my-tunnel
cloudflared tunnel list    # 记下 UUID
```

### 4. 写隧道配置

在 `~/.cloudflared/config.yml` 写入（注意目录是 `.cloudflared`，多一个 d）：

```yaml
tunnel: <Tunnel-UUID>
credentials-file: /root/.cloudflared/<Tunnel-UUID>.json

ingress:
  - hostname: home.example.com
    service: http://localhost:8080
  - service: http_status:404   # 兜底必须，否则 cloudflared 会拒启
```

### 5. 绑定 DNS 并启动

```bash
cloudflared tunnel route dns my-tunnel home.example.com
cloudflared tunnel run my-tunnel
```

需要管理多条隧道时为每条隧道单独写一份 yaml，启动时用 `--config /path/to/config.yml` 指定。

## 让隧道在后台持续运行

Android 会激进回收后台进程，直接 `&` 放后台几分钟就会被杀。两步保命：

1. **持有唤醒锁**，阻止系统休眠 Termux：

   ```bash
   termux-wake-lock
   ```

   关闭时执行 `termux-wake-unlock`。

2. **用 termux-services 托管** 让进程崩溃后自动重启：

   ```bash
   pkg install termux-services
   # 重启 Termux 加载 sv 环境

   mkdir -p $PREFIX/var/service/cloudflared/log
   cat > $PREFIX/var/service/cloudflared/run <<'EOF'
   #!/data/data/com.termux/files/usr/bin/sh
   exec cloudflared tunnel --protocol http2 run --token YOUR_TOKEN 2>&1
   EOF
   chmod +x $PREFIX/var/service/cloudflared/run

   sv-enable cloudflared
   sv up cloudflared
   sv status cloudflared   # 看到 run: cloudflared 即正常
   ```

   日志在 `$PREFIX/var/service/cloudflared/log/main/current`。

把 Termux 加入手机厂商的「电池白名单 / 自启动白名单 / 受保护应用」，配合上面两步，长时间稳定运行基本没问题。

## 常见问题

**`failed to dial to edge: x509: certificate signed by unknown authority`**
proot Debian 默认证书库不全，执行 `apt install -y ca-certificates && update-ca-certificates`。

**隧道一直 `DOWN`，但 cloudflared 日志显示已连接**
仪表板缓存延迟，等 30 秒；仍异常则检查 `Public Hostname` 中是否填了正确的 `service` URL，并确认本地端口确实在监听（`ss -ltnp`）。

**手机熄屏几分钟后断流**
没拿唤醒锁，或者厂商系统强杀。先确认 `termux-wake-lock` 生效（通知栏会有持续提示），再去系统设置里给 Termux 解除后台限制。

**QUIC 协议无法建联**
显式加 `--protocol http2`，部分国内 ISP 对 UDP/443 有干扰。

## 参考

- [Cloudflare Tunnel 官方文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Termux PRoot Wiki](https://wiki.termux.com/wiki/PRoot)
- [termux-services 用法](https://wiki.termux.com/wiki/Termux-services)
