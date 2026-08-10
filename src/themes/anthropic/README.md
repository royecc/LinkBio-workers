# Theme: anthropic（Anthropic 插画风）

## 色板

| 用途 | 色值 |
|------|------|
| 近黑线条 / 深色底 | `#141413` |
| 象牙卡片 | `#FAF9F5` |
| 浅色页底（oat） | `#E3DACC` |
| 强调色（clay） | `#D97757` |

特点：平涂、无渐变、偏衬线、卡片描边偏厚。

## 文件

- `theme.json` — 元数据（`id` 必须为 `anthropic`）
- `tokens.css` — `[data-theme-id="anthropic"]` 下的视觉变量与少量组件覆盖

## 接入

主题系统会通过 `npm run build:themes` 扫描本目录并写入 `_registry.ts` / `_bundle.css`。

- 页面：`data-theme-id="anthropic"`
- 可选：`DEFAULT_THEME=anthropic` 或后台选择 **Anthropic 插画风**
