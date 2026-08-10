# Theme: liquid-glass（Liquid Glass）

灵感来自 **Liquid Glass / 液态玻璃** 视觉语言：半透明材质、顶缘高光、连续大圆角。

## 视觉要点

| 项 | 规格 |
|----|------|
| 表面 | 半透明 tinted 毛玻璃（`backdrop-filter`） |
| 回退 | `@supports` 不支持时用实色面板 |
| 描边 | 细描边 + 顶缘高光渐变 |
| 圆角 | 约 18–22px |
| 强调色 | 系统蓝系 |
| 阴影 | 轻柔扩散阴影 |
| 字体 | SF / `-apple-system` 栈 |
| 网格 | **无** |

深色模式为一等公民。

## 使用

```bash
npm run build:themes
```

- 后台主题选择 **Liquid Glass**
- 或 `DEFAULT_THEME=liquid-glass`
- 或 KV `settings.theme = "liquid-glass"`
