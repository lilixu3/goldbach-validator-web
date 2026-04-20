# 仓库导入部署说明

这个仓库已经补好常见平台的构建配置，**默认先使用平台分配域名**，确认站点正常后，再按各平台控制台提示绑定自定义域名。

## 通用约定

- 构建命令：`npm run build`
- 输出目录：`dist`
- 仓库根目录直接导入即可
- 不需要手动填写站点源码路径

## 平台速览

| 平台 | 默认域名 | 导入方式 | 仓库内配置 |
| --- | --- | --- | --- |
| Vercel | `*.vercel.app` | Import Project | `vercel.json` |
| Netlify | `*.netlify.app` | Import an existing project | `netlify.toml` |
| Cloudflare Pages | `*.pages.dev` | Connect to Git | `wrangler.jsonc` |
| EdgeOne Pages | `*.edgeone.app` | Import Git repository | `edgeone.json` |

## Vercel

1. 打开 Vercel，选择 **Import Project**。
2. 选中这个 GitHub 仓库。
3. 保持仓库根目录不变，直接导入。
4. 构建命令会使用 `npm run build`，输出目录会使用 `dist`。
5. 部署完成后，先用平台生成的 `*.vercel.app` 域名测试。

## Netlify

1. 打开 Netlify，选择 **Import an existing project**。
2. 连接 GitHub 并选择这个仓库。
3. `netlify.toml` 会提供构建命令和发布目录。
4. 直接继续部署即可。
5. 部署完成后，先用平台生成的 `*.netlify.app` 域名测试。

## Cloudflare Pages

1. 打开 Cloudflare Dashboard，进入 **Workers & Pages**。
2. 选择 **Connect to Git**，选中这个仓库。
3. 根目录保持默认。
4. 输出目录已在 `wrangler.jsonc` 中预置为 `./dist`。
5. 如果后台没有自动识别构建命令，手动填 `npm run build` 即可。
6. 部署完成后，先用平台生成的 `*.pages.dev` 域名测试。

## EdgeOne Pages

1. 打开 EdgeOne Pages，选择 **Import Git repository**。
2. 连接仓库后直接使用仓库根目录。
3. `edgeone.json` 已预置 `buildCommand` 和 `outputDirectory`。
4. 部署完成后，先用平台分配的 `*.edgeone.app` 域名测试。

## 自定义域名（可选）

如果后续需要自定义域名：

1. 先确认默认域名访问正常。
2. 再去对应平台控制台添加自定义域名。
3. 按平台提示补 DNS 解析。
4. 等证书签发完成后，再切到正式域名使用。
