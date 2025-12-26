import { getBackgroundSpec } from "../../stream/background";
import { StreamRenderData, StreamRenderLayoutSet, StreamRenderObject, StreamSavedLayout, StreamSavedLayoutSet, StreamStateVariable, StreamStateVariablesSet } from "../../stream/data";
import { savedToRenderLayout } from "../../stream/data.convert";
import { applyDelta, getDelta } from "../../stream/delta"
import { computeFormulas } from "../../stream/formulaCompute";
import { interpreterLoadContext, parseFormula } from "../../stream/formulaParser";
import { WebSocketStateCode } from "./webSocketInterface";
import Interpreter from 'js-interpreter';
import * as Babel from '@babel/standalone';
import { StreamBuilderState, StreamTemporalVariablesBuilder, StreamVariablesBuilder } from "./streamVariablesBuilder";
import { STORAGE_VIEW_LAST, STORAGE_VIEW_ITEMS, STORAGE_VIEW_STREAM } from "../../common/const";
import { getUsedVariablesInTemplateList } from "../../stream/template";
import { ItemsState } from "../../view/application/state/items";
import { StreamStateIn } from "../../view/application/state/stream";
import { LastRequiredState } from "../../view/application/state/last";

interface IApiStorage {
    loadLast(): Promise<LastRequiredState>
    loadItems(): Promise<ItemsState>
    loadStream(): Promise<StreamStateIn>
}

class StreamDataBuilder {
    private _variablesBuilders: StreamVariablesBuilder[] = []
    private _temporalVariablesBuilders: StreamTemporalVariablesBuilder[] = []
    private _builderState: StreamBuilderState = { } as StreamBuilderState
    private _dataInClient: StreamRenderData | undefined = undefined
    private _isDirty: boolean = false
    public sendClientData?: (data: any) => Promise<void>

    constructor(private apiStorage: IApiStorage) {
        this.updateState(undefined!)
    }

    public async updateState(name: string) {
        if (name === STORAGE_VIEW_LAST || !this._builderState.last)
        {
            this._builderState.last = await this.apiStorage.loadLast()
            this._isDirty = true
        }
        if (name === STORAGE_VIEW_ITEMS || !this._builderState.items)
        {
            this._builderState.items = await this.apiStorage.loadItems()
            this._isDirty = true
        }
        if (name === STORAGE_VIEW_STREAM || !this._builderState.layouts)
        {
            const layouts = (await this.apiStorage.loadStream())?.layouts;
            this._builderState.layouts = layouts;
            this._builderState.computed = Object.fromEntries(Object.entries(layouts).map(([k, v]) => [k, { usedVariables: getUsedVariablesInTemplateList([v.htmlTemplate, v.cssTemplate]) }]));
            this._isDirty = true
        }
    }

    public async updateShowingLayoutId(showingLayoutId: string | undefined) {
        this._builderState.showingLayoutId = showingLayoutId
        this._isDirty = true
    }

    public setUsedLayouts(usedLayouts: string[]) {
        this._builderState.usedLayouts = usedLayouts
        this._isDirty = true
    }

    public addBuilder(builder: StreamVariablesBuilder) {
        this._variablesBuilders.push(builder)
        this._isDirty = true
        builder.onChanged = async () => { this._isDirty = true }
    }

    public addTemporalBuilder(builder: StreamTemporalVariablesBuilder) {
        this._temporalVariablesBuilders.push(builder)
        this._isDirty = true
        builder.onTemporalChanged = async () => { this._isDirty = true }
    }

    public async getVariablesAndData(): Promise<{ variables: StreamStateVariablesSet, renderData: StreamRenderData }>
    {
        const set: StreamStateVariablesSet = { single: {}, temporal: {} };
        for (const builder of this._variablesBuilders) {
            set.single[builder.getName()] = await builder.getVariables(this._builderState)
        }
        for (const builder of this._temporalVariablesBuilders) {
            const source = builder.getTemporalName()
            const vars = await builder.getTemporalVariables(this._builderState)
            set.single[source] = vars as any
            set.temporal[source] = vars
        }
        const { renderData, formulaVariables } = await this.calculateData(this._builderState.layouts ?? {}, this._builderState.showingLayoutId, set);
        if (formulaVariables) {
            set.single.formula = formulaVariables;
        }
        return { variables: set, renderData };
    }

