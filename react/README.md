# webpack-react-kit

another simple webpack react starter kit to help you get to know webpack better

### Update

* using new React Hot Loader 3 (https://github.com/gaearon/react-hot-loader) to replace deprecated react-hmre (https://github.com/gaearon/react-transform-hmr)
* using Enzyme to replace karma test launcher (TODO)
* add ESlint with (airbnb react plugin) to validate JSX style(TODO)

### Features

* Hot Module Replacement for React Component
* Babel for js/jsx processing
* Bootstrap4 framework with SCSS support
* Testing with Enzyme (TODO)
* ESlint to validate JSX style (TODO)

### Demo

With this demo, you can search the github users with keyword

### How to work

*install the deps*

```bash
npm install
```
*run the dev server*

```bash
npm run dev
```
then open http://localhost:8080 to see how it works

*testing*

TODO...

build
|-- webpack.config.js               # 公共配置
|-- webpack.dev.js                  # 开发配置
|-- webpack.release.js              # 发布配置
docs                                # 项目文档
node_modules                        
src                                 # 项目源码
|-- conf                            # 配置文件
|-- pages                           # 页面目录
|   |-- page1                       
|   |   |-- index.js                # 页面逻辑
|   |   |-- index.scss              # 页面样式
|   |   |-- img                     # 页面图片
|   |   |   |-- xx.png          
|   |   |-- __tests__               # 测试文件
|   |   |   |-- xx.js
|   |-- app.html                    # 入口页
|   |-- app.js                      # 入口JS
|-- components                      # 组件目录
|   |-- loading
|   |   |-- index.js
|   |   |-- index.scss
|   |   |-- __tests__               
|   |   |   |-- xx.js
|-- js
|   |-- actions
|   |   |-- index.js
|   |   |-- __tests__               
|   |   |   |-- xx.js
|   |-- reducers 
|   |   |-- index.js
|   |   |-- __tests__               
|   |   |   |-- xx.js
|   |-- xx.js                 
|-- css                             # 公共CSS目录
|   |-- common.scss
|-- img                             # 公共图片目录
|   |-- xx.png
tests                               # 其他测试文件
package.json                        
READNE.md   