---
title: "解决 Termux OpenClaw 浏览器控制问题"
date: 2026-03-08 09:32:00
categories:
  - OpenClaw
tags:
  - openclaw
  - termux
  - browser control
description: "在 Termux 上用 OpenClaw Browser Control 报 'No supported browser found'？别急着重装 Chromium。这篇文章把这个故障拆成一个可复用的诊断模型——三段切分、显式声明、信号验收——让你下次遇到任何 '装好了但没被发现' 的问题都能少走两小时弯路。"
cover: "https://myimgbed.pages.dev/file/1778672799383_file_0000000051dc722fae8b1af0e3bb37ff.png"
---

> 如果你已经 `pkg install chromium` 第三遍了，先停一下——大概率不是浏览器的问题。

在 Android Termux 上跑 OpenClaw Browser Control，最容易撞到的报错是这一行：

> `No supported browser found`

它非常具有迷惑性：字面读起来就像“你没装浏览器”，于是 80% 的人第一反应是卸了重装、换源重装、加 root 重装……折腾两小时后回到原点。

这篇文章不只给你一个 Termux 下的修复配置。更重要的是，它会把这次故障抽象成**一个可复用的诊断模型**——下次再遇到任何“装好了但没被识别”的问题，你都能套用同一套思路，少踩一次坑。

## 一、读完你会拿到什么

1. 一份 Termux + OpenClaw 下立刻能用的最终配置
2. 一套**“三段切分”**故障定位法：把模糊报错切成 3 个独立可验证的责任段
3. 一组**信号化验收标准**：让“好像能用了”变成“按这 4 个字段判断”
4. 一条可迁移到其他工具链的元认知：**安装成功 ≠ 被识别成功**

如果你只想要修复，跳到第六节；如果你想要的是“以后类似坑都能自己拆”，建议从第三节开始读。

## 二、为什么这个报错最容易把人带偏

`No supported browser found` 把读者的注意力直接钉死在“浏览器”上：

- 是不是 Chromium 没装好？
- 是不是 apt 源损坏？
- 是不是包根本没存在？

但**这次问题真正的位置完全不在浏览器本体**，而在更上游一层——**OpenClaw 用来发现浏览器的那条链路**。

换句话说：

- 浏览器是好的
- 坏的是“识别机制”

这就是为什么反复重装无效——你修的不是出问题的那一层。

