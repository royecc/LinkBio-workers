# Themes — 可扩展视觉包

> **主题 = 仓库内标准目录 + 构建期打进 registry/CSS；默认主题由 `DEFAULT_THEME` 变量决定；运行时用 KV `settings.theme` 切换 `data-theme-id`；深浅色仍由 `data-theme` 正交控制。**

Workers **没有**可读仓库文件系统。所有主题必须在 **build 时** 打进 bundle（`npm run build:themes`）。

---

## 主题差异矩阵（一主题一灵魂）

维护时对照此表：新增主题必须填补空白，禁止与现有行在「颜色 × 表面 × 链接形态」上撞车。

| id | 灵魂 | 主色 | 圆角语言 | 阴影 / 边框 | 表面处理 | 字体 | 链接形态 |
|----|------|------|----------|-------------|----------|------|----------|
| **aurora** | 北方夜空 / 极光 | 冷青–靛紫 | 中等 0.9–1rem | 梦幻软阴影 | **径向极光渐变** | Inter | 中等圆角实色按钮 |
| **minimal** | 几乎没设计 | 单色深灰 | **近直角** 4–6px | **无阴影、无边框** | 纯平 | 系统轻字重 | 极薄下划线感 / 极淡底 |
| **apple** | 产品营销页 | #0071e3 | **大 tile 28px + 胶囊 980px** | 极轻 elevation | **实色** 冷灰画布 | SF | 胶囊 CTA（首链主色） |
| **anthropic** | 编辑 / 插画纸 | 黏土 #D97757 | **小圆角** 6–8px | **厚描边、无阴影** | 燕麦页 + 象牙卡 | **衬线** | 便签/卡片块 |
| **hono-old** | Linear/Vercel 暗色 | 锐利 indigo | 14px | 深阴影 + 内高光 | **深黑 + 强径向光晕** | Inter | **居中** 按钮行 |
| **liquid-glass** | 液态玻璃 | 系统蓝偏青 | 连续 18–22px | 内高光 + 外软影 | **半透明 + 高 blur** | SF | 玻璃块 + 液面过渡 |
| **md3** | Material 3 | 紫 seed #6750A4 | 12 / 16 / 24 | MD Level 1–2 | Tonal 表面 | **Roboto** | Filled/tonal 圆角按钮 |
| **miuix** | HyperOS | **#3482FF** | **Squircle 16–28px** | 蓝调软影 + 轻模糊 | 干净高对比 | 中文系统栈 | 次色容器胶囊 |
| **nodeseek** | 技术论坛 | 青绿 #0B6E99 | 12px | 1px 细边 + 轻 elev | **网格底 + 实心卡** | 中文系统栈 | **帖子行** + 左侧 accent bar |
| **qtcool** | Neo-brutal | #007AFF + 黄橙 | 圆润 1.15–1.5rem | **硬偏移 5–8px 无模糊** | 奶油网格 + 色块 | 圆体 | 厚描边贴纸按钮 |
| **xandroid** | X Android 时间线 | **#1D9BF0 仅强调** | 卡 **~14px** / 链 **0** | **无阴影** | 纯白/纯黑 | Chirp | 时间线 hairline 列表行 |
| **rin** | Edge 博客 / openRin | **#FC466B 玫瑰** | 中等 12–18px | 带粉调软阴影 | **#f5f5f5 / #1c1c1e** 干净表面 | 系统 | 白卡片链接 + 粉 hover |

### 重叠组拆分约定

| 易混组 | 如何拉开 |
|--------|----------|
| apple ↔ liquid-glass ↔ miuix | apple = 实色营销胶囊；liquid-glass = 半透明玻璃；miuix = 小米蓝 + squircle + 中文密度 |
| aurora ↔ hono-old | aurora = 青绿紫极光渐变；hono-old = 纯深黑 + indigo 光晕 + 居中链 |
| nodeseek ↔ xandroid | nodeseek = 网格 + 卡片行 + 左侧色条；xandroid = 无网格 + 0 圆角时间线 |
| md3 ↔ miuix | md3 = Google 紫 tonal；miuix = 小米蓝 squircle |

### 新增主题原则

1. 只强化 **1–2 个** 最强特征，其余做减法  
2. 填补矩阵空白（如赛博、终端、真正动态色等）  
3. 只改 `theme.json` + `tokens.css`，组件级可覆盖 `.theme-*`，**禁止**改 `_default.css` 布局结构  
4. **勿覆盖** `--space-toolbar-clear` 等安全间距  

