/**回應interface */
interface IResponseModel {
    status: IStatus;
    data: object | string | null;
}
/**狀態interface */
interface IStatus {
    code: number;
    message: string;
}