    private async calculateData(layouts: StreamSavedLayoutSet, showingLayoutId: string | undefined, variables: StreamStateVariablesSet): Promise<{ renderData: StreamRenderData, formulaVariables: StreamStateVariable[] | undefined }> {
        const vars = Object.values(variables.single).flat();
        const data = Object.fromEntries(vars.filter(v => !v.isImage).map(v => [v.name, v.value]));
        data.img = Object.fromEntries(vars.filter(v => v.isImage).map(v => [v.name, v.value]));
        const tObj = Object.fromEntries(Object.values(variables.temporal).flat().map(v => [v.name, v.value]))
        const layoutsToRender: StreamRenderLayoutSet = Object.fromEntries(Object.entries(layouts).map(([k, v]) => [k, savedToRenderLayout(v)]));

        const oldVars = variables.single['formula']?.map(v => v.name) ?? [];
        const layoutVars = variables.single['layout']?.map(v => v.name) ?? [];
        const vObj = Object.fromEntries(Object.entries(data).filter(([k, v]) => !oldVars.includes(k) && !layoutVars.includes(k)));

        const backDarkFormulaObj: object = Object.fromEntries(Object.entries(vObj)
            .filter(([, value]) => typeof value === 'string' && value.startsWith('=') && parseFormula(value.slice(1)).usedVariables.has('backDark')));
        const vObjNoBackDark = Object.fromEntries(Object.entries(vObj).filter(([k]) => !Object.keys(backDarkFormulaObj).includes(k)));
        const commonData: StreamRenderObject = computeFormulas(vObjNoBackDark, tObj);
        const layoutTuple: [string, StreamStateVariable[], StreamRenderObject][] = Object.entries(layouts).map(([id, layout]) => {
            const parameters = Object.fromEntries(layout.parameters?.map(v => [v.name, v.value]) ?? []);
            const backDark = getBackgroundSpec(layout.backgroundType)?.dark ?? false;
            const backComputed = computeFormulas({ ...commonData, backDark, ...backDarkFormulaObj, ...parameters }, tObj);
            const layoutVariables = this.getLayoutVariables(backComputed, layout);
            const layoutObj: StreamRenderObject = {
                ...Object.fromEntries(layoutVariables.map(v => [v.name, v.value])), 
                backDark,
                ...Object.fromEntries(Object.entries(backComputed).filter(([k]) => Object.keys(backDarkFormulaObj).includes(k))),
                ...parameters
            };
            if (layout.images)
                layoutObj.img = Object.fromEntries(layout.images.map(v => [v.name, v.value]))
            return [id, layoutVariables, layoutObj];
        });
        const layoutData: Record<string, StreamRenderObject> = Object.fromEntries(layoutTuple.map(([id,, obj]) => [id, obj]));
        const renderData: StreamRenderData = { commonData, layoutData, layouts: layoutsToRender };

        let formulaVariables: StreamStateVariable[] | undefined = undefined;
        if (showingLayoutId) {
            formulaVariables = layoutTuple.find(([id]) => id === showingLayoutId)?.[1];
        }

        return { renderData, formulaVariables };
    }

    private getLayoutVariables(context: any, layout?: StreamSavedLayout): StreamStateVariable[] {
        const jsCode = layout?.formulaJavaScript;
        if (!jsCode?.trim()) return [];
    
        try {
            const es5Code = getTranspiledCode(jsCode);
            const interpreter = new Interpreter(es5Code, interpreterLoadContext(context));
            interpreter.run();
    
            return Object.entries(interpreter.globalScope.object.properties)
                .filter(([name, value]) =>
                    !name.startsWith('__') &&
                    name !== 'self' &&
                    name !== 'window' &&
                    value !== undefined &&
                    (value as any)?.class !== 'Function'
                )
                .map(([name, value]) => ({ name, value: interpreter.pseudoToNative(value) }))
                .filter(({ name, value }) => !deepEqual(context[name], value));
        } catch (e) {
            return [{ name: '!error', value: e.message }];
        }
    }

    private async sendDataToClient(data: StreamRenderData) {
        function buildKeyTree(used: Set<string>) {
            const tree: any = {};
            for (const key of used) {
                const parts = key.split('.');
                let current = tree;
                for (const part of parts) {
                    current = current[part] ??= {};
                }
            }
            return tree;
        }
        function filterObject(data: any, keyTree: any): any {
            if (typeof data !== 'object' || data === null) return data;
        
            return Object.fromEntries(
                Object.entries(keyTree)
                    .filter(([k]) => k in data)
                    .map(([k, subTree]) => [k, typeof subTree === 'object' && Object.keys(subTree as object).length === 0 ? data[k] : filterObject(data[k], subTree)])
            );
        }

        const computed = this._builderState.computed ?? {}
        const usedLayouts = this._builderState.usedLayouts ?? []
        const usedVariables = new Set(Object.entries(computed).filter(([id]) => usedLayouts.includes(id)).map(([,v]) => v.usedVariables ?? []).flat())
        const keyTree = buildKeyTree(usedVariables);

        const renderData: StreamRenderData = {
            layouts: data.layouts,
            layoutData: Object.fromEntries(Object.entries(data.layoutData)
                .filter(([id]) => usedLayouts.includes(id))
                .map(([id, data]) => {
                    const usedLayoutVariables = computed[id]?.usedVariables
                    if (!usedLayoutVariables?.length) return [id, {}]
                    return [id, filterObject(data, keyTree)]
                })),
            commonData: filterObject(data.commonData, keyTree)
        }
        
        const delta = getDelta(this._dataInClient, renderData)
        if (delta) {
            this._dataInClient = applyDelta(this._dataInClient, delta)
            await this.sendClientData?.(delta)
        }
    }

    public clearClientData(code: WebSocketStateCode) {
        if (code === WebSocketStateCode.connected) {
            // it is a new client, send all data next time
            this._dataInClient = undefined
        }
    }

    public onDataChanged?: (variables: StreamStateVariablesSet, renderData: StreamRenderData) => Promise<void>

    public async loop() {
        while (true)
        {
            if (this._isDirty)
            {
                this._isDirty = false;
                const { variables, renderData } = await this.getVariablesAndData();
                if (this.onDataChanged)
                    await this.onDataChanged(variables, renderData);
                await this.sendDataToClient(renderData);
            }
            else
            {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }
}

const transpileCache = new Map<string, string>();
function getTranspiledCode(jsCode: string): string {
    if (!transpileCache.has(jsCode)) {
        // Transpile the modern JS code to ES5
        transpileCache.set(jsCode, Babel.transform(jsCode, { presets: ['env'] }).code!);
    }
    return transpileCache.get(jsCode)!;
}

function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    const aKeys = Object.keys(a), bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(key => deepEqual(a[key], b[key]));
}

export {
    IApiStorage,
    StreamDataBuilder
}
