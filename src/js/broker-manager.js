// Broker Manager Module
import { UIUtils } from './ui-utils.js';
import { SortUtils } from './sort-utils.js';

export class BrokerManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.brokers = this.storage.loadBrokers();
        this.currentEditing = null;
        this.sortConfig = { column: 'code', direction: 'asc' };
    }

    loadTable() {
        const tableBody = document.getElementById('brokers-table');
        if (!tableBody) return; // Exit if table doesn't exist on current page
        
        if (this.brokers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        <div class="empty-state">
                            <i class="bi bi-building"></i>
                            <p>No brokers found. Add your first broker to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort brokers based on current sort configuration
        const sortedBrokers = SortUtils.sortByColumn([...this.brokers], this.sortConfig.column, this.sortConfig.direction);

        tableBody.innerHTML = sortedBrokers.map(broker => `
            <tr>
                <td><strong>${UIUtils.escapeHtml(broker.code)}</strong></td>
                <td>${UIUtils.escapeHtml(broker.name)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="editBroker('${broker.code}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="confirmDeleteBroker('${broker.code}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openModal(brokerCode = null) {
        this.currentEditing = brokerCode;
        const modal = document.getElementById('brokerModal');
        const title = document.getElementById('brokerModalTitle');
        const codeInput = document.getElementById('brokerCode');
        const nameInput = document.getElementById('brokerName');

        if (brokerCode) {
            // Edit mode
            const broker = this.brokers.find(b => b.code === brokerCode);
            title.textContent = 'Edit Broker';
            codeInput.value = broker.code;
            codeInput.disabled = true; // Don't allow code changes in edit mode
            nameInput.value = broker.name;
        } else {
            // Add mode
            title.textContent = 'Add Broker';
            codeInput.disabled = false;
            document.getElementById('brokerForm').reset();
        }

        nameInput.focus();
    }

    edit(code) {
        this.openModal(code);
        const modal = new bootstrap.Modal(document.getElementById('brokerModal'));
        modal.show();
    }

    save() {
        const code = document.getElementById('brokerCode').value.trim();
        const name = document.getElementById('brokerName').value.trim();

        if (!code || !name) {
            UIUtils.showAlert('Please fill in all fields.', 'danger');
            return;
        }

        // Check for duplicate codes (only in add mode)
        if (!this.currentEditing && this.brokers.some(b => b.code === code)) {
            UIUtils.showAlert('A broker with this code already exists.', 'danger');
            return;
        }

        if (this.currentEditing) {
            // Edit existing broker
            const index = this.brokers.findIndex(b => b.code === this.currentEditing);
            this.brokers[index] = { code, name };
            UIUtils.showAlert('Broker updated successfully!', 'success');
        } else {
            // Add new broker
            this.brokers.push({ code, name });
            UIUtils.showAlert('Broker added successfully!', 'success');
        }

        this.storage.saveBrokers(this.brokers);
        this.loadTable();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('brokerModal'));
        modal.hide();

        // Update dashboard if elements exist
        const products = this.storage.loadProducts();
        const productTypes = this.storage.loadProductTypes();
        UIUtils.updateDashboard(this.brokers, products, productTypes);
    }

    confirmDelete(code) {
        const broker = this.brokers.find(b => b.code === code);
        document.getElementById('confirmMessage').textContent = 
            `Are you sure you want to delete the broker "${broker.name}" (${broker.code})?`;
        
        document.getElementById('confirmButton').onclick = () => {
            this.delete(code);
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
        };

        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
    }

    delete(code) {
        this.brokers = this.brokers.filter(b => b.code !== code);
        this.storage.saveBrokers(this.brokers);
        this.loadTable();
        UIUtils.showAlert('Broker deleted successfully!', 'success');

        // Update dashboard if elements exist
        const products = this.storage.loadProducts();
        const productTypes = this.storage.loadProductTypes();
        UIUtils.updateDashboard(this.brokers, products, productTypes);
    }

    sortByColumn(column) {
        this.sortConfig = SortUtils.toggleSortDirection(this.sortConfig, column);
        this.loadTable();
        this.updateSortIcons();
    }

    updateSortIcons() {
        SortUtils.updateSortIcons('brokers-table-header', this.sortConfig);
    }

    getBrokers() {
        return this.brokers;
    }
}
