// 加载字体解密所需的库和资源
const loadResources = async () => {
  // 检测是否已加载Typr和md5
  if (!window.Typr || !window.md5) {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://chizhu-dl.github.io/font-decrypt/TyprMd5.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  // 获取字体映射表
  if (!window.chaoXingFontTable) {
    const response = await fetch('https://chizhu-dl.github.io/font-decrypt/Table.json');
    window.chaoXingFontTable = await response.json();
  }
};

// 核心解密函数
const decryptChaoXingFont = async () => {
  await loadResources();
  
  const { Typr, md5, chaoXingFontTable: table } = window;
  
  // 辅助函数：Base64转Uint8Array
  const base64ToUint8Array = (base64) => {
    const data = atob(base64);
    const buffer = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      buffer[i] = data.charCodeAt(i);
    }
    return buffer;
  };

  // 查找加密字体样式
  const styleElements = [...document.querySelectorAll('style')];
  const cxStyle = styleElements.find(el => 
    el.textContent.includes('font-cxsecret')
  );
  
  if (!cxStyle) {
    console.log('未找到加密字体');
    return;
  }

  // 提取字体数据
  const fontData = cxStyle.textContent.match(/base64,([\w\W]+?)'/)[1];
  const parsedFont = Typr.parse(base64ToUint8Array(fontData))[0];
  
  // 创建字符映射表
  const charMap = {};
  for (let charCode = 19968; charCode < 40870; charCode++) {
    const glyph = Typr.U.codeToGlyph(parsedFont, charCode);
    if (!glyph) continue;
    
    const path = Typr.U.glyphToPath(parsedFont, glyph);
    const pathHash = md5(JSON.stringify(path)).slice(24);
    charMap[String.fromCharCode(charCode)] = 
      String.fromCharCode(table[pathHash]);
  }

  // 替换页面上的加密文本
  document.querySelectorAll('.font-cxsecret').forEach(element => {
    let htmlContent = element.innerHTML;
    Object.entries(charMap).forEach(([encryptedChar, decryptedChar]) => {
      const regex = new RegExp(encryptedChar, 'g');
      htmlContent = htmlContent.replace(regex, decryptedChar);
    });
    element.innerHTML = htmlContent;
    element.classList.remove('font-cxsecret');
  });

  console.log('字体解密完成');
};

// 执行解密
decryptChaoXingFont().catch(console.error);
