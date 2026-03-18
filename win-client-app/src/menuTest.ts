import { render as clientRender } from "clientStream";
import { MENU_HTML_TEMPLATE, MENU_CSS_TEMPLATE, MenuState, MenuDataInput, buildMenuData } from "./menuLayout";

let _menuState: MenuState = { activeRole: 'all', searchQuery: '' };
let _data: MenuDataInput | null = null;

async function reRender() {
    if (!_data) return;

    const menuData = buildMenuData(_menuState, _data);
    const layout = { htmlTemplate: MENU_HTML_TEMPLATE, cssTemplate: MENU_CSS_TEMPLATE };
    await clientRender({ data: menuData as any, layout: layout as any }, () => {}, 1, { width: 450, height: 250 });
    attachHandlers();
}

function attachHandlers() {
    const container = document.querySelector('.menu-container') as HTMLElement;
    if (!container) return;

    const searchInput = container.querySelector('.menu-search') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
        _menuState.searchQuery = searchInput.value.toLowerCase();
        reRender();
    });

    container.querySelector('.menu-roles')?.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('[data-role]') as HTMLElement;
        if (!btn) return;
        e.stopPropagation();
        _menuState.activeRole = btn.dataset.role!;
        reRender();
    });

    const grid = container.querySelector('.menu-grid')
    const descEl = container.querySelector('.menu-description') as HTMLElement

    grid?.addEventListener('mouseover', (e) => {
        const item = (e.target as HTMLElement).closest('[data-layout]') as HTMLElement
        if (item && descEl) descEl.textContent = item.dataset.description || ''
    })
    grid?.addEventListener('mouseleave', () => {
        if (descEl) descEl.textContent = ''
    })

    grid?.addEventListener('click', (e) => {
        const favBtn = (e.target as HTMLElement).closest('[data-fav]') as HTMLElement;
        if (favBtn) {
            e.stopPropagation();
            const role = _menuState.activeRole;
            const id = favBtn.dataset.fav!;
            if (!_data!.favorites) _data!.favorites = {};
            if (!_data!.favorites[role]) _data!.favorites[role] = [];
            const favs = _data!.favorites[role];
            const idx = favs.indexOf(id);
            if (idx >= 0) favs.splice(idx, 1);
            else favs.push(id);
            reRender();
            return;
        }
        const item = (e.target as HTMLElement).closest('[data-layout]') as HTMLElement;
        if (item) {
            e.stopPropagation();
            console.log('selected:', item.dataset.layout);
        }
    });

    // Focus search input, cursor at end
    setTimeout(() => {
        if (searchInput) {
            searchInput.focus();
            const v = searchInput.value;
            searchInput.value = '';
            searchInput.value = v;
        }
    }, 50);
}

document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('./menu-data.json');
    _data = await res.json();
    reRender();
});
