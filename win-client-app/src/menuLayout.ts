/// Menu Layout — extracted from render.ts so menuTest.ts can share templates + logic

const PREFIX_LAYOUT_ID = 'entropiaflow.client.';
const OCR_LAYOUT_ID = PREFIX_LAYOUT_ID + 'ocr';

export const MENU_LAYOUT_ID = PREFIX_LAYOUT_ID + 'menu';

export const MENU_HTML_TEMPLATE = `
<div class="menu-container">
  <div class="menu-header">
    <input class="menu-search" type="text" placeholder="Filter layouts..." value="{{searchQuery}}">
  </div>
  <div class="menu-roles">
    {{#roles}}<button class="role-tab{{#isActive}} active{{/isActive}}" data-role="{{id}}">{{label}}</button>{{/roles}}
  </div>
  <div class="menu-body">
    <div class="menu-grid">
      {{#layouts}}
      <div class="menu-item" data-layout="{{id}}" data-description="{{description}}">
        <div class="menu-item-info">
          <span class="menu-item-name">{{name}}</span>
          {{#showFav}}<button class="menu-item-fav{{#isFav}} is-fav{{/isFav}}" data-fav="{{id}}">{{#isFav}}&#9733;{{/isFav}}{{^isFav}}&#9734;{{/isFav}}</button>{{/showFav}}
        </div>
      </div>
      {{/layouts}}
    </div>
  </div>
  <div class="menu-footer"><span class="menu-description"></span></div>
</div>
`;

export const MENU_CSS_TEMPLATE = `
    #entropia-flow-client-minimize,
    #entropia-flow-client-layout,
    #entropia-flow-client-menu,
    #entropia-flow-client-next,
    #entropia-flow-client-background {
        display: none !important;
    }
    .layout-root {
    }
    .menu-container {
        width: 450px;
        min-height: 250px;
        max-height: 500px;
        background-color: rgba(20, 25, 35, 0.95);
        color: #e0e0e0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 6px;
    }
    .menu-header {
        padding: 10px 12px 6px;
    }
    .menu-search {
        width: 100%;
        box-sizing: border-box;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        color: #e0e0e0;
        font-size: 13px;
        outline: none;
    }
    .menu-search:focus {
        border-color: rgba(100, 160, 255, 0.5);
    }
    .menu-search::placeholder {
        color: rgba(255, 255, 255, 0.35);
    }
    .menu-roles {
        display: flex;
        gap: 4px;
        padding: 4px 12px 8px;
        flex-wrap: wrap;
    }
    .role-tab {
        padding: 3px 10px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        color: #aaa;
        font-size: 13px;
        cursor: pointer;
    }
    .role-tab:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ddd;
    }
    .role-tab.active {
        background: rgba(100, 160, 255, 0.2);
        border-color: rgba(100, 160, 255, 0.4);
        color: #fff;
    }
    .menu-body {
        flex: 1;
        overflow-y: auto;
        padding: 0 12px 10px;
    }
    .menu-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
    .menu-item {
        flex: 1 0 max-content;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        cursor: pointer;
        transition: border-color 0.15s;
    }
    .menu-item:hover {
        border-color: rgba(100, 160, 255, 0.4);
    }
    .menu-item-info {
        display: flex;
        align-items: center;
        padding: 4px 6px;
        gap: 4px;
    }
    .menu-item-name {
        flex: 1;
        white-space: nowrap;
        font-size: 13px;
    }
    .menu-item-fav {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        font-size: 14px;
        padding: 0 2px;
        line-height: 1;
    }
    .menu-item-fav:hover {
        color: rgba(255, 200, 50, 0.7);
    }
    .menu-item-fav.is-fav {
        color: rgba(255, 200, 50, 0.9);
    }
    .menu-body::-webkit-scrollbar {
        width: 6px;
    }
    .menu-body::-webkit-scrollbar-track {
        background: transparent;
    }
    .menu-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
    }
    .menu-footer {
        padding: 4px 12px;
        min-height: 22px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .menu-description {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
    }
`;

export interface MenuState {
    activeRole: string;
    searchQuery: string;
}

export interface MenuDataInput {
    layouts: Record<string, { name: string; description?: string; roles?: string[] }>;
    roles?: string[];
    favorites?: Record<string, string[]>;
}

export function buildMenuData(menuState: MenuState, data: MenuDataInput) {
    const { activeRole, searchQuery } = menuState;
    const favList = data.favorites?.[activeRole] || [];
    const showFav = true;

    const layouts = Object.entries(data.layouts)
        .filter(([k,]) => !k.startsWith(PREFIX_LAYOUT_ID) || k === OCR_LAYOUT_ID)
        .filter(([, l]) => activeRole === 'all' || !l.roles?.length || l.roles.includes(activeRole))
        .map(([id, l]) => ({ id, name: l.name, description: l.description || '' }))
        .filter(l => !searchQuery || l.name.toLowerCase().includes(searchQuery))
        .sort((a, b) => {
            const aFav = favList.includes(a.id), bFav = favList.includes(b.id);
            if (aFav !== bFav) return aFav ? -1 : 1;
            return a.name.localeCompare(b.name);
        })
        .map(l => ({ ...l, isFav: favList.includes(l.id), showFav }));

    const roles = [
        { id: 'all', label: 'All', isActive: activeRole === 'all' },
        ...(data.roles ?? []).map(r => ({
            id: r, label: r.charAt(0).toUpperCase() + r.slice(1), isActive: r === activeRole
        }))
    ];

    return { layouts, roles, searchQuery };
}