---

## 目录约定

```text
src/themes/
  _types.ts           # ThemeManifest schema（唯一标准）
  _registry.ts        # 构建生成 — 勿手改
  _bundle.css         # 构建生成 — 勿手改
  _default.css        # 布局/组件结构（与皮肤无关）
  aurora/             # 内置兜底（极光），必须存在
  minimal/ apple/ anthropic/ hono-old/ liquid-glass/
  md3/ miuix/ nodeseek/ qtcool/ xandroid/ rin/
```

**一个主题 = 一个目录 = `theme.json` + `tokens.css`。**  
禁止：主题目录里写业务逻辑 / 路由；禁止 JSON 里塞大段 CSS；禁止运行时远程拉主题。

---

## 新增主题（4 步）

1. **复制** 相近主题目录 → `my-theme/`（文件夹名 = kebab-case id）  
2. **改** `theme.json`：`id`（必须等于文件夹名）、`name`、`nameZh`、`description`  
3. **改** `tokens.css`：token + 必要的 `.theme-*` 覆盖  
4. **构建**：`npm run build:themes`（`dev` / `build` / `typecheck` 会自动跑）  

无需改 `app/page.tsx`、路由或核心业务。后台下拉会自动出现新主题。

---

## `theme.json` 字段

| 字段 | 要求 |
|------|------|
| `id` | 与文件夹名一致，kebab-case |
| `name` / `nameZh` | 后台展示（要有辨识度） |
| `description` | 英文短描述（一句话 DNA） |
| `version` | schema 版本，从 `1` 起 |
| `tokensFile` | 默认 `"tokens.css"` |
| `features` | 可选：`blur`、`gradientBg`、`customFonts` 等 |

类型定义见 `_types.ts` 的 `ThemeManifest`。

---

## `tokens.css` 约定

与 **深浅色正交**：

| HTML 属性 | 含义 |
|-----------|------|
| `data-theme` | `system` \| `light` \| `dark`（亮度） |
| `data-theme-id` | 皮肤 id（圆角、品牌色、质感） |

颜色 token 使用 **HSL 通道**（无 `hsl()` 包裹）。  
结构 class：`.theme-page`、`.theme-link`、`.theme-avatar`、`.theme-card`、`.theme-footer`、`.theme-toolbar`。

### 响应式边距（勿覆盖顶栏避让）

| 变量 | 用途 |
|------|------|
| `--space-page-x` / `--space-page-x-end` | 左右页边距 |
| `--space-toolbar-clear` | **顶栏避让区** |
| `--space-stack` / `--space-links` | 区块 / 链接间距 |
| `--space-touch-min` | 可点元素最小高度（≈44px） |

主题若覆盖 `.theme-page` 的 padding，**请保留 `padding-top: var(--space-toolbar-clear)`**。

用户后台 **accentColor** 可运行时覆盖 `--primary`；主题只提供默认品牌色。

---

## 默认主题与解析顺序

| 变量 | 类型 | 含义 |
|------|------|------|
| `DEFAULT_THEME` | Workers **Vars** | 无有效 KV 主题时的默认 id（现常为 `minimal`） |

解析：

1. KV `settings.theme` 若为已注册 id → 用它  
2. 否则 `env.DEFAULT_THEME` 若合法 → 用它  
3. 否则兜底 **`aurora`**（`FALLBACK_THEME_ID`）  

非法 id **永不白屏**。Legacy 别名：`base`/`default` → `aurora`，`ios27` → `liquid-glass`。

---

## 构建

```bash
npm run build:themes
# 扫描 src/themes/*/theme.json → _registry.ts + _bundle.css
```

**构建 = 打包全部主题 tokens**；`DEFAULT_THEME` 只影响默认选中。

---

## AI / 人 checklist

- [ ] 目录名 kebab-case，与 `theme.json` → `id` 一致  
- [ ] 有 `name`、`nameZh`、`version`、`tokensFile`；description 写出 DNA  
- [ ] 对照差异矩阵，不与现有主题撞车  
- [ ] 只有 `theme.json` + `tokens.css`（无业务 TS）  
- [ ] light / dark / system 映射完整  
- [ ] 未覆盖 `--space-toolbar-clear`  
- [ ] `npm run build:themes` 成功  
- [ ] 后台可见并保存；前台 `data-theme-id` × 深浅色正常  
