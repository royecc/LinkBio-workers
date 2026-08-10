# Theme: qtcool（晴辰酷）

Neo-brutalism 风格，气质参考 [qt.cool/projects](https://qt.cool/projects)。

## 视觉

| 元素 | 规格 |
|------|------|
| 背景 | 奶油色 + 细网格 |
| 卡片 | 白底、2.5px 近黑描边、大圆角 |
| 阴影 | `4px 4px 0` 硬投影（无模糊） |
| 主色 | `#007AFF` |
| 点缀 | 黄 / 橙（头像 fallback 等） |
| 链接 | Brutal 卡片按钮；hover 阴影加大，active 按下 |

## 装饰

桌面端（≥768px）极弱几何圆/方块；**移动端关闭**。

## 使用

```bash
npm run build:themes
```

- 后台主题选择 **QT Cool / 晴辰酷**
- 或 `DEFAULT_THEME=qtcool`
- 或 KV `settings.theme = "qtcool"`
