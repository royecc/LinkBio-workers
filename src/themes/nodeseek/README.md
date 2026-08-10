# Theme: nodeseek（NodeSeek）

现代中文技术论坛气质。

## 视觉

| 项 | 规格 |
|----|------|
| 画布 | 冷灰 / 深灰纯色 + ~24px 淡网格（浅色青蓝透明线，深色更弱） |
| 卡片 | 实色白 / 深色表面，**不透明** |
| 边框 | 1px 细线 |
| 阴影 | 轻 `box-shadow`（非硬偏移） |
| 主色 | 浅 `#0B6E99` · 深色略亮青蓝 |
| 圆角 | ~12px |
| 链接 | 论坛列表行；hover 微亮 + 左侧 accent 线 · 约 180ms |

## 使用

```bash
npm run build:themes
```

后台 **主题** 页选择 **NodeSeek**，或：

- env `DEFAULT_THEME=nodeseek`
- KV `settings.theme = "nodeseek"`
