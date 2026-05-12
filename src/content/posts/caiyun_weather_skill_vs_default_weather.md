---
title: "给 OpenClaw 换上更顺手接地气的彩云天气 Skill"
date: 2026-03-25 14:18:00
categories:
  - OpenClaw
tags:
  - openclaw
  - weather
  - 彩云天气
description: "围绕 fii6/caiyun-weather-skill，讲清楚它为什么在中国场景下比 OpenClaw 默认 weather skill 更贴近日常使用。"
cover: "https://myimgbed.pages.dev/file/1778582961907_1.png"
published: true
---

这篇文章不打算讨论谁在气象学上“绝对更准”，而是回答一个更实际的问题：**同样是在中国用 OpenClaw 查天气，为什么默认 weather skill 常常只是“能用”，而 `caiyun-weather-skill` 会明显更顺手。**

- **默认 weather skill 并不差**，它的优势是零配置、全球通用、临时查国外城市很方便。
- **但在中国场景下，`caiyun-weather-skill` 往往更贴近日常习惯**：中文地点更自然、输出更适合聊天、未来 24 小时概况直接可读。
- **这篇文章说的是“使用表现”**，不是做严苛的气象精度实验室 benchmark。重点是：当你真的每天在中国查天气时，哪条链路更顺手。

![caiyun-weather-skill 仓库概览](https://myimgbed.pages.dev/file/caiyun-weather-repo-card-20260325.svg)

仓库地址：

- GitHub：[`fii6/caiyun-weather-skill`](https://github.com/fii6/caiyun-weather-skill)

---

## 一、默认 weather skill 解决的是“全球通用”，不是“中国日常天气体验”

OpenClaw 默认 weather skill 的设计目标很明确：

- 不需要 API key
- 直接用 `wttr.in` 就能查
- 临时问一句“某地天气怎么样”时，上手成本很低

这套设计在“临时、通用、全球范围”的目标下是成立的。

问题在于，中国场景对“天气好不好用”的要求，通常不只是“能不能拿到一个温度”。我们更在意的是：

- 中文地点能不能直接输
- 区县级地点会不会变成陌生英文别名
- 输出是不是一眼能看懂
- 有没有直接给出未来 24 小时概况
- 风况、体感、天气描述是不是贴近中文阅读习惯

换句话说，**默认 weather skill 更像一把全球通用瑞士军刀；而 `caiyun-weather-skill` 更像专门为中国日常天气查询磨过一遍的刀。**

---

## 二、同样查中国城市，差异不是抽象的，是直接能看出来的

先看一张对比图：

![默认 weather skill 与 caiyun-weather-skill 输出对比](https://myimgbed.pages.dev/file/caiyun-weather-output-compare-20260325.svg)

这张图的重点不是“谁字段更多”，而是“谁更像人在中国日常会看的天气信息”。

### 1）查上海，默认 skill 返回的是 `Pootung`

我直接用默认 weather skill 常见的 `wttr.in` 结果查 `Shanghai`，拿到的是这样一组信息：

```text
地点: Pootung
现在: 16℃ 体感 16℃ 湿度 63% 风速 9 km/h
天气: Partly cloudy
```

这里最大的问题不是它完全不能用，而是：

- `Pootung` 这种英文地名并不符合大多数中文用户的阅读习惯
- 输出虽然有数据，但更像“原始字段”，不是“直接可读的天气概况”

再看同一时间 `caiyun-weather-skill` 查 `上海市` 的结果：

```text
上海市, 中国 | 3-25 | 晴☀
──────────────────────
现在 18.6℃ 体感 17.7℃
风况 北东北风 5.7 m/s（4级）
──────────────────────
📅 未来三天
25 ⛅  26 ☁  27 ⛅
──────────────────────
🕒 未来 24 小时
14  18.6℃ ☀ | 02   8.7℃ ☁
15  18.0℃ ☀ | 03   8.4℃ ☁
...
```

差异一下就出来了：

- 标题是中文地点
- 当前温度、体感、风况放在一起
- 未来三天和未来 24 小时已经排版好
- 整体就是可以直接发回聊天窗口的格式

### 2）查区县级地点时，差异会更明显

我又拿一个中国用户真实会说的地点来试：`西安市雁塔区`。

默认 weather skill 这边，`wttr.in` 返回的最近地点是：

```text
nearest_area: Shanmenkou
region: Shaanxi
country: China
```

这不是严格意义上的“错误”，但很明显：**它不是大多数中文用户真正想看到的地点名称。**

而 `caiyun-weather-skill` 的结果是：

```text
雁塔区, 西安市, 陕西省, 中国 | 3-25 | 轻度雾霾🌫
──────────────────────
现在 18.6℃ 体感 17.9℃
风况 东北风 5.5 m/s（4级）
──────────────────────
📅 未来三天
25 🌫  26 ⛅  27 ⛅
```

这个差异非常关键。

因为用户真正说出口的，往往不是 `Shanghai`、`Shanmenkou` 这种标准化英文名，而是：

- 上海市
- 宁波市
- 西安市雁塔区
- 杭州滨江区
- 深圳南山区

**当地点解析和显示名称都更贴近中文现实使用时，整个 skill 才真的像“在本地工作”。**

---

## 三、为什么 `caiyun-weather-skill` 在中国场景下更顺手

这里我不想只说“它用了彩云天气，所以更好”。真正重要的是：它把影响体验的几个细节补齐了。

![功能与体验差异总览](https://myimgbed.pages.dev/file/caiyun-weather-compare-20260325.svg)

### 1）地点输入更贴近中文习惯

这个 skill 支持两条路径：

- 默认地点：直接从 `.env` 读取经纬度和地点名
- 指定地点：先用 OpenStreetMap 地理编码，再去查彩云天气

这意味着你既可以：

```bash
python scripts/query.py
```

也可以：

```bash
python scripts/query.py --place "西安市雁塔区"
```

对于中国用户来说，这个设计很实用，因为很多天气查询其实就是两类：

- “我自己这边今天天气怎样”
- “某个中国城市 / 区县今天会不会下雨”

前者适合默认地点，后者适合中文地点直接查询。

### 2）输出已经按“聊天可读”做过一层整理

默认 weather skill 拿到的数据，更像原始天气服务的通用输出；`caiyun-weather-skill` 则多做了一步：把信息整理成适合直接回复给用户的结构。

它默认会把这些内容放在一起：

- 当前温度
- 体感温度
- 风向与风力等级
- 未来三天天气概况
- 未来 24 小时天气概况

这一步价值非常大。

因为大多数人问天气，不是想拿回一段 JSON，而是想快速回答这几个问题：

- 现在冷不冷
- 风大不大
- 今天大致什么天
- 接下来几个小时会不会变天

### 3）风况表达更符合中文阅读

这个 skill 里有两个细节我很喜欢：

- 风向用的是中文 16 方位
- 风力等级按彩云官方文档映射

所以你看到的是：

```text
北东北风 5.7 m/s（4级）
```

而不是只剩一个对用户不太友好的原始风速字段。

这类细节单看不大，但每天查天气的时候，会直接影响读起来顺不顺。

### 4）默认地点支持，让“今天天气”这类问法真正可落地

很多天气 skill 的问题不在于查不到，而在于：**每次都得重新说明地点。**

`caiyun-weather-skill` 通过 `.env` 里的这几个字段，把默认地点固化了下来：

```dotenv
CAIYUN_TOKEN=
CAIYUN_LNG=
CAIYUN_LAT=
TIMEZONE=Asia/Shanghai
PLACE_NAME=
```

这样配置一次以后，像“今天天气”“今天会不会下雨”“未来 24 小时怎样”这类高频问法，就能直接对默认地点生效。

这件事比看起来重要得多，因为它让天气查询从“一个需要临时拼参数的命令”，变成了“一个日常助手应该直接接住的问题”。

---

## 四、`CAIYUN_TOKEN` 怎么拿？

![彩云 token 获取与写入流程](https://myimgbed.pages.dev/file/caiyun-weather-token-steps-v2-20260325.svg)

### 1）先去彩云开放平台注册 / 登录

入口是：

- 开放平台：<https://open.caiyunapp.com/>
- 天气 API 文档：<https://docs.caiyunapp.com/weather-api/>

### 2）进入天气业务对应的后台页面

登录后，找到天气 API / 天气业务对应的管理入口。

这里界面以后可能会改，但按照彩云目前的认证文档，**token 认证对应的是“访问控制”里的 `Token 管理`**。如果你看到的是新版界面，也可以优先找这些关键词：

- 天气 API
- 访问控制
- Token 管理
- 凭证 / 令牌

### 3）复制 token，写入本地 `.env`

当前这个仓库的 `scripts/query.py` 用的是 `CAIYUN_TOKEN` 方案，所以把 token 填到这里就行：

```dotenv
CAIYUN_TOKEN=你的 token
CAIYUN_LNG=默认地点经度
CAIYUN_LAT=默认地点纬度
TIMEZONE=Asia/Shanghai
PLACE_NAME=默认地点名称
```

这里顺手提醒一句：**token 就是凭证，要等同于密码妥善保管**

仓库里保留 `.env.example` 就够了，真实值只放你本地的 `.env`。

### 4）填完后立刻本地验证，不要等接到 OpenClaw 再排错

最简单的验证方式就是：

```bash
python scripts/query.py
python scripts/query.py --place "上海市"
```

如果能稳定返回天气块，说明 token、经纬度和网络链路至少都已经通了。

---

## 五、怎么把它装进自己的 OpenClaw 工作区

如果你想直接试，这里给一个最小可运行示例。

### 1）克隆仓库

```bash
cd ~/.openclaw/workspace/skills
git clone https://github.com/fii6/caiyun-weather-skill.git caiyun-weather
cd caiyun-weather
```

### 2）复制配置文件

```bash
cp .env.example .env
```

### 3）填上你自己的彩云天气配置

```dotenv
CAIYUN_TOKEN=你的 token
CAIYUN_LNG=默认地点经度
CAIYUN_LAT=默认地点纬度
TIMEZONE=Asia/Shanghai
PLACE_NAME=默认地点名称
```

### 4）先测默认地点，再测指定地点

```bash
python scripts/query.py
python scripts/query.py --place "宁波市"
python scripts/query.py --place "西安市雁塔区"
```

如果你自己也在维护 OpenClaw 的技能路由，可以把这类中文天气问法优先交给它，例如：

- 今天天气
- 今天气温
- 今天是否下雨
- 24 小时天气概况
- 某某地天气

这样它就会更像“默认天气能力的中国场景增强版”。

---

## 六、默认 weather skill 还有没有价值？当然有

我不建议把默认 weather skill 说成“没用”。恰恰相反，它依然有两个很强的优势。

### 1）零配置

如果你只是临时查一下：

- 东京天气
- 伦敦周末会不会下雨
- 纽约今天多少度

默认 skill 几乎开箱即用，这点非常好。

### 2）全球范围更轻便

如果你的天气需求偏国际、偏临时查询，默认 skill 的低门槛优势会非常明显。

所以我的建议一直很简单：

- **查国外城市、临时查询、懒得配 token：保留默认 weather skill**
- **查中国城市、中文地点、高频日常使用：优先上 `caiyun-weather-skill`**

这两者不是互斥，而是各自有更擅长的场景。

---

## 七、实际使用时最容易踩的坑

### 坑 1：没有配 `CAIYUN_TOKEN`

这是最直接的，没 token 就无法请求彩云天气 API。

### 坑 2：只配了 token，没配默认经纬度

如果你想让“今天天气”这种无地点问法直接可用，就不能只填 token，还要把默认经纬度和地点名一起配好。

### 坑 3：把“更顺手”误解成“绝对更准”

这篇文章强调的是使用体验：

- 地点解析
- 中文表达
- 24 小时概况
- 风况展示

它不是在做严格的气象站对标实验。如果你要做的是严苛的天气精度评测，那是另一套题目；但如果你的目标是“让 OpenClaw 在中国像个更懂本地天气的助手”，这个 skill 已经非常值了。

### 坑 4：把 token 直接写进仓库

这也是实战里最容易犯的错之一。`.env.example` 应该公开，`.env` 不应该提交。否则辛苦配好的天气能力，最后先坏在凭证泄漏上。

---

## 八、总结：它真正补上的，是 OpenClaw 在中国天气场景里的最后一公里

回到最开始，这篇文章真正想回答的不是“彩云天气 API 强不强”，而是：

> 为什么同样是天气 skill，在中国场景里，有的只能算能用，有的会明显更顺手。

如果把结论压缩成 5 句话，可以这样总结：

1. OpenClaw 默认 weather skill 的优势是零配置、全球通用、临时查询方便。
2. 但在中国场景里，地点解析、中文输出和 24 小时概况往往不够贴近日常使用。
3. `fii6/caiyun-weather-skill` 通过彩云天气 API + OSM 地理编码，把这些关键体验补上了。
4. 它最有价值的不是“多一个天气源”，而是把中国用户最常见的天气问法变成了更自然的默认能力。
5. 如果你主要查中国天气，这个 skill 很值得装；如果你经常查全球城市，默认 weather skill 仍然该保留。

一句话概括：

**默认 weather skill 解决的是“先查到”，而 `caiyun-weather-skill` 解决的是“在中国更好用”。**

如果你也在用 OpenClaw，而且天气问题主要发生在中国城市，这个仓库非常值得试：

- GitHub：[`fii6/caiyun-weather-skill`](https://github.com/fii6/caiyun-weather-skill)
