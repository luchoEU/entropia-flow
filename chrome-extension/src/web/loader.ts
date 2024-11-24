import { FetchResponse } from "./fetch";
import { EntropiaNexus } from "./nexus";
import { IWebSource, SourceLoadResponse } from "./sources";
import { EntropiaWiki } from "./wiki";

const WebSources: IWebSource[]  = [ new EntropiaNexus(), new EntropiaWiki() ]

interface WebLoadResponse<T> {
    loading?: {
        source: string
    }
    errors?: {
        message: string
        href: string
    }[]
    data?: {
        link: {
            text: string
            href: string
        }
        value: T
    }
}

async function mapResponse<TF,TR>(fetch: Promise<FetchResponse<TF>>, mapper: (data: TF) => Promise<SourceLoadResponse<TR>>): Promise<SourceLoadResponse<TR>> {
    const response = await fetch
    if (!response.ok) {
        return { ok: false, errorText: response.errorText ?? `Status code: ${response.status}`, url: response.url }
    }

    const out = response.result && await mapper(response.result)
    if (!out) {
        return { ok: false, errorText: 'Internal error', url: response.url }
    }

    return {
        ...out,
        url: out?.url ?? response.url,
        errorText: !out.ok && (out?.errorText ?? 'Unknown error')
    }
}

async function* loadFromWeb<T>(loadFrom: (source: IWebSource) => Promise<SourceLoadResponse<T>>): AsyncGenerator<WebLoadResponse<T>> {
    let errors: { message: string, href: string }[] = [];
    for (const source of WebSources) {
        yield { loading: { source: source.name } }
        const response = await loadFrom(source)
        if (response.ok) {
            errors = undefined
            yield { data: { value: response.data, link: { text: source.name, href: response.url } } }
            break
        } else {
            errors.push({ message:`Error loading from ${source.name}: ${response.errorText}.`, href: response.url })
        }
    }
    if (errors) {
        yield { errors }
    }
}

export {
    mapResponse,
    WebLoadResponse,
    loadFromWeb,
}
