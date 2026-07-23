# Synced Lyric Image · 同步歌词图片

A WordPress block plugin: while the audio plays, lines of your lyric **image** fade in and out in sync with the music.

Perfect for music posts where you want to keep the texture of a handwritten manuscript or lyric poster, instead of falling back to plain text lyrics.

一个 WordPress 古腾堡区块插件：音频播放时，歌词**图片**按行随时间轴淡入淡出。适合在博客发布歌曲时使用——保留手写稿、歌词海报的图片质感，而不是退化成纯文字歌词。

---

## Features

- Each lyric line fades in at its timestamp (with a subtle rise + de-blur), and fades out when sung
- Auto-trims horizontal whitespace of every line (canvas-based ink detection)
- One lyric line can span multiple image rows (e.g. `8-9`)
- Long instrumental gaps fade to a subtle `· · ·` breather
- White-background images can blend into light themes via a one-click toggle (`mix-blend-mode: multiply`), or use a transparent PNG directly
- Minimal player controls that inherit your theme's colors

## Install

1. Download `synced-lyric-image.zip` from [Releases](../../releases)
2. WP Admin → Plugins → Add New → Upload Plugin → Activate
3. Edit a post → insert the **Synced Lyric Image** block (Media category)

## Usage

After inserting the block:

1. **Pick the audio** (mp3 / flac / … from your media library)
2. **Pick the lyric image**
3. **Fill in the row bands** — how to slice the image, one band per line:

   ```
   top% bottom% [left% right%]
   ```

   Example: `14.4 19.4` covers the vertical span from 14.4% to 19.4% of the image height.
   Left/right are auto-trimmed, so you usually don't need them — only set them to exclude stray ink (like a signature).
   For neatly typeset lyric screenshots, use the sidebar button "Split into N equal bands".

4. **Fill in the timeline** — when to show which band, one cue per line:

   ```
   [mm:ss.xx] row
   [mm:ss.xx] firstRow-lastRow
   ```

   Example: `[00:41.32] 2` shows band 2 at 41.32s; `[03:09.78] 8-9` shows bands 8 and 9 together (one sung line written across two rows).

### Full example (宋冬野《落雁》 handwritten manuscript, 739×975)

Bands (band 1 is the handwritten title shown during the intro; the trailing `0 63` on the last two bands crops out the signature at bottom-right):

```
4.4 11.9
14.4 19.4
20.4 24.3
25.7 30.4
33.4 38.1
38.6 43.3
43.7 48.0
50.8 55.4
56.6 60.6
61.7 65.4
67.0 71.4
74.1 78.8
79.5 83.8
84.9 89.4 0 63
89.7 94.1 0 63
```

Timeline:

```
[00:03.00] 1
[00:41.32] 2
[00:55.50] 3
[01:04.60] 4
[01:29.13] 5
[01:35.59] 6
[01:41.05] 7
[01:43.57] 8
[01:49.21] 9
[01:55.89] 10
[02:03.03] 11
[02:12.50] 12
[02:19.59] 13
[02:25.91] 14
[02:33.02] 15
[03:09.78] 8-9
[03:22.00] 10
[03:29.09] 11
[03:38.40] 12
[03:45.51] 13
[03:51.80] 14
[03:59.02] 15
[04:06.97] 14-15
[04:21.27] 14-15
```

## Tips

- **Where to get timestamps**: NetEase Cloud Music / QQ Music lyric pages usually expose LRC; extract each `[mm:ss.xx]` and map lines to image rows
- **White-background images**: just toggle "Blend white background" in the sidebar — no image editing needed (best on light themes)
- **For a true transparent background**: knock out the white and save as PNG for the cleanest result

## Technical notes

- Dynamic block (PHP `render_callback`); zero-dependency vanilla JS on the frontend; no build step in the editor (plain `wp.element`)
- Bands are rendered with `background-position` cropping — the image is never physically sliced
- Auto horizontal trim uses canvas pixel scanning; cross-origin images gracefully fall back to full width

---

## 功能

- 每句歌词在对应时间点淡入（轻微上浮 + 去模糊），唱完淡出
- 自动收紧每行的左右空白（canvas 扫描墨迹范围）
- 支持一句歌词横跨多行图片（如 `8-9`）
- 长间奏自动淡出，显示淡淡的「· · ·」
- 白底图片可开启「白底融入背景」（mix-blend-mode: multiply），或直接使用透明底 PNG
- 极简播放控件，自动继承主题颜色

## 安装

1. 下载 [Release](../../releases) 中的 `synced-lyric-image.zip`
2. 后台 → 插件 → 安装插件 → 上传插件 → 启用
3. 编辑文章 → 插入区块 → 搜索「同步歌词图片」（媒体分类）

## 使用

插入区块后需要做四件事：

1. **选择音频**（媒体库中的 mp3 / flac 等）
2. **选择歌词图片**
3. **填写行带配置** — 告诉区块图片怎么切，每行一条：

   ```
   上% 下% [左% 右%]
   ```

   例：`14.4 19.4` 表示该条行带覆盖图片纵向 14.4% ~ 19.4% 的区域。
   左右范围会自动收紧，一般不用填；只有需要排除旁边墨迹（如签名）时才填。
   排版整齐的歌词截图可用侧边栏「按行数均分生成行带」一键生成。

4. **填写时间轴配置** — 告诉区块什么时候显示哪一行，每行一条：

   ```
   [分:秒.毫秒] 行号
   [分:秒.毫秒] 首行-末行
   ```

   例：`[00:41.32] 2` 表示 41.32 秒时显示第 2 条行带；`[03:09.78] 8-9` 表示同时显示第 8、9 两条（一句歌词写了两行的情况）。

完整示例见上方英文部分（《落雁》手写稿的行带与时间轴配置可直接复制使用）。

## 技巧

- **歌词时间轴从哪来**：网易云 / QQ 音乐的歌词页一般能拿到 LRC；把每行 `[mm:ss.xx]` 提出来，再对照图片标上行号即可
- **白底图片**：侧边栏开启「白底融入背景」即可，无需修图（适合浅色背景主题）
- **想要真·透明底**：用图像工具把白色抠掉存成 PNG，效果最干净

## 技术说明

- 动态区块（PHP `render_callback`），前台零依赖 vanilla JS，编辑器端无构建步骤（`wp.element`）
- 行带显示用 `background-position` 裁切，不做物理切图
- 行带左右自动收紧基于 canvas 像素扫描，跨域图片会自动回退为整宽显示
