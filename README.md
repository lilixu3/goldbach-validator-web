# 哥德巴赫验证器

一个简洁的网页工具，用来验证 **大于 6 的偶数** 的哥德巴赫素数对。

在线访问：

- 自定义域名：<https://a.lilixu3.qzz.io>
- GitHub Pages 备用地址：<https://lilixu3.github.io/goldbach-validator-web/>

## 这个工具能做什么

- 输入一个 **大于 6 的偶数**
- 分批计算全部素数对，避免结果太多时页面卡顿
- 显示总组数
- 按页查看结果
- 支持上一页、下一页，以及页码跳转
- 输入不合法时，用小弹窗提示

## 直接使用

打开网站，输入一个偶数，然后点击 **开始验证**。

如果数字很大，页面会显示计算进度。  
计算完成后，可以翻页查看每一组结果。

## 本地运行

先安装依赖：

```bash
npm install
```

运行测试：

```bash
npm test
```

启动一个本地静态服务，例如：

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
- `app.js`：验证逻辑、分页逻辑、分批计算逻辑
- `tests/goldbach.test.js`：测试

## 自定义域名

当前 GitHub Pages 已配置自定义域名：

```text
a.lilixu3.qzz.io
```

仓库中保留了 `CNAME` 文件，后续重新部署时会继续使用这个域名。
