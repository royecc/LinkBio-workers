# Theme: apple（Apple 风格）

参考 [Apple.com](https://www.apple.com) 营销页气质的视觉包。

## 色板

| 模式 | 画布 | 表面 | 主文字 | 次要文字 | 强调色 |
|------|------|------|--------|----------|--------|
| 浅色 | `#f5f5f7` | `#ffffff` | `#1d1d1f` | `#6e6e73` | `#0071e3` |
| 深色 | `#000000` | `#1d1d1f` | `#f5f5f7` | `#a1a1a6` | `#2997ff` |

## 设计要点

- **字体**：SF Pro / PingFang / `-apple-system` 栈，字距略收紧
- **画布**：冷灰 `#f5f5f7`（浅）/ 纯黑（深），**无**径向渐变
- **链接**：全胶囊 `border-radius: 980px`
  - **第一条**为实心蓝 CTA（类似 Buy / Learn more）
  - 其余为白/深灰抬升 pill
- **头像**：无描边，轻阴影
- **标题**：字重 600、`clamp` 大标题、负字距
- **工具条**：胶囊 + 毛玻璃
- **外链小图标**：弱化透明度，减少营销页上的“离开站点”感

## 使用

```bash
npm run build:themes
```

- 后台选择 **Apple / Apple 风格**
- 或 `DEFAULT_THEME=apple`
- 或 KV `settings.theme = "apple"`
