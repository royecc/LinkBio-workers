# Icons — 可扩展链接图标

> **图标 = `src/icons/*.svg` + 可选 `meta.json` + 构建期 registry；`public/icons/` 仅为构建产物。运行时只读生成物，无仓库扫盘。**

Workers **没有**可读仓库文件系统。内置链接图标必须在 **build 时** 打进 registry 并同步到 `public/icons/`（`npm run build:icons`）。

与 [主题](../themes/README.md) 同一心智模型：**改 `src/` → 构建 → 自动进产品**。

---

## 目录约定

```text
src/icons/
  _types.ts           # IconManifest schema（唯一标准）
  _registry.ts        # 构建生成 — 勿手改
  meta.json           # 可选：label / labelZh / aliases
  README.md
  link.svg            # 兜底 id，必须存在
  github.svg
  …
public/icons/         # 构建输出 — 勿手改；改源请编辑 src/icons/
```

- **id**：`^[a-z0-9]+(?:-[a-z0-9]+)*$`，与文件名（无扩展名）一致  
- **SVG**：建议 `viewBox="0 0 24 24"`；`currentColor` 或可被 CSS mask 的单色路径  
- **禁止**：在图标目录写业务 TS / 路由；禁止运行时远程拉内置图标清单；禁止手改 `_registry.ts` 或 `public/icons/*.svg`

---

## 新增图标（4 步）

1. **放入** monochrome SVG → `src/icons/{id}.svg`（文件名 = kebab-case id）  
2. **（建议）** 在 `meta.json` 的 `icons` 下加一条：`label` / `labelZh` / 可选 `aliases`  
3. **构建**：`npm run build:icons`（`dev` / `build` / `typecheck` / `build:worker` 会自动跑）  
4. **验收**：后台链接图标下拉出现新 id；前台 mask 着色正常  

无需改 `lib/icons.ts`、路由或组件逻辑。有 SVG 无 meta 时，label 会按 id 标题化；有 meta 无 SVG 会 **构建失败**。

---

## `meta.json` 字段

| 字段 | 要求 |
|------|------|
| `fallbackId` | 默认 `link`；必须有对应 SVG |
| `icons.<id>.label` | 英文展示名 |
| `icons.<id>.labelZh` | 中文展示名（可缺省，回退 label） |
| `icons.<id>.aliases` | 旧数据别名（如 `twitter` → `x`） |

---

## 构建产物

| 产物 | 说明 |
|------|------|
| `src/icons/_registry.ts` | `ICON_MANIFESTS` / `ICON_ALIASES` / `listIcons` / `getIcon` |
| `public/icons/{id}.svg` | 规范化后的静态 URL（`/icons/x.svg`），供 mask / img |

运行时 API 见 `lib/icons.ts`：`normalizeIconId`、`resolveLinkIconSrc`、自定义 `https://` 图标原样返回。

---

## 批量灌入（可选）

`scripts/generate-icons.mjs` 可从内嵌 path 数据 **写入 `src/icons/` 源目录**（非运行时清单）。日常维护请直接编辑 `src/icons/*.svg` 与 `meta.json`。
