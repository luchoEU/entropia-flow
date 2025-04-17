import { NavigateFunction } from "react-router-dom";
import { StreamRenderLayout } from "../../../stream/data";

const FONT = '12px system-ui, sans-serif'
const FONT_BOLD = `bold ${FONT}`
const IMG_WIDTH = 26
const IMG_SORT_WIDTH = 18
const PLUS_WIDTH = 11 // ExpandablePlusButton
const ITEM_TEXT_PADDING = 5
const INPUT_WIDTH = 200
const INPUT_PADDING = 8
const SCROLL_BAR_WIDTH = 17
const LIST_TOTAL_HEIGHT = 610 // not multiple of ITEM_SIZE so it is visible there are more
const ITEM_HEIGHT = 20
const COLUMN_PADDING = 3

type RowValue =
    string |
    RowValue[] |
    { dispatch?: (navigate: NavigateFunction) => any, class?: string, style?: any, visible?: boolean, width?: number, maxWidth?: number } & (
        { flex: number } |
        { img: string, title: string, show?: boolean } |
        { button: string } |
        { text: string, title?: string } |
        { strong: string } |
        { input: string, dispatchChange: (value: string) => any } |
        { file: string, dispatchChange: (value: string) => any } |
        RowValueLayout |
        { sub: RowValue[] } )

type RowValueLayout = { layout: StreamRenderLayout, layoutId: string, id: string, scale?: number }
type RowValueRender = React.ComponentType<{ v: RowValue }>;

export {
    RowValue,
    RowValueLayout,
    RowValueRender,
    FONT,
    FONT_BOLD,
    IMG_WIDTH,
    IMG_SORT_WIDTH,
    PLUS_WIDTH,
    ITEM_TEXT_PADDING,
    INPUT_WIDTH,
    INPUT_PADDING,
    SCROLL_BAR_WIDTH,
    LIST_TOTAL_HEIGHT,
    ITEM_HEIGHT,
    COLUMN_PADDING
}
