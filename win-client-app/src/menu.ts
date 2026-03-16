import Mustache from 'mustache'

interface MenuLayout {
    id: string
    name: string
    htmlTemplate?: string
    cssTemplate?: string
}

interface MenuData {
    layouts: MenuLayout[]
    roles: string[]
    favorites: Record<string, string[]>
    commonData: any
    allLayouts: Record<string, any>
}

let _container: HTMLElement | null = null
let _data: MenuData | null = null
let _activeRole: string = 'all'
let _searchQuery: string = ''
let _onSelect: ((layoutId: string) => void) | null = null
let _onToggleFavorite: ((role: string, layoutId: string) => void) | null = null

function buildMenuDOM(
    container: HTMLElement,
    data: MenuData,
    onSelect: (layoutId: string) => void,
    onToggleFavorite: (role: string, layoutId: string) => void
) {
    _container = container
    _data = data
    _onSelect = onSelect
    _onToggleFavorite = onToggleFavorite
    _activeRole = 'all'
    _searchQuery = ''

    container.innerHTML = ''
    container.className = 'menu-container'

    // Header with search
    const header = document.createElement('div')
    header.className = 'menu-header'
    const searchInput = document.createElement('input')
    searchInput.className = 'menu-search'
    searchInput.type = 'text'
    searchInput.placeholder = 'Filter layouts...'
    searchInput.addEventListener('input', () => {
        _searchQuery = searchInput.value.toLowerCase()
        renderGrid()
    })
    header.appendChild(searchInput)
    container.appendChild(header)

    // Role tabs
    const rolesDiv = document.createElement('div')
    rolesDiv.className = 'menu-roles'
    const allTab = createRoleTab('all', 'All')
    allTab.classList.add('active')
    rolesDiv.appendChild(allTab)
    for (const role of data.roles) {
        rolesDiv.appendChild(createRoleTab(role, capitalize(role)))
    }
    container.appendChild(rolesDiv)

    // Grid body
    const body = document.createElement('div')
    body.className = 'menu-body'
    const grid = document.createElement('div')
    grid.className = 'menu-grid'
    body.appendChild(grid)
    container.appendChild(body)

    renderGrid()

    // Focus search after DOM is ready
    setTimeout(() => searchInput.focus(), 50)
}

function createRoleTab(role: string, label: string): HTMLElement {
    const btn = document.createElement('button')
    btn.className = 'role-tab'
    btn.dataset.role = role
    btn.textContent = label
    btn.addEventListener('click', (e) => {
        e.stopPropagation()
        _activeRole = role
        // Update active state
        const parent = btn.parentElement
        if (parent) {
            for (const child of parent.children) {
                child.classList.remove('active')
            }
        }
        btn.classList.add('active')
        renderGrid()
    })
    return btn
}

function renderGrid() {
    if (!_container || !_data) return

    const grid = _container.querySelector('.menu-grid')
    if (!grid) return
    grid.innerHTML = ''

    let layouts = _data.layouts

    // Filter by search
    if (_searchQuery) {
        layouts = layouts.filter(l => l.name.toLowerCase().includes(_searchQuery))
    }

    // Sort: favorites first for active role, then alphabetically
    const favList = (_activeRole !== 'all' && _data.favorites[_activeRole]) || []
    layouts = [...layouts].sort((a, b) => {
        const aFav = favList.includes(a.id)
        const bFav = favList.includes(b.id)
        if (aFav !== bFav) return aFav ? -1 : 1
        return a.name.localeCompare(b.name)
    })

    for (const layout of layouts) {
        grid.appendChild(createMenuItem(layout, favList))
    }
}

function createMenuItem(layout: MenuLayout, favList: string[]): HTMLElement {
    const item = document.createElement('div')
    item.className = 'menu-item'
    item.dataset.layout = layout.id

    // Thumbnail preview
    const previewWrapper = document.createElement('div')
    previewWrapper.className = 'preview-wrapper'
    const previewContent = document.createElement('div')
    previewContent.className = 'preview-content'
    renderThumbnail(previewContent, layout)
    previewWrapper.appendChild(previewContent)
    item.appendChild(previewWrapper)

    // Info row
    const info = document.createElement('div')
    info.className = 'menu-item-info'
    const nameSpan = document.createElement('span')
    nameSpan.className = 'menu-item-name'
    nameSpan.textContent = layout.name
    nameSpan.title = layout.name
    info.appendChild(nameSpan)

    // Favorite button (only when a role tab is selected)
    if (_activeRole !== 'all') {
        const favBtn = document.createElement('button')
        favBtn.className = 'menu-item-fav'
        const isFav = favList.includes(layout.id)
        favBtn.textContent = isFav ? '\u2605' : '\u2606'
        if (isFav) favBtn.classList.add('is-fav')
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            _onToggleFavorite?.(_activeRole, layout.id)
        })
        info.appendChild(favBtn)
    }

    item.appendChild(info)

    // Click to select layout
    item.addEventListener('click', (e) => {
        e.stopPropagation()
        _onSelect?.(layout.id)
    })

    return item
}

function renderThumbnail(container: HTMLElement, layout: MenuLayout) {
    if (!layout.htmlTemplate || !_data) {
        container.innerHTML = '<div class="preview-empty">No preview</div>'
        return
    }

    try {
        const layoutData = _data.allLayouts[layout.id]
        const data = layoutData ? {
            ..._data.commonData,
            ...layoutData,
            img: {
                ..._data.commonData?.img as object,
                ...layoutData?.img as object
            }
        } : _data.commonData

        const html = Mustache.render(layout.htmlTemplate, data)

        // Render HTML in a scoped container
        const inner = document.createElement('div')
        inner.className = 'layout-root'
        inner.innerHTML = html

        // Add scoped CSS
        if (layout.cssTemplate) {
            const css = Mustache.render(layout.cssTemplate, data)
            const scopeId = `preview-${layout.id.replace(/[^a-zA-Z0-9]/g, '-')}`
            container.id = scopeId
            const scopedCss = css.replace(/\.layout-root/g, `#${scopeId} .layout-root`)
            const style = document.createElement('style')
            style.textContent = scopedCss
            container.appendChild(style)
        }

        container.appendChild(inner)
    } catch {
        container.innerHTML = '<div class="preview-empty">Error</div>'
    }
}

function updateMenuData(data: MenuData) {
    _data = data
    renderGrid()
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export {
    buildMenuDOM,
    updateMenuData,
    MenuLayout,
    MenuData
}
