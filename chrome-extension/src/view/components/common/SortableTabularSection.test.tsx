import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import SortableTabularSection from "./SortableTabularSection";
import { TabularState } from "../../application/state/tabular";
import 'canvas';
import { setTabularDefinitions } from "../../application/helpers/tabular";

const mockStore = configureMockStore();

describe("SortableTabularSection", () => {
    beforeAll(() => {
        setTabularDefinitions({
            t: {
                title: 'Test',
                columns: ['Test'],
                getRow: (g) => [g.toString()]
            }
        })
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
        const store = mockStore({ tabular });
        
        const { container } = render(
            <Provider store={store}>
                <SortableTabularSection selector="t" />
            </Provider>
        );
        
        expect(container.innerHTML).toBe('<section><h1>Test<span title=\"Collapse\" class=\"pointer popup-container hide\"><img class=\"hide\" src=\"img/up.png\"></span></h1><div><div class=\"search-container\"><p><span>Listing</span><span> 2 </span><span> items</span></p><p class=\"search-input-container\"><span class=\"search-input\"><input class=\"form-control\" placeholder=\"search\" type=\"text\" value=\"\"></span></p></div><div class=\"sort-table\"><div class=\"sort-row\"><div style=\"width: 44px; font: sans-serif 12px 12px;\" class=\"pointer\"><span style=\"justify-content: center;\"><strong>Test</strong><img title=\"Sorted Descending\" src=\"img/down.png\"></span></div></div><div style=\"position: relative; height: 40px; width: 61px; overflow: auto; will-change: transform; direction: ltr;\"><div style=\"height: 40px; width: 100%;\"><div class=\"item-row\" style=\"position: absolute; left: 0px; top: 0px; height: 20px; width: 100%;\"><div style=\"width: 44px; font: sans-serif 12px 12px; height: 20px;\"><span class=\" item-text\" title=\"2\">2</span></div></div><div class=\"item-row\" style=\"position: absolute; left: 0px; top: 20px; height: 20px; width: 100%;\"><div style=\"width: 44px; font: sans-serif 12px 12px; height: 20px;\"><span class=\" item-text\" title=\"3\">3</span></div></div></div></div></div></div></section>');
    });
    it("empty fixed", () => {
        const tabular: TabularState = {
            t: {
                expanded: true,
                filter: '',
                items: {
                    all: [],
                    show: [],
                    stats: { count: 0 }
                }
            }
        };
        const store = mockStore({ tabular });
        
        const { container } = render(
            <Provider store={store}>
                <SortableTabularSection selector="t" />
            </Provider>
        );
        
        expect(container.innerHTML).toBe('<section><h1>Test<span title=\"Collapse\" class=\"pointer popup-container hide\"><img class=\"hide\" src=\"img/up.png\"></span></h1><div><div class=\"search-container\"><p><span>Listing</span><span> 0 </span><span> items</span></p><p class=\"search-input-container\"><span class=\"search-input\"><input class=\"form-control\" placeholder=\"search\" type=\"text\" value=\"\"></span></p></div><div class=\"sort-table\"><div class=\"sort-row\"><div style=\"width: 44px; font: sans-serif 12px 12px;\" class=\"pointer\"><span style=\"justify-content: center;\"><strong>Test</strong><img title=\"Sorted Descending\" src=\"img/down.png\"></span></div></div><div style=\"position: relative; height: 0px; width: 61px; overflow: auto; will-change: transform; direction: ltr;\"><div style=\"height: 0px; width: 100%;\"></div></div></div></div></section>');
    });
    it("empty table", () => {
        const tabular: TabularState = {
            t: {
                expanded: true,
                filter: '',
                items: {
                    all: [],
                    show: [],
                    stats: { count: 0 }
                }
            }
        };
        const store = mockStore({ tabular });
        
        const { container } = render(
            <Provider store={store}>
                <SortableTabularSection selector="t" useTable={true} />
            </Provider>
        );
        
        expect(container.innerHTML).toBe('<section><h1>Test<span title=\"Collapse\" class=\"pointer popup-container hide\"><img class=\"hide\" src=\"img/up.png\"></span></h1><div><div class=\"search-container\"><p><span>Listing</span><span> 0 </span><span> items</span></p><p class=\"search-input-container\"><span class=\"search-input\"><input class=\"form-control\" placeholder=\"search\" type=\"text\" value=\"\"></span></p></div><table class=\"sort-table\"><thead><tr><th class=\"sort-row\" style=\"width: 44px;\"><span style=\"justify-content: center;\"><strong>Test</strong><img title=\"Sorted Descending\" src=\"img/down.png\"></span></th></tr></thead><tbody></tbody></table></div></section>');
    });
});
