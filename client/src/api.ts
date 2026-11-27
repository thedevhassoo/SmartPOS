import axios from 'axios';
export const client = axios.create({
    baseURL: '/api/', headers: { 'X-SmartPOS': '1', 'Content-Type': 'application/json' }, timeout: 20000
});
export async function api<T = unknown>(action: string, data: Record<string, unknown> = {}): Promise<T> {
    try {
        return (await client.post<T>(action, data)).data;
    }
    catch (e) {
        if (axios.isAxiosError(e)) {
            throw new Error(e.response?.data?.error ?? 'Connection unavailable. Check the server and retry safely.');
        }
        throw e;
    }
}
export const cash = (n: number | null | undefined) => n === null || n === undefined ? 'Unavailable' : (n / 100).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
