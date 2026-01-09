import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async event => {
    const response: IResponseModel = {
        status: { code: 0, message: 'success' },
        data: null,
    };

    try {
        // --- 1. 身分驗證 (保留原有邏輯) ---
        let authHeader = getRequestHeader(event, 'Authorization');
        if (!authHeader) throw new Error('未授權');
        if (authHeader.startsWith('Bearer ')) authHeader = authHeader.slice(7);

        const config = useRuntimeConfig();
        // 使用 Service Key 具有管理權限，可以直接上傳檔案與更新使用者
        const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey);

        const {
            data: { user: verifiedUser },
            error: authError,
        } = await supabaseAdmin.auth.getUser(authHeader);
        if (authError || !verifiedUser) throw new Error('Token 無效');

        const userId = verifiedUser.id;

        // --- 2. 解析 Multipart Form Data ---
        const formData = await readMultipartFormData(event);
        if (!formData) throw new Error('無表單資料');

        let newName = '';
        let fileBuffer: Buffer | null = null;
        let fileName = '';
        let fileType = 'image/png'; // 預設型別

        for (const item of formData) {
            if (item.name === 'newName') {
                newName = item.data.toString();
            } else if (item.name === 'image' && item.filename) {
                fileBuffer = item.data;
                fileName = item.filename;
                fileType = item.type || 'image/png';
            }
        }

        // --- 3. 將檔案上傳至 Supabase Storage ---
        // 取得舊的頭像連結作為預設值
        let avatarPublicPath = verifiedUser.user_metadata.custom_avatar;

        if (fileBuffer) {
            const fileExt = fileName.split('.').pop();
            // 建立唯一的檔案名稱，存放在以 userId 命名的資料夾內
            const storagePath = `${userId}/${Date.now()}.${fileExt}`;

            // 上傳到 Supabase Storage (Bucket 名稱為 avatars)
            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('avatars') // 確保這裡跟你建立的 Bucket 名稱一致
                .upload(storagePath, fileBuffer, {
                    contentType: fileType,
                    upsert: true, // 如果檔案已存在則覆蓋
                });

            if (uploadError) throw new Error(`Storage 上傳失敗: ${uploadError.message}`);

            // 取得上傳後的公開存取網址 (因為你 Bucket 設為 Public)
            const {
                data: { publicUrl },
            } = supabaseAdmin.storage.from('avatars').getPublicUrl(storagePath);

            avatarPublicPath = publicUrl;
        }

        // --- 4. 更新資料庫 (Auth & Member 表) ---
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
                display_name: newName,
                avatar_url: avatarPublicPath,
                custom_avatar: avatarPublicPath,
            },
        });
        if (updateError) throw updateError;

        await supabaseAdmin
            .from('member')
            .update({
                name: newName,
                nickname: newName,
                avatar_url: avatarPublicPath,
            })
            .eq('user_id', userId);

        response.data = { avatarUrl: avatarPublicPath };
    } catch (ex: any) {
        response.status.code = 1;
        response.status.message = ex.message;
    }

    return response;
});
