import { URL_MY_BALANCE_DATA } from "../common/const";
import { Component, traceError } from "../common/trace";

/// BALANCE READER ///

interface Balance {
    errorText?: string,
    accountBalance?: number
}

class BalanceReader {
    public async requestBalanceHtml(): Promise<Balance> {
        const span = document.querySelector("main p span span") as HTMLSpanElement
        if (!span)
            return { errorText: "Text not found" }

        const balance = parseFloat(span.innerText)
        return { accountBalance: balance }
    }

    private loadFromHtml = true
    public async requestBalanceAjax(): Promise<Balance> {
        let json: Balance
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Origin': 'https://account.entropiauniverse.com',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: null
            };
            const res = await fetch(URL_MY_BALANCE_DATA, options)
            if (res.ok) {
                const data = await res.json()
                if (data.statusCode == 200) {
                    json = { accountBalance: data.accountBalance }
                }
                else {
                    json = { errorText: "Failed with status code: " + data.statusCode }
                }
            } else {
                json = { errorText: res.statusText }
            }
        } catch (e: any) {
            traceError(Component.BalanceReader, 'json exception:', e)
            json = { errorText: e.message }
        }
        return json
    }
}

export {
    Balance,
    BalanceReader
}