![Termux Browser 故障终端现场](https://myimgbed.pages.dev/file/termux-browser-terminal-error.svg)

上图是典型故障现场的几个特征：

- `pkg install x11-repo && pkg install chromium` 都执行成功
- 但 `browser status` 看到的 `detectedExecutablePath` 是空的
- Browser Control 启动仍然失败

注意第二条是关键：**浏览器装到了，但 OpenClaw 没看见**。这一句几乎就是这次故障的全部精华。

## 三、核心方法论：把报错切成三段独立责任

这一节是这篇文章里最值得带走的部分。它**不限于 OpenClaw**，对任何“工具链报错指向不明”的场景都适用。

模糊的报错（比如 `No supported browser found`）之所以让人乱投医，是因为它把一整条链路压缩成一句话。要破解它，就把链路重新展开成几段，每段单独判断真假：

1. **上层是否“看见”了下层？** —— OpenClaw 探测到浏览器了吗？
2. **下层是否“真的存在”？** —— 可执行文件是否在磁盘上？
3. **下层是否“能独立工作”？** —— 浏览器单独跑能不能起来？

只要这三段答案落定，根因自动就浮出来了：

| 1 看见 | 2 存在 | 3 能起 | 真正问题在哪 |
|:---:|:---:|:---:|:---|
| ❌ | ❌ | ❌ | 安装没成功 → 修安装 |
| ❌ | ✅ | ❌ | 浏览器本体坏了 → 修运行环境 |
| ❌ | ✅ | ✅ | **识别链路没命中**（本次） → 显式声明路径 |
| ✅ | ✅ | ✅ | 不是这条链路的问题 → 看别处 |

这次故障落在第三行：**装了，能跑，但上层没看见**。这是一类非常常见但常被忽略的失败模式。

![误判路径与正确路径对比](https://myimgbed.pages.dev/file/termux-browser-before-after.svg)

错误的处理路径是看到报错就动手重装，每装一次都要等几分钟，反复三次半天就过去了；正确路径是先做一次三段判断，五分钟内根因到位。

## 四、按三段顺序实地排查

### Step 0：前置条件，别在这一步偷懒

Termux 装 Chromium 必须先开 `x11-repo`：

```bash
pkg install x11-repo
pkg install chromium
```

这一步出问题会让后面的所有判断都失真——“前置条件错误”会污染整条诊断链。

### Step 1（看见）：OpenClaw 识别到了吗？

```bash
browser status
```

重点看四个字段：

- `running`
- `detectedBrowser`
- `detectedExecutablePath`
- `chosenBrowser`

如果 `detectedExecutablePath: null`，问题已经定位了一半——**识别链路没命中**。

### Step 2（存在）：可执行文件真的在吗？

```bash
which chromium-browser
ls -l /data/data/com.termux/files/usr/bin/chromium-browser
```

返回了路径就说明：装是真装上了，磁盘上是真有这个文件。这一段直接排除“没装浏览器”这个假设。

### Step 3（能起）：浏览器自己能不能跑？

```bash
chromium-browser --headless --disable-gpu --remote-debugging-port=18801 about:blank
```

看到这一行就够了：

```text
DevTools listening on ws://127.0.0.1:18801/devtools/browser/...
```

它同时回答了两件事：Chromium 本体没问题、CDP 通道也没问题。这条命令会占前台，看到提示后 `Ctrl+C` 退出即可。

走完这三步，根因就锁定了：**浏览器一切正常，OpenClaw 的自动探测没命中 Termux 路径**。

## 五、为什么自动探测会失败

OpenClaw 的浏览器探测会在一组“常见路径”里去找。Termux 的 Chromium 不在标准 Linux 桌面环境的位置，而是埋在：

```
/data/data/com.termux/files/usr/bin/chromium-browser
```

这条路径对探测器来说就是“没听过的地址”，所以扫一圈什么都没匹配上，就报了 `No supported browser found`。

这个问题的修法因此非常自然：**别让它猜，直接告诉它**。

## 六、最终修复：显式声明 + 两个兼容开关

写入 `~/.openclaw/openclaw.json`：

```json
{
  "browser": {
    "executablePath": "/data/data/com.termux/files/usr/bin/chromium-browser",
    "headless": true,
    "noSandbox": true
  }
}
```

然后重启 gateway：

```bash
openclaw gateway restart
```

三个字段各自负责一件事，不要把它们当作“随便补的参数”：

- `executablePath` —— 解决**识别问题**：不再依赖路径猜测
- `headless: true` —— 解决**稳定性问题**：去掉对图形环境的依赖
- `noSandbox: true` —— 解决**兼容性问题**：绕过 Android/Termux 的沙箱限制

每一个都对应一类潜在故障，缺一个都可能在不同时间点冒出来。

## 七、信号化验收：别凭“好像能用了”

修完不要靠感觉。看一组明确信号。

![修复后终端验证信号](https://myimgbed.pages.dev/file/termux-browser-terminal-success.svg)

最小验收清单：

1. `browser status` 同时满足：
   - `running: true`
   - `cdpReady: true`
   - `detectedBrowser: custom`
   - `detectedExecutablePath` 指向 Termux Chromium
2. 能打开一个真实页面
3. 能成功截图
4. 能正常关闭标签并退出

四条全过才算真修好。任意一条没过，都说明刚才那次成功可能是侥幸。

**写到这里其实有个隐藏的方法论**：好的验收不是“跑一遍没报错”，而是“能讲出 4 个具体信号”。一个故障没有验收信号，就永远没有修完的那一刻。

## 八、把这套思路迁移出去

这次具体修的是 OpenClaw + Termux + Chromium 的探测问题，但**真正可复用的不是这个配置，而是诊断结构本身**。下面这些场景都可以直接套：

- **VS Code / 编辑器找不到 Python 解释器** —— Python 装了，但 IDE 的探测器没扫到 → 显式配置 `python.defaultInterpreterPath`
- **Node CLI 报 `command not found`** —— 包装好了但 PATH 没生效 → 显式声明可执行路径或 shell init
- **Docker 容器里探测不到 GPU** —— 驱动在、设备在，但运行时没透传 → 显式 `--gpus`、显式设备映射
- **CI 里跑得了但本地跑不了**（或反过来）—— 工具存在，但发现机制依赖的环境变量缺失 → 显式注入

它们看起来毫无关系，但内核都是同一句话：

> **“装好了”和“被上层识别到了”是两回事。**

下次再遇到“明明装了 X 却找不到 X”的报错，先做这件事：

1. 把链路按“看见 / 存在 / 能起”三段切开
2. 跑三个最小验证命令，把责任落到具体一段
3. 如果坏在“看见”这一段——优先**显式声明**，不要先重装

这个判断只要 5 分钟，能省你两小时。

## 九、长期使用注意事项

如果后续你会：

- 升级 Chromium
- 换设备
- 迁移 Termux 环境

优先复检这几样，比直接重装快得多：

- `browser.executablePath` 是否仍指向真实存在的文件
- `headless` / `noSandbox` 是否还在
- `browser status` 的 `cdpReady` 是否仍为 `true`

这些都是“探测链路”的健康信号，不是浏览器本体的健康信号——再次提醒别搞反了。

## 十、一屏速查（可直接照抄）

```bash
# 前置安装
pkg install x11-repo
pkg install chromium

# 三段切分
browser status                                  # 1) 上层看见了吗？
which chromium-browser                          # 2) 存在吗？
ls -l /data/data/com.termux/files/usr/bin/chromium-browser
chromium-browser --headless --disable-gpu \
  --remote-debugging-port=18801 about:blank     # 3) 能起吗？

# 显式声明 + 重启
# 编辑 ~/.openclaw/openclaw.json 后：
openclaw gateway restart
```

四个验收信号：

- `detectedExecutablePath` 不为空
- `DevTools listening` 出现过
- `running: true`
- `cdpReady: true`

## 十一、一句话带走

这篇文章真正想让你记住的不是某条 JSON 配置，而是：

> **遇到“X 装好了但找不到 X”的报错，先修“识别链路”，不要先重装 X。**

把它变成你工具链直觉的一部分。下次再撞到任何 `No supported X found` 类报错——不管 X 是浏览器、解释器、驱动还是 CLI——你都能用同一套三段切分快速定位，而不是又开始等下一次 `pkg install` 跑完。
