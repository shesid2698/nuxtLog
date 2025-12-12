export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('request', (event) => {
        // 取得請求的來源 (Origin)
        const origin = event.node.req.headers.origin;

        // 這裡設置您允許的來源，如果您不確定，開發階段可以先允許所有來源 (*)。
        // 生產環境強烈建議只列出您的域名 (例如: 'https://example.com')
        const allowedOrigins = [
            'http://localhost:3000', // 您的開發伺服器
            'http://localhost:3310', // 您部署的伺服器 (有時候會用到)
            'http://localhost:8080', // 如果您有其他前端專案
            // ...其他允許的生產環境域名
        ];

        // 如果來源在允許列表中，則設置 CORS Header
        if (origin && allowedOrigins.includes(origin)) {
            event.node.res.setHeader('Access-Control-Allow-Origin', origin);
        } else if (allowedOrigins.includes('*')) {
            // 允許所有來源 (開發測試用)
            event.node.res.setHeader('Access-Control-Allow-Origin', '*');
        }

        // 允許的 HTTP 方法
        event.node.res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE');

        // 允許傳遞的 Header 列表
        event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // 如果是 CORS Preflight (OPTIONS) 請求，則直接結束回應
        if (event.node.req.method === 'OPTIONS') {
            event.node.res.statusCode = 204;
            event.node.res.statusMessage = 'No Content';
            return event.node.res.end();
        }
    });
});