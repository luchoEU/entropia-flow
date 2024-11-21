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
    }[]
    data?: T
}

function mapResponse<TF,TR>(response: FetchResponse<TF>, mapper: (data: TF) => TR): SourceLoadResponse<TR> {
    return {
        ok: response.ok,
        errorText: response.errorText ?? `Status code: ${response.status}`,
        data: response.result && mapper(response.result)
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
        } else {
            errors.push(`Error loading from ${source.name}. ${response.errorText}.`)
        }
    }
    if (errors) {
        yield { errors: errors.map(message => ({ message })) }
    }
}

export {
    mapResponse,
    WebLoadResponse,
    loadFromWeb
}