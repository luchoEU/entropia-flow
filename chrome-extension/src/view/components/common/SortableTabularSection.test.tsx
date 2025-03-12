import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import SortableTabularSection from "./SortableTabularSection";
import { TabularState, TabularStateData } from "../../application/state/tabular";
import 'canvas';
import { setTabularDefinitions } from "../../application/helpers/tabular";
import { GameLogGlobal } from "../../../background/client/gameLogData";
import { gameLogTabularDefinitions } from "../../application/tabular/log";
import { GAME_LOG_TABULAR_GLOBAL } from "../../application/state/log";

const _toState = (list: any[]): TabularStateData => ({
    expanded: true,
    filter: '',
    items: {
        all: list,
        show: list,
        stats: { count: list.length }
    }
})
const _mockTabularStore = (tabular: TabularState) => configureMockStore()({ tabular });
const _mockTabularStoreFromList = (selector: string, list: any[]) => _mockTabularStore({ [selector]: _toState(list) });
const _mockTabularStoreEmpty = (selector: string) => _mockTabularStoreFromList(selector, [])

describe("SortableTabularSection", () => {
    beforeAll(() => {
        setTabularDefinitions({
            t: {
                title: 'Test',
                columns: ['Test'],
                getRow: (g) => [g.toString()]
            }
        })
        setTabularDefinitions(gameLogTabularDefinitions)
    })
    it("renders a value", () => {
        const tabular: TabularState = {
            t: {
                expanded: true,
                filter: '',
                items: {
                    all: [1, 2, 3],
                    show: [2, 3],
                    stats: { count: 2 }
                }
            }
        };
        const store = _mockTabularStore(tabular);
        
        const { container } = render(
            <Provider store={store}>
                <SortableTabularSection selector="t" />
            </Provider>
        );
        
        expect(container.innerHTML).toBe('<section><h1>Test<span title=\"Collapse\" class=\"pointer popup-container hide\"><img class=\"hide\" src=\"img/up.png\"></span></h1><div><div class=\"inline\"><div class=\"search-container\"><p><span>Listing</span><span> 2 </span><span> items</span></p><p class=\"search-input-container\"><span class=\"search-input\"><input class=\"form-control\" placeholder=\"search\" type=\"text\" value=\"\"></span></p></div><div class=\"sort-table\" style=\"font: sans-serif 12px 12px;\"><div class=\"sort-row\"><div style=\"width: 44px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Test</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div></div><div style=\"position: relative; height: 40px; width: 61px; overflow: auto; will-change: transform; direction: ltr;\"><div style=\"height: 40px; width: 100%;\"><div class=\"item-row\" style=\"position: absolute; left: 0px; top: 0px; height: 20px; width: 100%;\"><div style=\"width: 44px; height: 20px;\"><span class=\" item-text\" title=\"2\">2</span></div></div><div class=\"item-row\" style=\"position: absolute; left: 0px; top: 20px; height: 20px; width: 100%;\"><div style=\"width: 44px; height: 20px;\"><span class=\" item-text\" title=\"3\">3</span></div></div></div></div></div></div><div class=\"inline\"></div></div></section>');
    });
    it("empty fixed", () => {
        const store = _mockTabularStoreEmpty('t');
        
        const { container } = render(
            <Provider store={store}>
                <SortableTabularSection selector="t" />
            </Provider>
        );
        
        expect(container.innerHTML).toBe('<section><h1>Test<span title=\"Collapse\" class=\"pointer popup-container hide\"><img class=\"hide\" src=\"img/up.png\"></span></h1><div><div class=\"inline\"><div class=\"search-container\"><p><span>Listing</span><span> 0 </span><span> items</span></p><p class=\"search-input-container\"><span class=\"search-input\"><input class=\"form-control\" placeholder=\"search\" type=\"text\" value=\"\"></span></p></div><div class=\"sort-table\" style=\"font: sans-serif 12px 12px;\"><div class=\"sort-row\"><div style=\"width: 44px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Test</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div></div><div style=\"position: relative; height: 0px; width: 61px; overflow: auto; will-change: transform; direction: ltr;\"><div style=\"height: 0px; width: 100%;\"></div></div></div></div><div class=\"inline\"></div></div></section>');
    });
    it("empty table", () => {
        const store = _mockTabularStoreEmpty('t');

        const { container } = render(
            <Provider store={store}>
                <SortableTabularSection selector="t" useTable={true} />
            </Provider>
        );
        
        expect(container.innerHTML).toBe('<section><h1>Test<span title=\"Collapse\" class=\"pointer popup-container hide\"><img class=\"hide\" src=\"img/up.png\"></span></h1><div><div class=\"inline\"><div class=\"search-container\"><p><span>Listing</span><span> 0 </span><span> items</span></p><p class=\"search-input-container\"><span class=\"search-input\"><input class=\"form-control\" placeholder=\"search\" type=\"text\" value=\"\"></span></p></div><div style=\"max-height: 610px; overflow-x: hidden; overflow-y: auto;\"><table class=\"sort-table\" style=\"font: sans-serif 12px 12px;\"><thead><tr><th class=\"sort-row\" style=\"width: 44px;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Test</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></th></tr></thead><tbody></tbody></table></div></div><div class=\"inline\"></div></div></section>');
    });
    it("empty cell value", () => {
        const data: GameLogGlobal[] = [{
            time: '2025-01-11 12:38:08',
            player: 'High Looter Elite',
            name: 'Maffoid Warlord',
            type: 'hunt',
            value: 808,
            isHoF: true
        }];

        const store = _mockTabularStoreFromList(GAME_LOG_TABULAR_GLOBAL, data);
        
        const { container } = render(
            <Provider store={store}>
                <SortableTabularSection selector={GAME_LOG_TABULAR_GLOBAL} />
            </Provider>
        );
        
        expect(container.innerHTML).toBe('<section><h1>Global<span title=\"Collapse\" class=\"pointer popup-container hide\"><img class=\"hide\" src=\"img/up.png\"></span></h1><div><div class=\"inline\"><div class=\"search-container\"><p><span>Listing</span><span> 1 </span><span> item</span></p><p class=\"search-input-container\"><span class=\"search-input\"><input class=\"form-control\" placeholder=\"search\" type=\"text\" value=\"\"></span></p></div><div class=\"sort-table\" style=\"font: sans-serif 12px 12px;\"><div class=\"sort-row\"><div style=\"width: 121px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Time</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div><div style=\"width: 94px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Player</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div><div style=\"width: 91px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Name</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div><div style=\"width: 48px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Type</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div><div style=\"width: 51px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Value</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div><div style=\"width: 67px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>Location</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div><div style=\"width: 47px; justify-content: center;\"><div style=\"display: flex; width: 100%;\" class=\"pointer\"><strong>HOF</strong><img title=\"Sorted Descending\" style=\"visibility: hidden;\" src=\"img/down.png\"></div></div></div><div style=\"position: relative; height: 20px; width: 536px; overflow: auto; will-change: transform; direction: ltr;\"><div style=\"height: 20px; width: 100%;\"><div class=\"item-row\" style=\"position: absolute; left: 0px; top: 0px; height: 20px; width: 100%;\"><div style=\"width: 121px; height: 20px;\"><span class=\" item-text\" title=\"2025-01-11 12:38:08\">2025-01-11 12:38:08</span></div><div style=\"width: 94px; height: 20px;\"><span class=\" item-text\" title=\"High Looter Elite\">High Looter Elite</span></div><div style=\"width: 91px; height: 20px;\"><span class=\" item-text\" title=\"Maffoid Warlord\">Maffoid Warlord</span></div><div style=\"width: 48px; height: 20px;\"><span class=\" item-text\" title=\"hunt\">hunt</span></div><div style=\"width: 51px; height: 20px; justify-content: end;\"><span class=\" item-text\" title=\"808\">808</span></div><div style=\"width: 67px; height: 20px;\"></div><div style=\"width: 47px; height: 20px;\"><span class=\" item-text\" title=\"[HoF]\">[HoF]</span></div></div></div></div></div></div><div class=\"inline\"></div></div></section>');
    });
});
