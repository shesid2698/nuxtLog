/**CreateMoodResponse interface */
interface ICreateMoodResponse {
    status: IStatus;
    data: ICreateMoodResponseData | null;
}

/**CreateMoodResponseData interface */
interface ICreateMoodResponseData {
    id: number;
    user_id: string;
    mood_category: number;
    feel_category: string;
    about: string;
    sleep_category: number;
    created_at: string;
}
