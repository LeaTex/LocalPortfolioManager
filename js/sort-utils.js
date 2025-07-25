// Sort Utils Module - Handles sorting functionality
export class SortUtils {
    static sortByColumn(items, column, direction, getDisplayValue = null) {
        return items.sort((a, b) => {
            let aValue, bValue;

            if (getDisplayValue && typeof getDisplayValue === 'function') {
                aValue = getDisplayValue(a, column);
                bValue = getDisplayValue(b, column);
            } else {
                aValue = a[column];
                bValue = b[column];
            }

            // Convert to lowercase for case-insensitive comparison
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            let comparison = 0;
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;

            return direction === 'desc' ? comparison * -1 : comparison;
        });
    }

    static updateSortIcons(tableHeaderId, sortConfig) {
        // Clear all sort icons
        const sortIcons = document.querySelectorAll(`#${tableHeaderId} .sort-icon`);
        if (sortIcons.length === 0) return; // Exit if no table on current page
        
        sortIcons.forEach(icon => {
            icon.className = 'sort-icon bi bi-arrow-down-up';
        });

        // Set active sort icon
        const activeHeader = document.querySelector(`#${tableHeaderId} [data-column="${sortConfig.column}"] .sort-icon`);
        if (activeHeader) {
            activeHeader.className = `sort-icon bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`;
        }
    }

    static toggleSortDirection(sortConfig, column) {
        if (sortConfig.column === column) {
            // Toggle direction if same column
            sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // New column, default to ascending
            sortConfig.column = column;
            sortConfig.direction = 'asc';
        }
        return sortConfig;
    }
}
