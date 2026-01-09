/**GetMoodResponse interface */
interface IGetMoodResponse {
    status: IStatus;
    Data: IGetMoodResponseData[];
}
/**GetMoodResponseData interface */
interface IGetMoodResponseData {
    id: number;
    user_id: string;
    mood_category: number;
    feel_category: string;
    about: string;
    sleep_category: number;
    created_at: string;
}
