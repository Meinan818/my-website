# 快乐大野鸡的项目集

这里是曾经那位快乐大野鸡留下的神迹，里面有编程项目、课程设计和技术探索。
计算机专业在读，白天写代码，晚上写 bug。

## 在线访问

| 项目 | 链接 |
|------|------|
| 主站（项目集首页） | https://zhuzhan-dpw.pages.dev/ |
| 简易电商平台 | https://dianshang-1uv.pages.dev/ |
| 在线笔记 | https://jjbj.pages.dev/ |
| 智能聊天机器人 | https://ai-cdr.pages.dev/ |
| 贪吃蛇游戏 | https://lqx666.pages.dev/ |
| 数据可视化看板 | https://sjkb.pages.dev/ |
| 待办事项清单 | https://dbqd.pages.dev/ |
| 栗子救援队 | https://lizi-eg0.pages.dev/ |

## 目录结构

```
my-website/
├── index.html          # 主站（项目集首页）
├── ecommerce/          # 简易电商平台（PWA，含 manifest / service worker / 图标）
├── notes/              # 在线笔记
├── chatbot/            # 智能聊天机器人
├── snake/              # 贪吃蛇
├── dashboard/          # 数据可视化看板
├── todo/               # 待办事项
└── lizi/               # 栗子救援队（Canvas 平台跳跃游戏）
```

## 项目简介

- **简易电商平台**：黑白 SELECTED 风格，支持邮箱注册登录、商品浏览、分类切换、购物车，
  管理员可增删改商品。接入 Supabase 云端，账号与商品数据实时同步，同时是可安装的 PWA。
- **在线笔记**：支持注册登录、笔记增删改查、搜索、自动保存，按账号隔离，数据存 Supabase 云端。
- **智能聊天机器人**：对话式交互界面。
- **贪吃蛇**：复古街机风，键盘 / 触屏操作，含音效与静音开关、最高分记录。
- **数据可视化看板**：多图表数据看板，支持时间范围切换。
- **待办事项**：看板式任务管理，支持拖拽 / 按钮移动、搜索。
- **栗子救援队**：Canvas 平台跳跃闯关，松鼠收集栗子、搬箱、旗帜存档，多关卡 + BOSS 战，
  支持键盘 / 触屏与本地双人。

## 技术栈

- 原生 HTML / CSS / JavaScript（单文件、无构建）
- HTML5 Canvas、Web Audio API
- Supabase（PostgreSQL、Auth、Realtime）
- 部署：Cloudflare Pages
