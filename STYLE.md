# Writing style

How to write everything on this site: docs, page text, buttons, error messages. It applies to
both languages.

## The voice

Write like a good textbook, or like a patient senior student explaining something at a desk.
Be clear, simple and calm, and a little formal. Assume the reader is smart but new to this
project.
- **Explain before you name.** Introduce an idea in plain words first, then give its term.
  "A plugin can only read the websites it lists in its manifest. We call these its _hosts_." Don't
  open with jargon such as _harness_, _contract_ or _taint_ and leave the reader to work it out.
- **One idea per sentence, one topic per paragraph.** Prefer short paragraphs of two to four
  sentences.
- **Say what something does, not how impressive it is.** Describe; don't sell.
- **Use concrete examples.** "For example, the classrooms plugin calls `portal.pku.edu.cn`" beats
  "plugins can call campus services".
- **Address the reader as "you" (你).** Use "we" only for the project's maintainers.
- **Headings describe their section.** A reader skimming the headings should learn the outline:
  "How plugins are installed", not "One link, zero friction".

## Things to avoid

These patterns make text read as machine-written. Remove them.

| Avoid                                                                                                                          | Write instead                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Slogans and wordplay: "Anything at PKU, just ask." / "北大的事，跟它说一声就行。"                                              | A plain statement: "PKU Harness is an Android app that helps you with campus services." / "PKU Harness 是一个帮你处理校园事务的 Android 应用。" |
| Paired, symmetrical headings: "Three kinds, one contract" / "三种形式，一套约定"                                               | "The three kinds of plugin" / "插件的三种形式"                                                                                                  |
| Manifesto lines: "Every plugin is equal."                                                                                      | Say what it means: "Built-in and community plugins use the same permission system."                                                             |
| Hype words: seamless, powerful, effortless, unlock, supercharge, robust, leverage, delve, 赋能, 无缝, 强大, 一站式, 极致, 打造 | Remove them, or say the concrete fact.                                                                                                          |
| "Not X, it's Y" / "不是……而是……" used for drama                                                                                | State Y directly.                                                                                                                               |
| Lists of exactly three for rhythm: "fast, safe and simple"                                                                     | List only what is true and relevant.                                                                                                            |
| Em-dash chains and colon chains: "X — Y — Z", "A: B: C"                                                                        | Separate sentences.                                                                                                                             |
| Rhetorical questions and exclamation marks                                                                                     | Statements.                                                                                                                                     |
| Filler openers and closers: "In this guide we will…", "In summary…", "Let's dive in"                                           | Start with the content. End when it's done.                                                                                                     |
| Over-compressed table cells holding whole paragraphs                                                                           | Move the explanation into prose; keep tables for short facts.                                                                                   |
| Unexplained shorthand: OTA, MCP, IAAA, e2e, CI                                                                                 | Spell it out on first use on each page: "over-the-air (OTA) update".                                                                            |

## Chinese (简体中文)

Write natural, slightly formal written Chinese, like a well-edited textbook or the Vue/Vite
Chinese docs. It should not read like a translation.
- **Punctuation and spacing.** Use 全角标点 (，。：；「」（）). Put a space between Chinese and
  Latin letters or digits: 「用 GitHub 链接安装」「共 16 次」.
- **Use 你**, not 您.
- **Avoid 翻译腔.** Don't write 「进行……操作」「对于……而言」「被……所……」, chains of 「的」,
  or nominal phrases like 「实现对……的支持」. Use verbs: 「支持……」.
- **No 口号式标题 or 网络用语.** Avoid 「一句话搞定」「丝滑」「拿捏」.
- **Keep code English.** Identifiers, field names, commands and paths stay in English and in
  code style. Explain them in Chinese around the code.
- **Translate everything a reader reads,** including code comments where practical and decision
  trees. English left inside a Chinese page reads as unfinished.
- **Write each language natively.** The Chinese and English versions say the same things, but
  each should read as if it were written in that language first.

## Before and after

> Every capability in PKU Harness is a plugin, and all plugins are equal. A plugin is either a
> **document** the app interprets, a **TypeScript** module bundled in the app, or a **remote** MCP
> server.

> In PKU Harness, each feature that connects to a campus service is provided by a plugin. There
> are three kinds of plugin. The most common is a _plugin document_: a folder with a `PLUGIN.md`
> file that the app reads and follows. The other two kinds are TypeScript modules built into the
> app, and _remote plugins_, which run on a server and connect through the Model Context Protocol
> (MCP).

> PKU Harness 的每项能力都是插件，所有插件地位平等。

> 在 PKU Harness 里，每一项连接校园服务的功能都由一个插件提供。插件有三种。最常见的是「插件文档」：一个包含 `PLUGIN.md` 文件的文件夹，App 读取并按照其中的说明执行。另外两种分别是内置在 App 中的 TypeScript 模块，以及运行在服务器上、通过 MCP（Model Context Protocol）连接的「远程插件」。

## Page text (buttons, labels, errors)

- Buttons are verbs: "Download APK" / 「下载 APK」, "Check repository" / 「检查仓库」.
- Errors say what happened and what to do: "Couldn't reach GitHub. Try again in a minute." /
  「暂时连不上 GitHub，请稍后再试。」
- Labels are nouns, without decoration.
