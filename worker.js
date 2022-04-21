// 监听接收主进程信息
self.onmessage = (e) => console.log(`接收到主进程发送的信息：${e.data}`);
// 发送信息到主进程
self.postMessage('内容');
