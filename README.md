# 🏸 川崎礼盒 · 图册

一个纯静态的礼盒图片展示页，部署在 GitHub Pages 上。

**特点**：上传图片即自动更新，不用改代码。系列分组根据文件名关键词自动判断。

---

## 日常使用：上传图片

**每次更新只需要做一件事：把图片传到 `images/` 文件夹。**

### 网页上传（推荐，简单）

1. 进入仓库，点开 `images` 文件夹
2. 点右上角 `Add file` → `Upload files`
3. 把图片拖进去
4. 拉到底部点 `Commit changes`

刷新页面即可看到新图。若没变化，按 `Ctrl + F5` 强制刷新。

### 命令行上传（图片多时更快）

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
# 把图片复制到 images/ 文件夹
git add images/
git commit -m "新增：极光7星座限定"
git push
```

### 删除图片

在 `images/` 文件夹里点开对应图片 → 右上角垃圾桶图标 → `Commit changes`。页面同步移除卡片。

### 图片要求

| 项目 | 建议 |
|---|---|
| 格式 | `.png` / `.jpg` / `.jpeg` / `.webp` / `.gif` / `.avif` |
| 大小 | 单张 300KB 以内，加载更快 |
| 命名 | 见下方规则，**必须带系列关键词才会自动分组** |
| 大小写 | GitHub 严格区分大小写，文件名保持一致 |

### 命名示例

```
✅ 川崎礼盒-极光7礼盒03.png          → 自动归入「极光系列」
✅ 川崎礼盒-青鸟礼盒08-凤凰游.png     → 自动归入「青鸟系列」
✅ 川崎礼盒-极光7狮子座礼盒.png       → 自动归入「12星座系列」
✅ 川崎礼盒-莫奈-睡莲01.jpg           → 自动归入「艺术·联名·限定」
✅ 通用礼盒-2026龙马精神礼盒.png      → 归入「其他主题礼盒」
```

文件名（去掉扩展名）会直接显示在卡片下方。

### 更新后页面没变？

- 页面有 **5 分钟缓存**，等一会儿或按 `Ctrl + F5` 强制刷新
- 确认图片确实在 `images/` 文件夹里
- 确认文件名后缀是小写（`.PNG` 可能不识别）

---

## 自动分类规则

程序按下面的顺序匹配文件名，**命中即停**。想调整归类，改 `index.html` 里的 `RULES` 数组。

| 顺序 | 系列 | 匹配关键词 |
|---|---|---|
| 1 | ＆ 12星座系列 | 星座、白羊、金牛、双子、巨蟹、狮子、处女、天秤、天蝎、射手、摩羯、水瓶、双鱼 |
| 2 | ⚡ 极光系列 | 极光 |
| 3 | 🐦 青鸟系列 | 青鸟 |
| 4 | 🔩 螺纹钢系列 | 螺纹钢 |
| 5 | 🎋 国风系列 | 定风波、赤壁赋、金榜题名、竹影、凤栖 |
| 6 | 🎨 艺术·联名·限定 | 莫奈、梵高、达芬奇、星月夜、麦田、睡莲、鸢尾、向日葵、岩间圣母、丝柏、联名 |
| — | 🎁 其他主题礼盒 | 以上都不含（默认） |

### 手动指定某个图片的分组

如果自动分类不准，在 `index.html` 的 `OVERRIDE` 里加一行：

```js
const OVERRIDE = {
    '川崎礼盒-梧桐-凤栖礼盒01': 'other',
    '川崎礼盒-极光7情人节05': 'aurora',
};
```

键是**去掉扩展名的文件名**，值是系列 id（`aurora` / `bluebird` / `rebar` / `dingfengbo` / `art` / `xingzuo` / `other`）。

### 新增一个系列

1. 在 `SERIES` 数组里加一项：

```js
{ id: 'newseries', title: '🌟 新系列' },
```

2. 在 `RULES` 里加匹配规则：

```js
{ id: 'newseries', re: /关键词1|关键词2/ },
```

---

## 首次部署

> 已经部署过的仓库可以跳过这一节。

### 1. 创建仓库

登录 GitHub → 右上角 `+` → `New repository`

| 项目 | 填写 |
|---|---|
| Repository name | `kawasaki-box`（或任意名字） |
| 可见性 | **必须选 Public**（私有仓库无法读取图片列表） |
| 初始化 | 勾选 `Add a README file` |

### 2. 上传 index.html

1. 进入仓库，点 `Add file` → `Create new file`
2. 文件名填 `index.html`
3. 把项目里的 `index.html` 内容完整粘贴进去
4. 拉到文件开头，修改这两行：

```js
const OWNER = '你的GitHub用户名';   // 例如 'zhangsan'
const REPO  = '你的仓库名';         // 例如 'kawasaki-box'
```

> ⚠️ **只写名字，不要写完整链接**
> - ✅ `OWNER = 'zhangsan'`
> - ❌ `OWNER = 'https://github.com/zhangsan'`
> - ❌ `REPO = 'kawasaki-box.git'`

5. 点 `Commit changes`

### 3. 创建 images 文件夹

1. 仓库页面点 `Add file` → `Create new file`
2. 文件名填 `images/readme.md`（GitHub 会自动建文件夹）
3. 随便写点内容，`Commit changes`
4. （可选）之后再把这个占位文件删掉

### 4. 开启 GitHub Pages

1. 仓库 → `Settings` → 左侧 `Pages`
2. Source 选 `Deploy from a branch`
3. Branch 选 `main`，文件夹选 `/ (root)`
4. 点 `Save`
5. 等 1–2 分钟，刷新页面，顶部会出现网址：

```
https://你的用户名.github.io/仓库名/
```

打开就能看到页面了。

---

## 效果预览

页面按系列分组展示，每个礼盒一张卡片，鼠标悬停有上浮效果。

```
🏸 川崎礼盒 · 图册
全系列礼盒一览（共 51 款）

