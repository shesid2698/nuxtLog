import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
    const response: IGetMoodResponse = {
        status: { code: 0, message: 'success' },
        data: [],
    };

    try {
        // 1. 身分驗證：從 Header 取得 Token 並驗證身分
        let authHeader = getRequestHeader(event, 'Authorization');
        if (!authHeader) throw new Error('未授權：請重新登入');
        if (authHeader.startsWith('Bearer ')) authHeader = authHeader.slice(7);

        const config = useRuntimeConfig();
        const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey);

        const { data: { user: verifiedUser }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
        if (authError || !verifiedUser) throw new Error('身分驗證失敗');

        const userId = verifiedUser.id;

        // 2. 計算 30 天前的日期
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isoDate = thirtyDaysAgo.toISOString();

        // 3. 查詢資料庫
        const { data, error: selectError } = await supabaseAdmin
            .from('mood_log')
            .select('*')
            .eq('user_id', userId) // 篩選該使用者的資料
            .gte('created_at', isoDate) // 大於等於 30 天前的日期
            .order('created_at', { ascending: true }); // 依照時間由新到舊排序

        if (selectError) throw selectError;

        // 4. 如果 feel_category 當初是用 JSON.stringify 存入的，這裡可視需求還原
        response.data = data || [];

    } catch (ex: any) {
        response.status.code = 1;
        response.status.message = ex.message;
    }

    return response;
});
