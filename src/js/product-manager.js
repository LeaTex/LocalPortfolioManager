// Product Manager Module
import { UIUtils } from './ui-utils.js';
import { SortUtils } from './sort-utils.js';

export class ProductManager {
    constructor(storageManager, productTypeManager) {
        this.storage = storageManager;
        this.productTypeManager = productTypeManager;
        this.products = this.storage.loadProducts();
        this.currentEditing = null;
        this.sortConfig = { column: 'code', direction: 'asc' };
        this.filters = {
            code: '',
            description: '',
            type: ''
        };
    }

    loadTable() {
        const tableBody = document.getElementById('products-table');
        if (!tableBody) return; // Exit if table doesn't exist on current page
        
        // Apply filters
        const filteredProducts = this.filterProducts(this.products);

        if (filteredProducts.length === 0) {
            const isEmpty = this.products.length === 0;
            const hasActiveFilters = this.filters.code || this.filters.description || this.filters.type;
            
            let message, icon;
            if (isEmpty) {
                message = 'No products found. Add your first product to get started.';
                icon = 'bi-box';
            } else if (hasActiveFilters) {
                message = 'No products match the current filters. Try adjusting your search criteria.';
                icon = 'bi-search';
            } else {
                message = 'No products found.';
                icon = 'bi-box';
            }
            
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <div class="empty-state">
                            <i class="bi ${icon}"></i>
                            <p>${message}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort products based on current sort configuration
        const sortedProducts = SortUtils.sortByColumn([...filteredProducts], this.sortConfig.column, this.sortConfig.direction, (product, column) => {
            if (column === 'type') {
                return this.productTypeManager.getTypeName(product.typeCode);
            }
            return product[column === 'description' ? 'description' : 'code'];
        });
        tableBody.innerHTML = sortedProducts.map(product => `
            <tr>
                <td><strong>${UIUtils.escapeHtml(product.code)}</strong></td>
                <td>${UIUtils.escapeHtml(product.description)}</td>
                <td>
                    <span class="badge bg-secondary">${UIUtils.escapeHtml(this.productTypeManager.getTypeName(product.typeCode))}</span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="editProduct('${product.code}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="confirmDeleteProduct('${product.code}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openModal(productCode = null) {
        this.currentEditing = productCode;
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const codeInput = document.getElementById('productCode');
        const descriptionInput = document.getElementById('productDescription');
        const typeSelect = document.getElementById('productType');

        // Load product type options
        this.productTypeManager.loadOptions();

        if (productCode) {
            // Edit mode
            const product = this.products.find(p => p.code === productCode);
            title.textContent = 'Edit Product';
            codeInput.value = product.code;
            codeInput.disabled = true; // Don't allow code changes in edit mode
            descriptionInput.value = product.description;
            typeSelect.value = product.typeCode || '';
        } else {
            // Add mode
            title.textContent = 'Add Product';
            codeInput.disabled = false;
            document.getElementById('productForm').reset();
            this.productTypeManager.loadOptions(); // Reload options after reset
        }

        descriptionInput.focus();
    }

    edit(code) {
        this.openModal(code);
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    }

    save() {
        const code = document.getElementById('productCode').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const typeCode = document.getElementById('productType').value.trim();

        if (!code || !description) {
            UIUtils.showAlert('Please fill in all required fields.', 'danger');
            return;
        }

        // Check for duplicate codes (only in add mode)
        if (!this.currentEditing && this.products.some(p => p.code === code)) {
            UIUtils.showAlert('A product with this code already exists.', 'danger');
            return;
        }

        const productData = { 
            code, 
            description, 
            typeCode: typeCode || null 
        };

        if (this.currentEditing) {
            // Edit existing product
            const index = this.products.findIndex(p => p.code === this.currentEditing);
            this.products[index] = productData;
            UIUtils.showAlert('Product updated successfully!', 'success');
        } else {
            // Add new product
            this.products.push(productData);
            UIUtils.showAlert('Product added successfully!', 'success');
        }

        this.storage.saveProducts(this.products);
        this.loadTable();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();

        // Update dashboard if elements exist
        const brokers = this.storage.loadBrokers();
        const productTypes = this.storage.loadProductTypes();
        UIUtils.updateDashboard(brokers, this.products, productTypes);
    }

    confirmDelete(code) {
        const product = this.products.find(p => p.code === code);
        document.getElementById('confirmMessage').textContent = 
            `Are you sure you want to delete the product "${product.description}" (${product.code})?`;
        
        document.getElementById('confirmButton').onclick = () => {
            this.delete(code);
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
        };

        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
    }

    delete(code) {
        this.products = this.products.filter(p => p.code !== code);
        this.storage.saveProducts(this.products);
        this.loadTable();
        UIUtils.showAlert('Product deleted successfully!', 'success');

        // Update dashboard if elements exist
        const brokers = this.storage.loadBrokers();
        const productTypes = this.storage.loadProductTypes();
        UIUtils.updateDashboard(brokers, this.products, productTypes);
    }

    sortByColumn(column) {
        this.sortConfig = SortUtils.toggleSortDirection(this.sortConfig, column);
        this.loadTable();
        this.updateSortIcons();
    }

    updateSortIcons() {
        SortUtils.updateSortIcons('products-table-header', this.sortConfig);
    }

    applyFilters() {
        // Get filter values
        const codeFilter = document.getElementById('filterCode');
        const descriptionFilter = document.getElementById('filterDescription');
        const typeFilter = document.getElementById('filterType');

        if (codeFilter) this.filters.code = codeFilter.value.toLowerCase().trim();
        if (descriptionFilter) this.filters.description = descriptionFilter.value.toLowerCase().trim();
        if (typeFilter) this.filters.type = typeFilter.value.trim();

        this.loadTable();
    }

    clearFilters() {
        // Clear filter inputs
        const codeFilter = document.getElementById('filterCode');
        const descriptionFilter = document.getElementById('filterDescription');
        const typeFilter = document.getElementById('filterType');

        if (codeFilter) codeFilter.value = '';
        if (descriptionFilter) descriptionFilter.value = '';
        if (typeFilter) typeFilter.value = '';

        // Clear filter state
        this.filters = {
            code: '',
            description: '',
            type: ''
        };

        this.loadTable();
    }

    filterProducts(products) {
        return products.filter(product => {
            // Filter by code
            if (this.filters.code && !product.code.toLowerCase().includes(this.filters.code)) {
                return false;
            }

            // Filter by description
            if (this.filters.description && !product.description.toLowerCase().includes(this.filters.description)) {
                return false;
            }

            // Filter by type
            if (this.filters.type && product.typeCode !== this.filters.type) {
                return false;
            }

            return true;
        });
    }

    loadFilterOptions() {
        const select = document.getElementById('filterType');
        if (!select) return;

        // Sort product types by name for the dropdown
        const sortedTypes = [...this.productTypeManager.getProductTypes()].sort((a, b) => a.name.localeCompare(b.name));
        
        select.innerHTML = '<option value="">All Types</option>' +
            sortedTypes.map(type => 
                `<option value="${UIUtils.escapeHtml(type.code)}">${UIUtils.escapeHtml(type.name)}</option>`
            ).join('');
    }

    setupFilterListeners() {
        // Add real-time filtering on input
        const codeFilter = document.getElementById('filterCode');
        const descriptionFilter = document.getElementById('filterDescription');
        const typeFilter = document.getElementById('filterType');

        if (codeFilter) {
            codeFilter.addEventListener('input', () => {
                this.filters.code = codeFilter.value.toLowerCase().trim();
                this.loadTable();
            });
        }

        if (descriptionFilter) {
            descriptionFilter.addEventListener('input', () => {
                this.filters.description = descriptionFilter.value.toLowerCase().trim();
                this.loadTable();
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.filters.type = typeFilter.value.trim();
                this.loadTable();
            });
        }
    }

    getProducts() {
        return this.products;
    }
}
