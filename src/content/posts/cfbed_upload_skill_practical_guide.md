---
title: "接入 CFBed Upload Skill: 打通图文并茂自动化写作流"
date: 2026-03-09 15:18:00
categories: OpenClaw
tags:
  - openclaw
  - 图床
  - 写作流
description: "从安装、配置到验证，完整打通 CFBed Upload Skill 与 Hexo 写作流。"
cover: "https://myimgbed.pages.dev/file/cfbed-flow.svg"
top_img: "https://myimgbed.pages.dev/file/cfbed-terminal-verify.svg"
published: true
---

> 之前通过 hexo-blog-publisher skill 实现了让 OpenClaw 代写博客，现在再让它自己搞定配图。

最终我把 `cfbed-upload-skill` 接进 OpenClaw 工作流。

## 结论

- 这个 skill 的接入门槛不高，核心只有安装、配置、验证三步。
- 配置统一从 skill 根目录下的 `.env` 读取。
- 接入后，Hexo 的 `cover` / `top_img` 与正文插图都能稳定复用同一域名链接。

![CFBed 工作流图](https://myimgbed.pages.dev/file/cfbed-flow.svg)

## 1) 我为什么要接这个 skill

原来的痛点不是“不能上传”，而是“上传后不好管理”：

- 图片链接来源不统一，文章迁移时容易断
- 封面图、正文图、附件经常分开维护
- 临时测试文件容易堆在工作区

所以目标很明确：

- 上传动作可脚本化
- 链接结果可直接用于写作
- 失败时能快速定位原因

## 2) 安装与配置（最小可执行）

### 2.1 安装 skill

```bash
cd ~/.openclaw/workspace
mkdir -p skills
git clone https://github.com/MarSeventh/cfbed-upload-skill.git skills/cfbed-upload-skill
```

CFBed Upload Skill 仓库地址：[https://github.com/MarSeventh/cfbed-upload-skill](https://github.com/MarSeventh/cfbed-upload-skill)

安装完成后，核心文件主要是：

- `SKILL.md`
- `scripts/upload.sh`

### 2.2 写入 `.env`

skill 只读 `.env`，把 `.env.example` 复制为 `.env` 后填入实际值：

```bash
cd skills/cfbed-upload-skill
cp .env.example .env
vim .env
```

```dotenv
CFBED_URL=https://your-cfbed-domain.example.com
CFBED_TOKEN=YOUR_API_TOKEN
UPLOAD_CHANNEL=telegram
CHANNEL_NAME=
UPLOAD_FOLDER=
```

字段含义：

| 字段 | 说明 |
| --- | --- |
| `CFBED_URL` | cfbed 实例地址 |
| `CFBED_TOKEN` | 在 cfbed 后台「系统设置 → 安全设置 → API Token 管理」生成 |
| `UPLOAD_CHANNEL` | `telegram` / `cfr2` / `s3` / `discord` / `huggingface` 任选其一 |
| `CHANNEL_NAME` | 多通道时指定通道名，单通道留空 |
| `UPLOAD_FOLDER` | 服务端按文件夹归档时填，否则留空 |

> `.env` 不应提交到仓库，仓库里只留 `.env.example`。

![CFBed 首次配置图](https://myimgbed.pages.dev/file/cfbed-setup.svg)

## 3) 验证链路（上传成功不等于可用）

最小验证：

```bash
cd ~/.openclaw/workspace
mkdir -p exports
echo "cfbed upload test" > exports/cfbed_upload_test.txt
bash skills/cfbed-upload-skill/scripts/upload.sh exports/cfbed_upload_test.txt
curl -I https://myimgbed.pages.dev/file/cfbed_upload_test.txt
```

判断标准：

- 上传命令返回公开 URL
- `curl -I` 返回 `HTTP/1.1 200 OK`

![终端验证示例](https://myimgbed.pages.dev/file/cfbed-terminal-verify.svg)


## 4) 接入 Hexo 写作流

接入后，Hexo 文章可以直接引用 CFBed 链接：

```yaml
---
title: "文章标题"
cover: "https://myimgbed.pages.dev/file/cover.png"
top_img: "https://myimgbed.pages.dev/file/top.png"
---
```

正文插图同理：

```markdown
![配置完成截图](https://myimgbed.pages.dev/file/setup.png)
```

![Hexo 引用示例](https://myimgbed.pages.dev/file/cfbed-hexo-frontmatter-example.svg)

这一步的实际收益是：

- 线上文章不依赖本地路径
- 封面图/顶图/正文图来源统一
- 换机器或重建环境时不需要重传历史图片

## 5) 常见失败点与排障顺序

按这个顺序排：

1. `.env` 是否存在、`CFBED_URL` 与 `CFBED_TOKEN` 是否完整
2. token 是否过期或权限不足
3. `UPLOAD_CHANNEL` / `CHANNEL_NAME` 是否与服务端一致
4. 上传返回 URL 后是否 `curl -I` 为 200

![CFBed 排障路径图](https://myimgbed.pages.dev/file/cfbed-debug.svg)

## 6) 这次接入后的变化

这次不是“多了一个工具”，而是把一段重复劳动从流程里删掉了：

- 发布效率更稳定（上传-引用一条链路）
- 配图管理更统一（减少链接散落）
- 复用性更好（历史文章资产可持续使用）

如果你也在用 OpenClaw + Hexo，这个 skill 很值得接入。它的价值不在于“能上传文件”，而在于把写作、配图、发布这三段工作连成了可复用闭环。
