// 保存原始构造函数和关键函数（避免污染全局环境）
const _FunctionConstructor = Function.prototype.constructor;
const _consoleClear = console.clear;

// 1. 阻止控制台清空
console.clear = () => { console.warn("Console clearing blocked"); };

// 2. Hook Function构造函数：拦截并删除所有debugger语句
Function.prototype.constructor = function() {
  const code = arguments[0] || '';
  
  // 检测到debugger时直接返回空函数或净化后的代码
  if (typeof code === 'string' && /\bdebugger\b/gi.test(code)) {
    console.log("[Bypass] Debugger statement removed");
    return function(){}; // 直接返回空函数，彻底阻断执行
  }
  
  // 非调试代码调用原始构造函数
  return _FunctionConstructor.apply(this, arguments);
};

// 3. 额外防护：覆盖全局debugger函数（应对非字符串形式的debugger）
window.debugger = function() {};
