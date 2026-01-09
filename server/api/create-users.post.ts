import { serverSupabaseClient } from '#supabase/server';
export default defineEventHandler(async event => {
    const response: IResponseModel = {
        status: { code: 0, message: 'success' },
        data: null,
    };
    try {
        // 1. 取得前端(或 Postman) 傳來的資料
        const body = await readBody(event);
        const { email, password } = body;
        // 檢查必要欄位
        if (!email || !password) {
            throw new Error('缺少必要欄位: email, password');
        }
        const decryptedResult = await $fetch('/api/decryption', {
            method: 'POST',
            body: { encryptedData: password },
        });
        if (decryptedResult.status.code !== 0 || decryptedResult.data === '') throw new Error(decryptedResult.status.message);
        // 2. 初始化 Supabase Client
        // 注意：這裡即使沒登入也能用，因為 signUp 本來就是給匿名用的
        const client = await serverSupabaseClient(event);

        // 3. 執行註冊 (這會寫入 auth.users)
        const { data, error } = await client.auth.signUp({
            email,
            password: decryptedResult.data,
            options: {
                // 這裡就是觸發 SQL Trigger 的關鍵！
                // 我們把 name 塞在 metadata 傳給資料庫
                data: {
                    name: '',
                    role: 'admin',
                    nickname: '',
                    account: email,
                },
            },
        });

        // 4. 錯誤處理
        if (error) {
            throw new Error(error.message);
        }
        response.data = data.user;
    } catch (ex) {
        response.status.code == 1;
        if (ex instanceof Error) {
            response.status.message = ex.message;
        } else {
            response.status.message = String(ex);
        }
    }
    return response;
});
