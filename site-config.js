/**
 * 静态资源（图片）根地址：阿里云 OSS 或绑定在 OSS 上的 CDN 域名。
 *
 * 填写示例（不要末尾斜杠，须 https）：
 *   window.__OSS_BASE__ = "https://your-bucket.oss-cn-hangzhou.aliyuncs.com";
 *   window.__OSS_BASE__ = "https://img.example.com";
 *
 * 留空字符串：继续使用仓库内相对路径（本地 photo/、icon/）。
 *
 * OSS 侧请保持与本地相同的「目录结构」上传，例如：
 *   photo/readtrip1.png  →  根下 photo/readtrip1.png
 *   icon/clean/map.png   →  根下 icon/clean/map.png
 *
 * 上传可用阿里云控制台「上传目录」，或 ossutil（需在本机配置 AK/SK，勿提交到 Git）：
 *   ossutil cp -r photo/ oss://你的bucket/photo/
 *   ossutil cp -r icon/ oss://你的bucket/icon/
 */
window.__OSS_BASE__ = "https://lulu-personal.oss-cn-beijing.aliyuncs.com";
