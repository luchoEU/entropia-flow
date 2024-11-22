import { FetchResponse } from "./fetch";
import { EntropiaNexus } from "./nexus";
import { isSourceLoadFailure, IWebSource, SourceLoadResponse } from "./sources";
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
    url: string,
    data: T
}

function mapResponse<TF,TR>(response: FetchResponse<TF>, mapper: (data: TF) => SourceMapperOut<TR>): SourceLoadResponse<TR> {
    return {
        ok: response.ok,
        errorText: response.errorText ?? `Status code: ${response.status}`,
        ...response.result && mapper(response.result)
    }
}

async function* loadFromWeb<T>(loadFrom: (source: IWebSource) => Promise<SourceLoadResponse<T>>): AsyncGenerator<WebLoadResponse<T>> {
    let errors: string[] = [];
    for (const source of WebSources) {
        yield { loading: { source: source.name } }
        const response = await loadFrom(source)
        if (response.ok) {
            errors = undefined
            yield { data: response.data }
            break
        } else if (isSourceLoadFailure(response)) {
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
