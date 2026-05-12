请帮我构建一个极简主义、排版驱动的产品设计师个人网站，整体风格参考 jackiehu.design。使用纯 HTML5 + CSS3 + 原生 JavaScript 实现，不依赖任何 UI 框架。

一、技术基础
预览
代码
复制复制
下载下载
<!-- 字体引入 -->
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
预览
代码
复制复制
下载下载
/* CSS 变量统一管理 */
:root {
  --color-bg: #F7F4EE;           /* 暖米白背景，比纯白更有质感 */
  --color-text-primary: #111111;
  --color-text-secondary: #737373;
  --color-border: rgba(0,0,0,0.08);
  --color-hover-bg: #F0EDE6;
  --font-family: 'Manrope', sans-serif;
  --max-width: 760px;
  --spacing-section: 96px;
}

html { scroll-behavior: smooth; }
二、配色方案
用途	色值	说明
页面背景	#F7F4EE	暖米白，比纯白更有编辑感
主文字	#111111	近黑，高对比度
次级文字	#737373	中灰，用于标签/日期/描述
分割线	rgba(0,0,0,0.08)	极低对比度细线
卡片悬停	#F0EDE6	暖灰，与背景同色系
强调/链接悬停	opacity: 0.5	用透明度替代颜色高亮
禁止使用任何高饱和度彩色。整个页面维持接近无彩色（achromatic）的视觉体系。

三、字体排版层级
预览
代码
复制复制
下载下载
/* Hero 主标题 */
.hero-title {
  font-size: clamp(40px, 7vw, 96px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* 模块标题 */
.section-title {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 600;
  line-height: 1.2;
}

/* 项目标题 */
.project-title {
  font-size: 18px;
  font-weight: 500;
}

/* 正文 */
.body-text {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.65;
}

/* 标签/元信息 */
.meta-text {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--color-text-secondary);
}
四、页面结构（语义化 HTML）
预览
代码
复制复制
下载下载
<body>
  <header><!-- 导航：左侧姓名，右侧 Work / About / Contact --></header>
  
  <main>
    <section id="hero">
      <!-- 大标题 + 一句话身份描述，纯文字，无按钮无图片 -->
      <!-- 所有关键词均为锚点链接，点击平滑跳转对应 section -->
    </section>
    
    <section id="work">
      <!-- 项目列表：名称 + 简述 + 年份/标签，细线分隔 -->
    </section>
    
    <section id="about">
      <!-- 纯文字段落：背景、方法论、简历下载链接 -->
    </section>
    
    <section id="experience">
      <!-- 工作经历时间线 -->
    </section>
    
    <section id="contact">
      <!-- 邮箱 + 社交链接，文字形式，非图标按钮 -->
    </section>
  </main>
  
  <footer><!-- 极简版权，或留空 --></footer>
</body>
布局约束：单列居中，max-width: 760px，桌面端 padding: 0 40px，移动端 padding: 0 24px。

五、核心交互逻辑
预览
代码
复制复制
下载下载
// 平滑滚动：所有锚点链接
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 可选：当前 section 高亮（导航项加 .active 类）
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
      const id = entry.target.getAttribute('id');
      const activeLink = document.querySelector(`nav a[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
预览
代码
复制复制
下载下载
/* 所有可点击元素的统一悬停规则 */
a {
  color: inherit;
  text-decoration: none;
  transition: opacity 0.18s ease;
  cursor: pointer;
}
a:hover { opacity: 0.5; }

/* 项目卡片悬停 */
.project-item {
  transition: background-color 0.2s ease;
  cursor: pointer;
  padding: 16px 0;
  border-top: 1px solid var(--color-border);
}
.project-item:hover { background-color: var(--color-hover-bg); }
六、间距系统与动效规范
间距（8px 基础单位）：

组件内部：8px / 16px
区块之间：64px / 80px / 96px
宁可多留白，不要拥挤
动效规范（严格执行）：

只使用 opacity 和 background-color 过渡
Duration：0.15s ~ 0.25s，easing：ease 或 ease-out
首屏内容可做轻微 fade-in + translateY(8px → 0)
禁止：scale 放大、bounce 弹性、3D 翻转、视差、粒子背景
七、视觉元素约束
图标：不使用图标库，箭头用 Unicode（→ ↗）或极细 SVG
图片：border-radius: 8px~12px，加载前用 #F0F0F0 占位块
分割线：border-top: 1px solid rgba(0,0,0,0.08)，无装饰
卡片：背景接近页面底色，仅用微弱色差区分，无厚重阴影
八、设计原则（给 Cursor 的最终约束）
每新增一个视觉元素前，先问自己："这个元素是否必要？"

目标是让内容（项目和文字）成为主角，设计本身退到幕后。

最终效果应像一个有审美控制力的产品设计师个人首页，而不是公司官网、SaaS 产品页或 Awwwards 炫技网站。

明确避免： 五颜六色 startup 风、玻璃拟态、赛博科技感、Dribbble 重装饰风、大量卡片瀑布流、复杂深色炫技 portfolio。