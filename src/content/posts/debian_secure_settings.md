---
title: "用 DD 重装 Debian 与必要的安全加固"
date: 2023-05-28 23:58:33
updated: 2026-05-09 12:00:00
categories: Linux
tags:
  - 安全
  - ssh
  - vps
  - debian
top_img: https://myimgbed.pages.dev/file/1734942514895_QmSqM1GTyk6CLujgu3EJfZQLRVHmFigZCw7oTpGsRhABoF.5m2c5z5yk68.jpeg
cover: https://myimgbed.pages.dev/file/1734942514895_QmSqM1GTyk6CLujgu3EJfZQLRVHmFigZCw7oTpGsRhABoF.5m2c5z5yk68.jpeg
---

KVM 架构的 VPS 如果服务商不提供自定义 ISO，预装系统可能带各种 agent、脚本与遗留账号，等同于把控制权部分让渡给厂商。用 DD 把磁盘镜像直接覆写为官方系统镜像，可以拿到一份干净的 Debian。本文给出 DD 流程，并补上拿到机器后立刻该做的安全加固。

> 风险提示：DD 会清空磁盘，IP 与 SSH 凭据均会变化；登录方式失败将无法补救。务必先确认厂商提供 VNC/IPMI 救援入口，或快照可回滚。

## 用 DD 重装为干净的 Debian

### 选脚本

社区常用脚本有两类：

- **MollyLau/leitbogioro 的 Network-Reinstall-System-Modify**：维护活跃，支持 Debian 11/12、Ubuntu、AlmaLinux 等
- **bin456789/reinstall**：覆盖更广，支持 BIOS/UEFI 双模式

下面以 reinstall 为例：

```bash
apt update && apt install -y wget xz-utils openssl

# 拉取脚本
wget --no-check-certificate -O reinstall.sh \
  https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh
chmod +x reinstall.sh
```

### 执行重装

```bash
# 安装 Debian 12，密码用强随机串
NEW_PWD=$(openssl rand -base64 18)
echo "New root password: $NEW_PWD"
./reinstall.sh debian 12 --password "$NEW_PWD"

# 立即重启进入安装流程
reboot
```

重装过程通常 5-15 分钟，期间 SSH 不可达。安装结束后，新系统的 SSH 默认端口可能被脚本改写（reinstall 默认仍是 22，部分老脚本如 DebianNET 会改成 3022），用脚本输出的端口连入：

```bash
ssh root@your-ip   # 或 ssh root@your-ip -p 3022
```

## 系统初始化

```bash
apt update && apt full-upgrade -y
apt install -y vim sudo curl ca-certificates

# 时区改为你自己所在的（示例为上海）
timedatectl set-timezone Asia/Shanghai

# 自动安全更新，避免常年不打补丁
apt install -y unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades
```

DNS 在 Debian 12 默认由 systemd-resolved 管理，不要直接改 `/etc/resolv.conf` 也不要 `chattr +i`，正确做法：

```bash
mkdir -p /etc/systemd/resolved.conf.d
cat > /etc/systemd/resolved.conf.d/dns.conf <<'EOF'
[Resolve]
DNS=1.1.1.1 8.8.8.8
FallbackDNS=9.9.9.9
DNSOverTLS=opportunistic
EOF
systemctl restart systemd-resolved
resolvectl status   # 验证 DNS 已生效
```

## 加普通用户与 sudo

```bash
USERNAME=ops
adduser "$USERNAME"
usermod -aG sudo "$USERNAME"
```

把 sudo 规则写到 `/etc/sudoers.d/`，并用 `visudo` 校验语法（直接 `chmod +w /etc/sudoers` 是错误做法，会破坏权限位）：

```bash
visudo -f /etc/sudoers.d/${USERNAME}
# 写入下面一行（按需选其一）：
# 提权需要密码（推荐）
${USERNAME} ALL=(ALL) ALL
# 提权免密（仅在 SSH 已强化、机器单人使用时考虑）
# ${USERNAME} ALL=(ALL) NOPASSWD: ALL
```

`visudo` 在保存时会校验语法错误，比直接编辑 `/etc/sudoers` 安全得多。

## SSH 加固

### 生成密钥（在你本机，不是 VPS 上）

```bash
# 优先 ed25519，比 RSA 短、快、安全
ssh-keygen -t ed25519 -C "your_email@example.com"
```

> 不要再用 `ssh-keygen -b 1024`，1024 位 RSA 早已不安全；如必须 RSA，最低 4096 位。

把本机 `~/.ssh/id_ed25519.pub` 内容追加到 VPS 上 `~ops/.ssh/authorized_keys`：

```bash
# 在 VPS 上以 ops 用户操作
mkdir -p ~/.ssh && chmod 700 ~/.ssh
vim ~/.ssh/authorized_keys   # 粘贴公钥
chmod 600 ~/.ssh/authorized_keys
```

或在本机直接：

```bash
ssh-copy-id -p 22 ops@your-ip
```

### 改 sshd 配置

```bash
vim /etc/ssh/sshd_config.d/99-hardening.conf
```

写入（这种放在 `sshd_config.d/` 的方式比改主配置更可靠，发行版升级时不会冲突）：

```text
Port 3022
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
MaxAuthTries 3
LoginGraceTime 20
AllowUsers ops
```

**先开新端口的 SSH 监听验证可用，再断开旧连接**：

```bash
sshd -t   # 语法预检，必做
systemctl reload ssh
# 新开终端测试新端口能用：ssh -p 3022 ops@your-ip
# 验证通过后再 exit 老连接
```

## 防火墙

UFW 是 iptables/nftables 的简化前端：

```bash
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 3022/tcp comment 'SSH'
# 按需放行其他服务，例如 Web
# ufw allow 80,443/tcp
ufw enable
ufw status verbose
```

UFW 不会自动识别云厂商安全组，记得到控制台同步放行。

## 暴力破解防护

虽然已经禁用密码登录，但放一层 fail2ban 兜底，防止暴露的非 22 端口被扫描爆破：

```bash
apt install -y fail2ban
cat > /etc/fail2ban/jail.d/sshd.local <<'EOF'
[sshd]
enabled = true
port = 3022
maxretry = 5
findtime = 10m
bantime = 1h
EOF
systemctl restart fail2ban
fail2ban-client status sshd
```

## 验收清单

```bash
# 1. 用 root 已无法登录（应被拒绝）
ssh -p 3022 root@your-ip

# 2. 用密码登录已禁用（应直接断）
ssh -p 3022 -o PreferredAuthentications=password ops@your-ip

# 3. 旧端口 22 应不可达
ssh -p 22 ops@your-ip

# 4. 自动更新计划生效
systemctl status apt-daily-upgrade.timer

# 5. 防火墙状态
ufw status
```

四项符合预期，则一台干净、自带补丁、最小开放面、密钥+IP白名单+fail2ban 三层防护的 Debian 主机就备好了。后续可以按业务需要安装 Web、代理、数据库等服务。
