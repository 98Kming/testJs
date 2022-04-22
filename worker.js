const http = (url, option={}) => fetch(url,option).then(res=>res.json());
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const jd = {
    timeUrl : 'https://api.m.jd.com/client.action?functionId=queryMaterialProducts&client=wh5',
    id : 'jd'
}
const local = {
    timeUrl : 'http://127.0.0.1:8081/t',
    id : 'local'
}
let delay = 0;
const postMsg = (msg)=>{
    self.postMessage({msg:msg}, null);
}
const refresh = ()=>{
    self.postMessage('refresh',null);
}
const server = {
    isRun: false,
    start: async (targetServerTime,target)=>{
        server.isRun = true;
        await http(target.timeUrl);//建立连接
        postMsg(`目标时间:${formatDate(targetServerTime)}`);
        let st = performance.now();
        let serverTime = (await http(target.timeUrl))['currentTime2'];
        postMsg(`服务器时间:${formatDate(+serverTime)},延迟：${(performance.now() - st).toFixed(2)}ms`);
        let runTime = st + targetServerTime - serverTime + delay;
        let diffTime;
        while ((diffTime = runTime - performance.now()) > 500  && server.isRun){
            if (diffTime > 90000 && server.isRun){
                postMsg(`距离开始还有${(diffTime/1000).toFixed(3)}秒`);
                await sleep(diffTime - 90000);
            }
            if (diffTime > 60000 && diffTime < 90000 && server.isRun){
                await sleep(diffTime - 60000);
                refresh();
            }
        }
        postMsg(`距离开始还有${(diffTime/1000).toFixed(3)}秒`);
        while (performance.now() < runTime && server.isRun){}
        if (!server.isRun) return;
        self.postMessage(target.id, null);
        st = performance.now();
        serverTime = (await http(target.timeUrl))['currentTime2'];
        postMsg(`服务器时间:${formatDate(+serverTime)},延迟：${(performance.now() - st).toFixed(2)}ms`);
        self.postMessage('done', null);
    },
    stop: ()=> server.isRun = false
}

self.onmessage = (e) =>{
    let data = e.data;
    data.id === 'jd' && server.start(data.time,jd).then();
    data.id === 'local' && server.start(data.time,local).then();
    data.id === 'stop' && server.stop();
    delay = data.delay || delay;
}
function formatDate (str){
    const date = new Date(str)
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d =date.getDate().toString().padStart(2, '0')
    const hh = date.getHours().toString().padStart(2, '0')
    const mm = date.getMinutes().toString().padStart(2, '0')
    const ss = date.getSeconds().toString().padStart(2, '0')
    const ms = date.getMilliseconds().toString().padStart(3, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}:${ms}`
}
