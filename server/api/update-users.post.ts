import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
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
        // --- 1. 身分驗證 (保留原有邏輯) ---
        let authHeader = getRequestHeader(event, 'Authorization');
        if (!authHeader) throw new Error('未授權');
        if (authHeader.startsWith('Bearer ')) authHeader = authHeader.slice(7);

        const config = useRuntimeConfig();
        const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey);
        const { data: { user: verifiedUser }, error: authError } = await supabaseAdmin.auth.getUser(authHeader);
        if (authError || !verifiedUser) throw new Error('Token 無效');

        const userId = verifiedUser.id;

        // --- 2. 解析 Multipart Form Data ---
        const formData = await readMultipartFormData(event);
        if (!formData) throw new Error('無表單資料');

        let newName = '';
        let fileBuffer: Buffer | null = null;
        let fileName = '';

        for (const item of formData) {
            if (item.name === 'newName') {
                newName = item.data.toString();
            } else if (item.name === 'image' && item.filename) {
                fileBuffer = item.data;
                fileName = item.filename;
            }
        }

        // --- 3. 檔案寫入本地 /public 路徑 ---
        let avatarPublicPath = verifiedUser.user_metadata.custom_avatar;

        if (fileBuffer) {
            const fileExt = fileName.split('.').pop();
            const newFileName = `${userId}-${Date.now()}.${fileExt}`;

            // 定義儲存路徑 (注意：在 Nuxt 執行環境中，process.cwd() 是專案根目錄)
            const storageDir = path.join(process.cwd(), 'public', 'images', 'avatars');
            const fullPath = path.join(storageDir, newFileName);

            // 確保資料夾存在
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }

            // 寫入檔案
            fs.writeFileSync(fullPath, fileBuffer);

            // 設定瀏覽器可訪問的 URL 路徑 (不含 public)
            avatarPublicPath = `/images/avatars/${newFileName}`;
        }

        // --- 4. 更新資料庫 (Auth & Member 表) ---
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
                display_name: newName,
                avatar_url: avatarPublicPath ,
                custom_avatar: avatarPublicPath
            },
        });
        if (updateError) throw updateError;

        await supabaseAdmin
            .from('member')
            .update({ name: newName, nickname: newName, avatar_url: avatarPublicPath })
            .eq('user_id', userId);

        response.data = { avatarUrl: avatarPublicPath };

    } catch (ex: any) {
        response.status.code = 1;
        response.status.message = ex.message;
    }

    return response;
});
