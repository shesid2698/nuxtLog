import { serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async event => {
    const response: IResponseModel = {
        status: {
            code: 0,
            message: '',
        },
        data: '',
    };
    try {
        const client = await serverSupabaseClient(event);
        const { error } = await client.auth.signOut();

        if (error) throw new Error(error.message);
        response.data = '使用者已登出，Token 已失效';
    } catch (ex) {
        response.status.code = 1;
        response.status.message = ex.message;
    }

    return response;
});
