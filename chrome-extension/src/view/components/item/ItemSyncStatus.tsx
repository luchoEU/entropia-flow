import { useAtomValue } from "jotai";
import { itemsSyncStatusAtom, itemsDebounceTimeAtom, itemsSheetUrlAtom, itemsSyncErrorAtom } from "../../application/atoms/items";
import { settingsAtom } from "../../application/atoms/settings";

const ItemSyncStatus = () => {
    const syncStatus = useAtomValue(itemsSyncStatusAtom);
    const debounceTime = useAtomValue(itemsDebounceTimeAtom);
    const settings = useAtomValue(settingsAtom);
    const itemsSheetUrl = useAtomValue(itemsSheetUrlAtom);
    const syncError = useAtomValue(itemsSyncErrorAtom);

    // Only show if sheet persistence mode is enabled
    if (settings.sheet.itemsSheetPersistenceMode !== 'sheet') {
        return null;
    }

    const handleOpenSheet = () => {
        if (itemsSheetUrl) {
            window.open(itemsSheetUrl, '_blank');
        }
    };

    const getStatusIcon = () => {
        switch (syncStatus) {
            case 'idle':
                return <span style={{ color: '#4CAF50' }}>✓</span>;
            case 'pending':
                return <span style={{ color: '#FF9800' }}>⏱</span>;
            case 'syncing':
                return <span style={{ color: '#2196F3' }}>⟳</span>;
            case 'error':
                return <span style={{ color: '#F44336' }}>✕</span>;
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (syncStatus) {
            case 'idle':
                return 'Saved';
            case 'pending':
                return `Saving in ${(debounceTime / 1000).toFixed(1)}s`;
            case 'syncing':
                return 'Saving...';
            case 'error':
                return 'Error saving';
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (syncStatus) {
            case 'idle':
                return '#4CAF50';
            case 'pending':
                return '#FF9800';
            case 'syncing':
                return '#2196F3';
            case 'error':
                return '#F44336';
            default:
                return '#999';
        }
    };

    return (
        <span
            onClick={handleOpenSheet}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75em',
                color: getStatusColor(),
                marginLeft: '15px',
                fontWeight: syncStatus === 'pending' ? 'bold' : 'normal',
                cursor: itemsSheetUrl ? 'pointer' : 'default',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
                if (itemsSheetUrl) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={
                syncError
                    ? `${getStatusText()} - ${syncError}`
                    : (itemsSheetUrl ? `${getStatusText()} (Click to open Items sheet)` : getStatusText())
            }
        >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
        </span>
    );
};

export default ItemSyncStatus;
