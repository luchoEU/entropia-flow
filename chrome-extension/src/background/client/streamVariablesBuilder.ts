import { StreamStateVariable } from "../../stream/data"

interface StreamVariablesBuilder {
    getName(): string
    getVariables(): Promise<StreamStateVariable[]>
}

export { StreamVariablesBuilder }
