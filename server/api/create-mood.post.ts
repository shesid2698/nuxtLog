import { createClient } from '@supabase/supabase-js';
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
        status: { code: 0, message: '' },
        data: null,
    };

    try {
        // 1. 取得並驗證 JWT Token
        let authHeader = getRequestHeader(event, 'Authorization');
        if (!authHeader) throw new Error('Unauthorized: Missing Token');
        if (authHeader.startsWith('Bearer ')) authHeader = authHeader.slice(7);

        const config = useRuntimeConfig();
        // 初始化 Admin Client 用於安全寫入
        const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey);

        // 2. 獲取當前登入使用者的 UUID
        const { data: { user: verifiedUser }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
        if (authError || !verifiedUser) throw new Error('身分驗證失效，請重新登入');

        // 3. 取得前端傳入的 JSON 資料
        const body = await readBody(event);
        const { moodCategory, feelCategories, comment, sleepCategory } = body;

        // 基本欄位檢查
        if (!moodCategory || !feelCategories || !comment || !sleepCategory) {
            throw new Error('缺少必要欄位');
        }
        // 4. 寫入資料庫
        // id 欄位會透過 identity 自動遞增，不需手動傳入
        const { data, error: insertError } = await supabaseAdmin
            .from('mood_log')
            .insert({
                user_id: verifiedUser.id,
                mood_category: moodCategory,
                feel_category: feelCategories,
                about: comment,
                sleep_category: sleepCategory
            })
            .select()
            .single();

        if (insertError) throw insertError;

        response.data = data;

    } catch (ex: any) {
        response.status.code = 1;
        response.status.message = ex.message;
    }

    return response;
});