⚡ 极光系列
[卡片] [卡片] [卡片] ...

🐦 青鸟系列
[卡片] [卡片] ...
```

---

## 常见问题

### 图片上传了但页面没显示？

1. **等 5 分钟**。页面有 5 分钟缓存，或按 `Ctrl + F5` 强制刷新
2. 确认图片确实在 `images/` 文件夹里
3. 确认文件名后缀是小写（`.PNG` 可能不识别，建议统一小写）
4. 打开浏览器 F12 控制台看有没有红色报错

### 页面显示「加载失败」？

依次检查：

- 仓库是不是 **Public**（私有仓库不能用这个方案）
- `OWNER` 和 `REPO` 有没有填错
- 默认分支是不是叫 `main`（若叫 `master`，把代码里 `?ref=main` 改成 `?ref=master`）
- 是不是短时间内刷新太多次，触发了 GitHub API 限流（60 次/小时，等一会儿即可）

### 图片太多（超过 1000 张）怎么办？

GitHub 的目录 API 一次最多返回 1000 个文件。超过的话，改用 GitHub Actions 生成清单文件。在仓库里新建 `.github/workflows/build-list.yml`：

```yaml
name: 生成图片清单
on:
  push:
    paths: ['images/**']
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - name: 扫描 images
        run: |
          python3 -c "
          import os, json
          d = 'images'
          files = sorted(f for f in os.listdir(d) if f.lower().endswith(('.png','.jpg','.jpeg','.webp','.gif'))) if os.path.isdir(d) else []
          json.dump(files, open('list.json','w',encoding='utf-8'), ensure_ascii=False, indent=2)
          "
      - name: 提交
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add list.json
          git diff --staged --quiet || git commit -m "更新图片清单"
          git push
```

然后把 `index.html` 里的 `fetchList()` 函数替换成：

```js
async function fetchList() {
    const res = await fetch('list.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const files = await res.json();
    return files.map(f => ({
        file: f,
        url: 'images/' + encodeURIComponent(f),
        name: f.replace(/\.[^.]+$/, ''),
    }));
}
```

好处：不依赖 API、无限流、图片数量无上限、访问更快。

### 想改页面配色 / 字号？

全在 `index.html` 顶部的 `<style>` 里，改这几项：

| 改什么 | 找哪行 |
|---|---|
| 背景色 | `body { background: #f5f2ee; }` |
| 主标题 | `h1 { ... }` |
| 系列标题左侧色条 | `.series-title { border-left: 8px solid #e67e22; }` |
| 卡片圆角 | `.card { border-radius: 16px; }` |
| 每行卡片最小宽度 | `.grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }` |

---

## 版本记录

### v1.0.0 — 初始版本

- 静态礼盒图册页面，按系列分组展示
- 手动维护礼盒列表（`allBoxes` 数组）
- 需手动修改 `index.html` 才能新增礼盒

### v2.0.0 — 自动化版本（当前）

**新增**

- 自动读取 `images/` 文件夹，上传图片即更新，无需改代码
- 根据文件名关键词自动分类到对应系列
- 支持 `OVERRIDE` 手动指定个别图片的分组
- 5 分钟本地缓存，减少 API 请求
- 图片懒加载（`loading="lazy"`）
- 图片缺失时显示占位提示
- 加载失败时给出排查提示
- 空系列自动隐藏

**变更**

- 图片路径改用 `encodeURIComponent` 处理中文和特殊字符
- 从 `innerHTML` 拼接改为 DOM API 构建，更稳定

**移除**

- 不再需要手动维护礼盒列表数组

---

## 技术说明

- 纯静态页面，无需后端、无需构建
- 依赖 GitHub Contents API 读取图片列表
- 托管于 GitHub Pages

## 许可

图片版权归各自品牌所有，本项目仅用于展示。