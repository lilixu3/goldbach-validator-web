# 哥德巴赫验证器

一个简洁的网页工具，用来验证 **大于 6 的偶数** 的哥德巴赫素数对。

在线访问：

- 主地址：<https://a.lilixu3.qzz.io>
- GitHub Pages 备用地址：<https://lilixu3.github.io/goldbach-validator-web/>

## 功能

- 输入一个 **大于 6 的偶数**
- 分批计算全部素数对，避免结果过多时页面卡顿
- 显示总组数
- 支持分页、上一页、下一页、页码跳转
- 输入不合法时，用小弹窗提示
- 仓库可直接导入到常见云平台部署

## 直接使用

打开网站，输入偶数，点击 **开始验证**。

如果数字较大，页面会显示计算进度；完成后可分页查看所有结果。

## 仓库导入部署

这个仓库已经适配常见平台的导入部署：

- Vercel
- Netlify
- Cloudflare Pages
- EdgeOne Pages

统一约定：

- 构建命令：`npm run build`
- 输出目录：`dist`
- 默认先使用平台分配域名

详细步骤见：[`DEPLOY.md`](./DEPLOY.md)

## 本地运行

安装依赖：

```bash
npm install
```

运行测试：

```bash
npm test
```

构建静态产物：

```bash
npm run build
```

启动本地静态服务，例如：

```bash
python -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173/
```

## 项目结构

- `index.html`：页面结构
- `styles.css`：页面样式
- `app.js`：验证、分页、分批计算逻辑
- `scripts/build-static.mjs`：统一构建 `dist/`
- `DEPLOY.md`：多平台导入部署说明
- `tests/goldbach.test.js`：测试

## 域名说明

当前 GitHub Pages 保留了 `CNAME`，用于公开演示域名：

```text
a.lilixu3.qzz.io
```

其他云平台导入部署时，默认先使用各自平台分配的域名，确认正常后再绑定自定义域名。
