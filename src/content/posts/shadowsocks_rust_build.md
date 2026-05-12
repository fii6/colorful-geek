---
title: "Shadowsocks-rust 服务端搭建"
date: 2023-04-25 00:50:01
updated: 2026-05-09 12:00:00
categories: Linux
tags:
  - shadowsocks
  - rust
top_img: https://myimgbed.pages.dev/file/1735030813892_QmfDgzmco4CW8AgwoDaEMHxsWWtvVNdzheLvgHQSQYrCCd.2zwf6m70ggi0.jpeg
cover: https://myimgbed.pages.dev/file/1735030813892_QmfDgzmco4CW8AgwoDaEMHxsWWtvVNdzheLvgHQSQYrCCd.2zwf6m70ggi0.jpeg
---

[shadowsocks-rust](https://github.com/shadowsocks/shadowsocks-rust) 是 Shadowsocks 协议的官方 Rust 实现，与 libev 版本功能对齐之外，还借助 Rust 的性能与内存安全特性提供了多服务实例、负载均衡、加密算法热插拔等能力，目前是上游推荐的服务端实现。

本文以 Debian 12 (x86_64) 为例，介绍从下载二进制到 systemd 托管的完整流程，并附带防火墙、内核优化与排错要点。

## 前置条件

- 一台具有 root 权限的 Linux VPS，本文以 Debian 12 为例
- 已开放可对外访问的 TCP/UDP 端口（后续在配置中指定）
- 客户端工具：[shadowsocks-android](https://github.com/shadowsocks/shadowsocks-android)、[ShadowsocksX-NG](https://github.com/shadowsocks/ShadowsocksX-NG) 或任意支持 Shadowsocks 协议的客户端

## 下载二进制

打开 [Releases 页面](https://github.com/shadowsocks/shadowsocks-rust/releases/latest) 找到适配你架构的压缩包。下面以 x86_64 GNU/Linux 为例，请将 `VERSION` 替换为最新 tag：

```bash
VERSION=v1.23.5  # 改为 Releases 页面的最新版本
ARCH=x86_64-unknown-linux-gnu
wget https://github.com/shadowsocks/shadowsocks-rust/releases/download/${VERSION}/shadowsocks-${VERSION}.${ARCH}.tar.xz
tar -xf shadowsocks-${VERSION}.${ARCH}.tar.xz
```

> ARM64 设备（树莓派、部分 ARM VPS）请改用 `aarch64-unknown-linux-gnu`。

## 安装到系统路径

```bash
install -m 755 ssserver /usr/local/bin/ssserver
```

`install` 一步完成移动与权限设置，比 `mv` + `chmod` 更稳。放在 `/usr/local/bin` 而非 `/usr/bin`，可以避免被发行版包管理器覆盖。

## 编写配置

```bash
mkdir -p /etc/shadowsocks-rust
openssl rand -base64 16  # 生成强密码，复制备用
vim /etc/shadowsocks-rust/config.json
```

写入：

```json
{
  "server": "0.0.0.0",
  "server_port": 30055,
  "password": "PASTE_YOUR_PASSWORD_HERE",
  "method": "aes-256-gcm",
  "mode": "tcp_and_udp",
  "timeout": 60
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `server` | 监听地址，`0.0.0.0` 表示所有 IPv4 网卡；如需 IPv6 用 `"::"` |
| `server_port` | 对外端口，建议选 1024 以上的非常用端口 |
| `password` | 务必使用前面生成的随机串，不要用弱密码 |
| `method` | 推荐 `aes-256-gcm` 或 `chacha20-ietf-poly1305`（移动端 CPU 友好） |
| `mode` | `tcp_and_udp` 同时启用 TCP/UDP，单独 TCP 可改 `tcp_only` |

> JSON 不允许尾逗号，复制配置时要看一眼最后一行字段后没有多余 `,`，否则启动会报 `expected value`。

## 配置 systemd 守护

```bash
vim /etc/systemd/system/shadowsocks-rust.service
```

写入：

```ini
[Unit]
Description=shadowsocks-rust server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=nobody
Group=nogroup
LimitNOFILE=65535
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true
ExecStart=/usr/local/bin/ssserver --log-without-time -c /etc/shadowsocks-rust/config.json
Restart=on-failure
RestartSec=3s

[Install]
WantedBy=multi-user.target
```

相比常见模板，这里加了几条值得保留：

- `After`/`Wants=network-online.target`：等网络就绪再启动，避免 0.0.0.0 监听争抢
- `AmbientCapabilities=CAP_NET_BIND_SERVICE`：以非 root 用户监听 1024 以下端口时需要
- `NoNewPrivileges=true`：禁止子进程提权，限制潜在风险
- `Restart=on-failure`：进程异常退出自动拉起

启用并启动服务：

```bash
systemctl daemon-reload
systemctl enable --now shadowsocks-rust
systemctl status shadowsocks-rust
```

看到 `Active: active (running)` 即启动成功。

## 防火墙放行

如果服务器启用了 ufw 或 firewalld，需要放行配置中的端口：

```bash
# ufw
ufw allow 30055/tcp
ufw allow 30055/udp

# firewalld
firewall-cmd --permanent --add-port=30055/tcp
firewall-cmd --permanent --add-port=30055/udp
firewall-cmd --reload
```

云厂商安全组（阿里云、AWS、GCP 等）也要单独放行，否则连接会在网络层被丢弃。

## 启用 BBR（可选，但建议）

shadowsocks-rust 性能虽好，链路质量是真正瓶颈。开启 BBR 拥塞控制能显著改善高丢包链路下的吞吐：

```bash
cat >> /etc/sysctl.conf <<'EOF'
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
EOF
sysctl -p
sysctl net.ipv4.tcp_congestion_control  # 应显示 bbr
```

## 客户端验证

服务起来后从客户端填入 `服务器 IP / 端口 / 密码 / 加密方式`，连上后访问 `https://ifconfig.me` 应回显服务器出口 IP；如需端到端连通性测试：

```bash
# 在另一台机器上
curl --socks5 your-server-ip:30055 https://ifconfig.me  # 错误示范，ss 不是 socks5
```

Shadowsocks 协议不能直接当 SOCKS5 用，需要客户端在本地起 `sslocal` 暴露 SOCKS5：

```bash
sslocal -s your-server-ip -p 30055 -k 'YOUR_PASSWORD' -m aes-256-gcm -b 127.0.0.1 -l 1080
```

然后用 `curl --socks5 127.0.0.1:1080 https://ifconfig.me` 验证。

## 常见问题

**`expected value` 启动失败**
配置 JSON 有语法错误，最常见是尾逗号或字符串没有加引号。用 `python3 -m json.tool /etc/shadowsocks-rust/config.json` 校验。

**端口可达但连接立刻断开**
检查 `method` 是否客户端支持；某些老客户端不支持 GCM 系列，可改用 `chacha20-ietf-poly1305`。

**UDP 流量不通**
确认 `mode` 是 `tcp_and_udp`，且防火墙/安全组同时放行了 UDP 端口。

**日志位置**
`journalctl -u shadowsocks-rust -f` 实时查看；如需落盘，把 `--log-without-time` 改为 `--log-config /etc/shadowsocks-rust/log4rs.yaml` 并自定义 log4rs 配置。

到这里 Shadowsocks-rust 服务端就部署完成，可以配合任意 Shadowsocks 客户端使用。
