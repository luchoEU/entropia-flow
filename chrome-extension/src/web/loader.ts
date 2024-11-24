import { FetchResponse } from "./fetch";
import { EntropiaNexus } from "./nexus";
import { IWebSource, SourceLoadResponse } from "./sources";
import { EntropiaWiki } from "./wiki";

const WebSources: IWebSource[]  = [ new EntropiaNexus(), new EntropiaWiki() ]

interface WebLoadResponse<T> {
    loading?: {
        source: string
    }
    errors?: string[] // error messages
    url?: {
        href: string
        text: string
    }
    data?: T
}

interface SourceMapperOut<T> {
    errorText?: string,
    data?: T
    url?: string,
}

function mapResponse<TF,TR>(response: FetchResponse<TF>, mapper: (data: TF) => SourceMapperOut<TR>): SourceLoadResponse<TR> {
    if (!response.ok) {
        return { ok: false, errorText: response.errorText ?? `Status code: ${response.status}` }
    }

    const out = response.result && mapper(response.result)
    if (!out || out?.errorText) {
        return { ok: false, errorText: out?.errorText ?? 'Internal error', url: out?.url }
    }

    return { ok: true, data: out.data, url: out.url }
}

async function* loadFromWeb<T>(loadFrom: (source: IWebSource) => Promise<SourceLoadResponse<T>>): AsyncGenerator<WebLoadResponse<T>> {
    let errors: string[] = [];
    for (const source of WebSources) {
        yield { loading: { source: source.name } }
        const response = await loadFrom(source)
        if (response.ok) {
            errors = undefined
            yield { data: response.data, url: { href: response.url, text: source.name } }
            break
        } else {
            errors.push(`Error loading from ${source.name}: ${response.errorText}.`)
        }
    }
    if (errors) {
        yield { errors }
    }
}

export {
    mapResponse,
    SourceMapperOut,
    WebLoadResponse,
    loadFromWeb,
}
