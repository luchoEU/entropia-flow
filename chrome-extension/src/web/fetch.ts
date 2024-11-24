interface FetchResponse<T> {
    ok: boolean
    status?: number
    errorText?: string
    url?: string
    result?: T
}

async function _fetch<T>(url: string, getResult: (response: Response) => Promise<T>, type: string): Promise<FetchResponse<T>> {
    let data: FetchResponse<T>
    try {
        const response = await fetch(url);
        data = {
            ok: response.ok,
            status: response.status,
            url: response.url
        }
        if (response.ok) {
            data.result = await getResult(response);
        }
    } catch (error) {
        data = {
            ok: false,
            errorText: error.message === 'Failed to fetch' ?
                'You are disconnected from the internet. Please check your connection' :
                error.message
        }
        console.error(`Error during ${type} call:`, error);
    }
    return data
}

async function fetchText(url: string): Promise<FetchResponse<string>> {
    return _fetch(url, r => r.text(), "http")
}

async function fetchJson<T>(url: string): Promise<FetchResponse<T>> {
    return _fetch(url, r => r.json(), "API")
}

export {
    FetchResponse,
    fetchText,
    fetchJson,
}