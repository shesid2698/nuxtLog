import crypto from 'node:crypto';

export default defineEventHandler(async event => {
    const response: IResponseModel = {
        status: { code: 0, message: 'success' },
        data: '',
    };
    const body = await readBody(event);
    const { encryptedData } = body;
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${process.env.RSA_PRIVATE_KEY}\n-----END PRIVATE KEY-----`;

    try {
        const buffer = Buffer.from(encryptedData, 'base64');
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer
        );

        const result = decrypted.toString('utf8');
        response.data = result;
    } catch (error) {
        response.status.code = 1;
        response.status.message = '解密失敗';
    }
    return response;
});
