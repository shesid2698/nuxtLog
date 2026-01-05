// 直接引用模組提供的兩個 Helper
import { serverSupabaseClient } from '#supabase/server'
interface ResponseModel {
    status: status;
    data: object | null;
}
interface status {
    code: number;
    message: string;
}
export default defineEventHandler(async (event) => {
    const response: ResponseModel = {
        status: { code: 0, message: 'success' },
        data: null,
    };
    try {
        const body = await readBody(event)
        const { account, password } = body

        // 檢查必要欄位
        if (!account || !password) {
            throw new Error('缺少必要欄位: account, password');
        }

        const decryptedResult = await $fetch('/api/decryption', {
            method: 'POST', body: { encryptedData: password }
        });
        if (decryptedResult.status.code !== 0 || decryptedResult.data === "") throw new Error(decryptedResult.status.message);

        const authClient = await serverSupabaseClient(event)

        const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
            email: account, // 你的虛擬 Email 邏輯
            password:decryptedResult.data
        })

        if (authError) throw new Error(`登入失敗: ${authError.message}`);
        response.data = {
            token: authData.session?.access_token,
            user: authData.user
        };
    } catch (ex) {
        response.status.code = 1;
        if (ex instanceof Error) {
            response.status.message = ex.message;
        } else {
            response.status.message = String(ex);
        }
    }

    return response;
})