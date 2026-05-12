---
title: "Snell 代理服务端搭建"
date: 2023-04-24 00:00:54
updated: 2026-05-09 12:00:00
categories: Linux
tags:
  - surge
  - snell
  - 代理
top_img: https://myimgbed.pages.dev/file/1735031010129_QmZdAFiEVKhbY7eV6UXqqFmD48uEU35SJ8T514TdyfmAbG.64qgepv5bb40.jpeg
cover: https://myimgbed.pages.dev/file/1735031010129_QmZdAFiEVKhbY7eV6UXqqFmD48uEU35SJ8T514TdyfmAbG.64qgepv5bb40.jpeg
---

[Snell](https://manual.nssurge.com/others/snell.html) 是 Surge 团队开发的轻量加密代理协议，与 Surge 客户端配合最佳，单连接复用、低协议开销、对移动网络友好。源码不再开源，作者只在官方文档页面发布二进制构建。

本文以 Debian 12 (x86_64) 为例搭建 Snell v5 服务端，并附 Surge 客户端配置与排错要点。

## 前置条件

- 一台具备 root 权限的 VPS
- 已开放可对外访问的端口
- Surge iOS / Mac 或其他声明支持 Snell v5 的客户端

## 下载二进制

打开 [Snell 官方文档](https://manual.nssurge.com/others/snell.html) 找到对应架构的下载地址，撰文时最新版本是 v5.0.0：

```bash
apt update && apt install -y wget unzip

# 按机器架构选其一
wget https://dl.nssurge.com/snell/snell-server-v5.0.0-linux-amd64.zip   # x86_64
# wget https://dl.nssurge.com/snell/snell-server-v5.0.0-linux-aarch64.zip  # ARM64

unzip snell-server-v5.0.0-linux-amd64.zip
install -m 755 snell-server /usr/local/bin/snell-server
rm snell-server snell-server-v5.0.0-linux-amd64.zip
```

> Snell 客户端与服务端版本必须匹配。Surge 4.x 默认带 Snell v4 客户端，新版本 Surge 已支持 v5；服务端选哪一版要看你的客户端。

## 编写配置

```bash
mkdir -p /etc/snell
openssl rand -base64 24  # 生成强密码备用
vim /etc/snell/snell-server.conf
```

写入：

```ini
[snell-server]
listen = 0.0.0.0:30443
psk = PASTE_YOUR_PASSWORD_HERE
ipv6 = false
obfs = off
```

| 字段 | 说明 |
| --- | --- |
| `listen` | 监听地址与端口；IPv6 用 `[::]:30443` |
| `psk` | Pre-Shared Key，使用上一步生成的随机串 |
| `ipv6` | 出站是否优先 IPv6 |
| `obfs` | `off` / `http` / `tls`，HTTP/TLS 混淆增加被识别难度但有少量开销 |

## 配置 systemd

```bash
vim /etc/systemd/system/snell.service
```

写入：

```ini
[Unit]
Description=Snell Proxy Server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=nobody
Group=nogroup
LimitNOFILE=65535
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ExecStart=/usr/local/bin/snell-server -c /etc/snell/snell-server.conf
Restart=on-failure
RestartSec=3s

[Install]
WantedBy=multi-user.target
```

启动并设置自启：

```bash
systemctl daemon-reload
systemctl enable --now snell
systemctl status snell
```

`Active: active (running)` 即正常。日志：`journalctl -u snell -f`。

## 防火墙放行

```bash
# ufw
ufw allow 30443/tcp

# firewalld
firewall-cmd --permanent --add-port=30443/tcp
firewall-cmd --reload
```

云厂商安全组也要放行同一端口。

## 客户端配置（Surge 示例）

在 Surge 配置文件 `[Proxy]` 段添加一行：

```ini
my-snell = snell, your-server-ip, 30443, psk=YOUR_PSK, version=5, obfs=off
```

字段需要与服务端 `version` / `obfs` / `psk` 完全一致；`version` 写错或 PSK 不匹配都会显示 `connection reset`。

## 常见问题

**`connection reset by peer`**
最常见是 PSK 或 `version` 客户端服务端不一致；其次是 `obfs` 字段双方未对齐。

**端口可达但握手失败**
Snell v5 与 v4 不互通，确认两边版本一致。`snell-server -v` 看服务端版本。

**`bind: address already in use`**
端口被旧进程占用，`ss -ltnp | grep 30443` 找到占用进程；或之前手动跑过未退出，先 `systemctl stop snell` 再启动。

**性能调优**
单台 VPS 跑大量连接时建议同时启用 BBR：

```bash
cat >> /etc/sysctl.conf <<'EOF'
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
EOF
sysctl -p
```

服务搭建完成后即可在 Surge 的代理切换面板里使用这个节点。
