# 特价商品展示系统部署说明

本系统是一个基于Flask的全栈应用，使用SQLite数据库存储数据，可以部署到Vercel等支持Python的云托管平台上，让不同网络的用户都能访问。

## 项目结构

```
project_proct/
├── app.py              # Flask应用主文件
├── requirements.txt    # Python依赖文件
├── .env                # 环境变量配置
├── vercel.json         # Vercel部署配置
├── templates/          # Flask模板目录
│   ├── index.html      # 前台系统 - 用户访问页面
│   └── admin.html      # 后台管理系统
├── static/             # 静态资源目录
│   ├── css/            # CSS样式文件
│   ├── js/             # JavaScript文件
│   └── uploads/        # 商品图片存储目录
└── DEPLOYMENT.md       # 部署说明文档
```

## 部署方案

### 使用Vercel部署（推荐）

Vercel支持Python应用部署，配置简单，适合本项目使用。

#### 部署步骤：

1. **创建GitHub仓库**
   - 登录GitHub，创建一个新的仓库
   - 仓库名称建议使用 `wechat-special-offers` 或类似名称

2. **上传项目文件**
   - 将所有项目文件上传到GitHub仓库，包括：
     - app.py
     - requirements.txt
     - .env
     - vercel.json
     - templates/
     - static/
   - 注意：不需要上传 `venv/` 目录

3. **配置环境变量（可选）**
   - 如果你需要自定义配置，可以修改 `.env` 文件中的内容：
     ```
     FLASK_APP=app.py
     FLASK_ENV=production
     SECRET_KEY=your-secret-key-here
     DATABASE_URL=sqlite:///app.db
     ```

4. **部署到Vercel**
   - 访问 https://vercel.com/，使用GitHub账号登录
   - 点击"New Project"，导入你的GitHub仓库
   - 保持默认设置，点击"Deploy"
   - Vercel会自动读取 `vercel.json` 配置并部署应用

5. **访问网站**
   - 部署完成后，你会看到访问URL，格式为：`https://your-project.vercel.app/`
   - 用户可以通过这个URL访问前台系统
   - 管理员可以通过 `https://your-project.vercel.app/admin` 访问后台管理系统

### 其他部署方案

如果需要使用其他部署平台，可以参考以下文档：

1. **Heroku**：https://devcenter.heroku.com/articles/getting-started-with-python
2. **Render**：https://render.com/docs/deploy-flask
3. **PythonAnywhere**：https://www.pythonanywhere.com/wiki/Flask

## 访问地址说明

- **前台系统**：`https://your-domain.com/`
- **后台管理系统**：`https://your-domain.com/admin`
- **API接口**：`https://your-domain.com/api/products`（获取商品列表）

## 注意事项

1. **数据存储**
   - 本系统使用SQLite数据库存储数据
   - 数据存储在服务器上，所有用户共享同一套数据
   - 不同浏览器访问的数据是一致的
   - 清除浏览器数据不会影响服务器上的数据

2. **后台管理安全性**
   - 目前后台管理页面没有密码保护
   - 建议仅将后台管理页面的URL分享给信任的管理员
   - 可以考虑在生产环境中添加密码保护，例如使用Vercel的密码保护功能

3. **图片存储**
   - 商品图片存储在服务器的 `static/uploads/` 目录中
   - 建议图片大小不超过2MB，避免占用过多存储空间
   - 大量图片可能会导致页面加载缓慢

4. **自定义域名**
   - Vercel支持自定义域名
   - 可以将自己的域名指向部署的网站
   - 具体操作请参考Vercel官方文档

5. **数据库备份**
   - SQLite数据库文件是 `app.db`，位于应用根目录
   - 建议定期备份数据库文件，防止数据丢失
   - 可以使用Vercel的存储服务或其他云存储服务进行备份

## 功能说明

### 前台系统（用户访问）
1. 显示特价商品列表
2. 查看商品详情
3. 下单功能（支持数量选择和备注）
4. 订单提交成功提示
5. 支持微信分享

### 后台管理系统
1. 商品管理（添加、编辑、删除商品）
2. 支持商品图片上传
3. 订单管理（查看所有订单）
4. 数据统计（显示商品数量和订单数量）

## 技术栈

- **后端**：Python Flask
- **数据库**：SQLite + SQLAlchemy
- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **部署**：Vercel

## 技术支持

如果在部署过程中遇到问题，可以：
1. 查看Vercel官方文档：https://vercel.com/docs
2. 搜索相关教程
3. 咨询技术人员

祝你部署顺利！