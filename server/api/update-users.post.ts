import { createClient } from '@supabase/supabase-js';
interface ResponseModel {
    status: status;
    data: object | null;
}
interface status {
    code: number;
    message: string;
}
export default defineEventHandler(async event => {
    const response: ResponseModel = {
        status: { code: 0, message: 'success' },
        data: null,
    };

    try {
        // 1. 取得 Header 並清理 Token
        let authHeader = getRequestHeader(event, 'Authorization');
        if (!authHeader) throw new Error('未授權：請帶上 Token');

        // 如果前端有帶 "Bearer "，要把它切掉取得純 Token 字串
        if (authHeader.startsWith('Bearer ')) {
            authHeader = authHeader.slice(7);
        }

        const config = useRuntimeConfig();
        const { newName } = await readBody(event);

        // 2. 初始化 Admin Client (使用 Service Role Key)
        const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey);

        // 3. 【關鍵修正】用 Token 驗證身分並取得真正的 User ID (UUID)
        // 這一步會檢查 Token 是否有效，並回傳該使用者的資料
        const {
            data: { user: verifiedUser },
            error: authError,
        } = await supabaseAdmin.auth.getUser(authHeader);

        if (authError || !verifiedUser) {
            throw new Error('Token 無效：' + (authError?.message || '找不到使用者'));
        }

        // 現在我們拿到了真正的 UUID：e49920d5-81ef-45d2-ae70-86ffa276bcea
        const userId = verifiedUser.id;

        // 4. 使用 UUID 執行更新
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { display_name: newName, full_name: newName },
        });

        if (updateError) throw updateError;
        const {error: updateMemberError } = await supabaseAdmin
            .from('member')
            .update({
                name: newName,
                nickname: newName,
            })
            .eq('user_id', userId); // 確保 ID 匹配
        if (updateMemberError) {
            // 如果 member 表更新失敗，你可以選擇丟出錯誤，或僅記錄日誌
            throw new Error(`Auth 已更新，但 Member 表同步失敗: ${updateMemberError.message}`);
        }
        response.data = updateData.user;
    } catch (ex: any) {
        response.status.code = 1;
        response.status.message = ex instanceof Error ? ex.message : String(ex);
    }

    return response;
});
