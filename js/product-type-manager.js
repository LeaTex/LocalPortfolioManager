// Product Type Manager Module
import { UIUtils } from './ui-utils.js';
import { SortUtils } from './sort-utils.js';

export class ProductTypeManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.productTypes = this.storage.loadProductTypes();
        this.currentEditing = null;
        this.sortConfig = { column: 'code', direction: 'asc' };
    }

    loadTable() {
        const tableBody = document.getElementById('product-types-table');
        if (!tableBody) return; // Exit if table doesn't exist on current page
        
        if (this.productTypes.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        <div class="empty-state">
                            <i class="bi bi-tags"></i>
                            <p>No product types found. Add your first product type to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort product types based on current sort configuration
        const sortedProductTypes = SortUtils.sortByColumn([...this.productTypes], this.sortConfig.column, this.sortConfig.direction);

        tableBody.innerHTML = sortedProductTypes.map(productType => `
            <tr>
                <td><strong>${UIUtils.escapeHtml(productType.code)}</strong></td>
                <td>${UIUtils.escapeHtml(productType.name)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="editProductType('${productType.code}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="confirmDeleteProductType('${productType.code}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openModal(productTypeCode = null) {
        this.currentEditing = productTypeCode;
        const modal = document.getElementById('productTypeModal');
        const title = document.getElementById('productTypeModalTitle');
        const codeInput = document.getElementById('productTypeCode');
        const nameInput = document.getElementById('productTypeName');

        if (productTypeCode) {
            // Edit mode
            const productType = this.productTypes.find(pt => pt.code === productTypeCode);
            title.textContent = 'Edit Product Type';
            codeInput.value = productType.code;
            codeInput.disabled = true; // Don't allow code changes in edit mode
            nameInput.value = productType.name;
        } else {
            // Add mode
            title.textContent = 'Add Product Type';
            codeInput.disabled = false;
            document.getElementById('productTypeForm').reset();
        }

        nameInput.focus();
    }

    edit(code) {
        this.openModal(code);
        const modal = new bootstrap.Modal(document.getElementById('productTypeModal'));
        modal.show();
    }

    save() {
        const code = document.getElementById('productTypeCode').value.trim();
        const name = document.getElementById('productTypeName').value.trim();

        if (!code || !name) {
            UIUtils.showAlert('Please fill in all fields.', 'danger');
            return;
        }

        // Check for duplicate codes (only in add mode)
        if (!this.currentEditing && this.productTypes.some(pt => pt.code === code)) {
            UIUtils.showAlert('A product type with this code already exists.', 'danger');
            return;
        }

        if (this.currentEditing) {
            // Edit existing product type
            const index = this.productTypes.findIndex(pt => pt.code === this.currentEditing);
            this.productTypes[index] = { code, name };
            UIUtils.showAlert('Product type updated successfully!', 'success');
        } else {
            // Add new product type
            this.productTypes.push({ code, name });
            UIUtils.showAlert('Product type added successfully!', 'success');
        }

        this.storage.saveProductTypes(this.productTypes);
        this.loadTable();
        this.loadOptions(); // Refresh dropdowns in product form
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productTypeModal'));
        modal.hide();

        // Update dashboard if elements exist
        const brokers = this.storage.loadBrokers();
        const products = this.storage.loadProducts();
        UIUtils.updateDashboard(brokers, products, this.productTypes);
    }

    confirmDelete(code) {
        const productType = this.productTypes.find(pt => pt.code === code);
        
        // Check if this product type is being used by any products
        const products = this.storage.loadProducts();
        const productsUsingType = products.filter(p => p.typeCode === code);
        
        if (productsUsingType.length > 0) {
            UIUtils.showAlert(`Cannot delete product type "${productType.name}". It is being used by ${productsUsingType.length} product(s).`, 'danger');
            return;
        }

        document.getElementById('confirmMessage').textContent = 
            `Are you sure you want to delete the product type "${productType.name}" (${productType.code})?`;
        
        document.getElementById('confirmButton').onclick = () => {
            this.delete(code);
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
        };

        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
    }

    delete(code) {
        this.productTypes = this.productTypes.filter(pt => pt.code !== code);
        this.storage.saveProductTypes(this.productTypes);
        this.loadTable();
        this.loadOptions(); // Refresh dropdowns in product form
        UIUtils.showAlert('Product type deleted successfully!', 'success');

        // Update dashboard if elements exist
        const brokers = this.storage.loadBrokers();
        const products = this.storage.loadProducts();
        UIUtils.updateDashboard(brokers, products, this.productTypes);
    }

    loadOptions() {
        const select = document.getElementById('productType');
        if (!select) return;

        // Sort product types by name for the dropdown
        const sortedTypes = [...this.productTypes].sort((a, b) => a.name.localeCompare(b.name));
        
        select.innerHTML = '<option value="">Select a product type</option>' +
            sortedTypes.map(type => 
                `<option value="${UIUtils.escapeHtml(type.code)}">${UIUtils.escapeHtml(type.name)}</option>`
            ).join('');
    }

    getTypeName(typeCode) {
        if (!typeCode) return 'No Type';
        const productType = this.productTypes.find(pt => pt.code === typeCode);
        return productType ? productType.name : 'Unknown Type';
    }

    sortByColumn(column) {
        this.sortConfig = SortUtils.toggleSortDirection(this.sortConfig, column);
        this.loadTable();
        this.updateSortIcons();
    }

    updateSortIcons() {
        SortUtils.updateSortIcons('product-types-table-header', this.sortConfig);
    }

    getProductTypes() {
        return this.productTypes;
    }
}
