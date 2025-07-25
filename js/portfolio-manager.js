// Portfolio Manager Module
import { UIUtils } from './ui-utils.js';
import { SortUtils } from './sort-utils.js';

export class PortfolioManager {
    constructor(storageManager, brokerManager, productManager, productTypeManager) {
        this.storage = storageManager;
        this.brokerManager = brokerManager;
        this.productManager = productManager;
        this.productTypeManager = productTypeManager;
        this.portfolios = this.storage.loadPortfolios();
        this.currentEditing = null;
        this.currentPortfolio = null;
        this.currentEditingProduct = null;
        this.sortConfig = { column: 'type', direction: 'asc' };
        this.unifiedSortConfig = null;
    }

    loadTable() {
        const tableBody = document.getElementById('portfolios-table');
        if (!tableBody) return; // Exit if table doesn't exist on current page
        
        if (this.portfolios.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        <div class="empty-state">
                            <i class="bi bi-briefcase"></i>
                            <p>No portfolios found. Create your first portfolio to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort portfolios by broker name
        const sortedPortfolios = [...this.portfolios].sort((a, b) => {
            const brokerA = this.brokerManager.getBrokers().find(br => br.code === a.brokerCode);
            const brokerB = this.brokerManager.getBrokers().find(br => br.code === b.brokerCode);
            const brokerNameA = brokerA ? brokerA.name : '';
            const brokerNameB = brokerB ? brokerB.name : '';
            
            return brokerNameA.localeCompare(brokerNameB);
        });

        tableBody.innerHTML = sortedPortfolios.map(portfolio => {
            const broker = this.brokerManager.getBrokers().find(br => br.code === portfolio.brokerCode);
            const brokerName = broker ? broker.name : 'Unknown Broker';
            const productCount = portfolio.products ? portfolio.products.length : 0;
            
            return `
                <tr>
                    <td>${UIUtils.escapeHtml(brokerName)}</td>
                    <td>
                        <span class="badge bg-info">${productCount} products</span>
                    </td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-info btn-sm" onclick="viewPortfolioDetails('${portfolio.id}')" title="View Details">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-primary btn-sm" onclick="editPortfolio('${portfolio.id}')" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="confirmDeletePortfolio('${portfolio.id}')" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadPortfolioProducts() {
        const tableBody = document.getElementById('portfolio-products-table');
        if (!tableBody || !this.currentPortfolio) return;

        const portfolio = this.portfolios.find(p => p.id === this.currentPortfolio);
        if (!portfolio || !portfolio.products || portfolio.products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <div class="empty-state">
                            <i class="bi bi-box"></i>
                            <p>No products in this portfolio. Add products to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort products by the current sort configuration
        const sortedProducts = [...portfolio.products].sort((a, b) => {
            const productA = this.productManager.getProducts().find(p => p.code === a.productCode);
            const productB = this.productManager.getProducts().find(p => p.code === b.productCode);
            
            if (!productA || !productB) return 0;
            
            let valueA, valueB;
            
            switch (this.sortConfig.column) {
                case 'type':
                    valueA = this.productTypeManager.getTypeName(productA.typeCode);
                    valueB = this.productTypeManager.getTypeName(productB.typeCode);
                    break;
                case 'code':
                    valueA = productA.code;
                    valueB = productB.code;
                    break;
                case 'description':
                    valueA = productA.description;
                    valueB = productB.description;
                    break;
                case 'amount':
                    valueA = a.amount;
                    valueB = b.amount;
                    break;
                default:
                    // Default sorting by type then code
                    const typeA = this.productTypeManager.getTypeName(productA.typeCode);
                    const typeB = this.productTypeManager.getTypeName(productB.typeCode);
                    if (typeA !== typeB) {
                        return typeA.localeCompare(typeB);
                    }
                    return productA.code.localeCompare(productB.code);
            }
            
            // Handle numeric sorting for amount
            if (this.sortConfig.column === 'amount') {
                const result = valueA - valueB;
                return this.sortConfig.direction === 'asc' ? result : -result;
            }
            
            // Handle string sorting
            const result = valueA.localeCompare(valueB);
            return this.sortConfig.direction === 'asc' ? result : -result;
        });

        tableBody.innerHTML = sortedProducts.map(portfolioProduct => {
            const product = this.productManager.getProducts().find(p => p.code === portfolioProduct.productCode);
            if (!product) return '';
            
            const typeName = this.productTypeManager.getTypeName(product.typeCode);
            
            return `
                <tr>
                    <td>
                        <span class="badge bg-secondary">${UIUtils.escapeHtml(typeName)}</span>
                    </td>
                    <td><strong>${UIUtils.escapeHtml(product.code)}</strong></td>
                    <td>${UIUtils.escapeHtml(product.description)}</td>
                    <td class="text-end">${UIUtils.escapeHtml(portfolioProduct.amount.toLocaleString())}</td>
                    <td class="text-center">
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-primary btn-sm" onclick="editPortfolioProduct('${portfolioProduct.productCode}')" title="Edit Amount">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="confirmDeletePortfolioProduct('${portfolioProduct.productCode}')" title="Remove">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).filter(row => row !== '').join('');
    }

    openModal(portfolioId = null) {
        this.currentEditing = portfolioId;
        const modal = document.getElementById('portfolioModal');
        const title = document.getElementById('portfolioModalTitle');
        const brokerSelect = document.getElementById('portfolioBroker');

        // Load broker options
        this.loadBrokerOptions();

        if (portfolioId) {
            // Edit mode
            const portfolio = this.portfolios.find(p => p.id === portfolioId);
            title.textContent = 'Edit Portfolio';
            brokerSelect.value = portfolio.brokerCode;
        } else {
            // Add mode
            title.textContent = 'Add Portfolio';
            document.getElementById('portfolioForm').reset();
            this.loadBrokerOptions(); // Reload options after reset
        }

        brokerSelect.focus();
    }

    openViewModal(portfolioId) {
        this.currentPortfolio = portfolioId;
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        const broker = this.brokerManager.getBrokers().find(br => br.code === portfolio.brokerCode);
        
        document.getElementById('viewPortfolioTitle').textContent = `${portfolio.name} - ${broker ? broker.name : 'Unknown Broker'}`;
        this.loadPortfolioProducts();
        this.loadProductOptions();
    }

    openProductModal(productCode = null) {
        this.currentEditingProduct = productCode;
        const modal = document.getElementById('portfolioProductModal');
        const title = document.getElementById('portfolioProductModalTitle');
        const productSelect = document.getElementById('portfolioProductSelect');
        const amountInput = document.getElementById('portfolioProductAmount');

        // Load product options
        this.loadProductOptions();

        if (productCode) {
            // Edit mode
            const portfolio = this.portfolios.find(p => p.id === this.currentPortfolio);
            const portfolioProduct = portfolio.products.find(pp => pp.productCode === productCode);
            title.textContent = 'Edit Product Amount';
            productSelect.value = portfolioProduct.productCode;
            productSelect.disabled = true;
            amountInput.value = portfolioProduct.amount;
        } else {
            // Add mode
            title.textContent = 'Add Product to Portfolio';
            productSelect.disabled = false;
            document.getElementById('portfolioProductForm').reset();
            this.loadProductOptions(); // Reload options after reset
        }

        amountInput.focus();
    }

    edit(portfolioId) {
        this.openModal(portfolioId);
        const modal = new bootstrap.Modal(document.getElementById('portfolioModal'));
        modal.show();
    }

    view(portfolioId) {
        // Redirect to portfolio details page with portfolio ID as URL parameter
        window.location.href = `portfolio-details.html?id=${portfolioId}`;
    }

    editProduct(productCode) {
        this.openProductModal(productCode);
        const modal = new bootstrap.Modal(document.getElementById('portfolioProductModal'));
        modal.show();
    }

    save() {
        const brokerCode = document.getElementById('portfolioBroker').value.trim();

        if (!brokerCode) {
            UIUtils.showAlert('Please select a broker.', 'danger');
            return;
        }

        // Generate portfolio name from broker name
        const broker = this.brokerManager.getBrokers().find(b => b.code === brokerCode);
        const portfolioName = broker ? `${broker.name} Portfolio` : `Portfolio ${brokerCode}`;

        if (this.currentEditing) {
            // Edit existing portfolio
            const index = this.portfolios.findIndex(p => p.id === this.currentEditing);
            this.portfolios[index].name = portfolioName;
            this.portfolios[index].brokerCode = brokerCode;
            UIUtils.showAlert('Portfolio updated successfully!', 'success');
        } else {
            // Add new portfolio
            const newPortfolio = {
                id: Date.now().toString(),
                name: portfolioName,
                brokerCode: brokerCode,
                products: []
            };
            this.portfolios.push(newPortfolio);
            UIUtils.showAlert('Portfolio created successfully!', 'success');
        }

        this.storage.savePortfolios(this.portfolios);
        this.loadTable();
        this.loadUnifiedPortfolio(); // Refresh unified portfolio view
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('portfolioModal'));
        modal.hide();

        // Update dashboard if elements exist
        this.updateDashboard();
    }

    saveProduct() {
        const productCode = document.getElementById('portfolioProductSelect').value.trim();
        const amount = parseFloat(document.getElementById('portfolioProductAmount').value.trim());

        if (!productCode || isNaN(amount) || amount <= 0) {
            UIUtils.showAlert('Please select a product and enter a valid amount.', 'danger');
            return;
        }

        const portfolioIndex = this.portfolios.findIndex(p => p.id === this.currentPortfolio);
        const portfolio = this.portfolios[portfolioIndex];

        if (this.currentEditingProduct) {
            // Edit existing product
            const productIndex = portfolio.products.findIndex(pp => pp.productCode === this.currentEditingProduct);
            portfolio.products[productIndex].amount = amount;
            UIUtils.showAlert('Product amount updated successfully!', 'success');
        } else {
            // Check if product already exists in portfolio
            if (portfolio.products.some(pp => pp.productCode === productCode)) {
                UIUtils.showAlert('This product is already in the portfolio. Use edit to change the amount.', 'danger');
                return;
            }

            // Add new product
            portfolio.products.push({
                productCode: productCode,
                amount: amount
            });
            UIUtils.showAlert('Product added to portfolio successfully!', 'success');
        }

        this.storage.savePortfolios(this.portfolios);
        this.loadPortfolioProducts();
        this.loadTable(); // Refresh main table to update product counts
        this.loadUnifiedPortfolio(); // Refresh unified portfolio view
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('portfolioProductModal'));
        modal.hide();
    }

    confirmDelete(portfolioId) {
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        document.getElementById('confirmMessage').textContent = 
            `Are you sure you want to delete the portfolio "${portfolio.name}"? This will remove all associated products.`;
        
        document.getElementById('confirmButton').onclick = () => {
            this.delete(portfolioId);
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
        };

        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
    }

    confirmDeleteProduct(productCode) {
        const product = this.productManager.getProducts().find(p => p.code === productCode);
        document.getElementById('confirmMessage').textContent = 
            `Are you sure you want to remove "${product.description}" from this portfolio?`;
        
        document.getElementById('confirmButton').onclick = () => {
            this.deleteProduct(productCode);
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
        };

        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
    }

    delete(portfolioId) {
        this.portfolios = this.portfolios.filter(p => p.id !== portfolioId);
        this.storage.savePortfolios(this.portfolios);
        this.loadTable();
        this.loadUnifiedPortfolio(); // Refresh unified portfolio view
        UIUtils.showAlert('Portfolio deleted successfully!', 'success');
        this.updateDashboard();
    }

    deleteProduct(productCode) {
        const portfolioIndex = this.portfolios.findIndex(p => p.id === this.currentPortfolio);
        const portfolio = this.portfolios[portfolioIndex];
        portfolio.products = portfolio.products.filter(pp => pp.productCode !== productCode);
        
        this.storage.savePortfolios(this.portfolios);
        this.loadPortfolioProducts();
        this.loadTable(); // Refresh main table to update product counts
        this.loadUnifiedPortfolio(); // Refresh unified portfolio view
        UIUtils.showAlert('Product removed from portfolio successfully!', 'success');
    }

    loadBrokerOptions() {
        const select = document.getElementById('portfolioBroker');
        if (!select) return;

        const brokers = this.brokerManager.getBrokers();
        const sortedBrokers = [...brokers].sort((a, b) => a.name.localeCompare(b.name));
        
        select.innerHTML = '<option value="">Select a broker</option>' +
            sortedBrokers.map(broker => 
                `<option value="${UIUtils.escapeHtml(broker.code)}">${UIUtils.escapeHtml(broker.name)}</option>`
            ).join('');
    }

    loadProductOptions() {
        const select = document.getElementById('portfolioProductSelect');
        if (!select) return;

        const products = this.productManager.getProducts();
        
        // Group products by type and sort
        const productsByType = {};
        products.forEach(product => {
            const typeName = this.productTypeManager.getTypeName(product.typeCode);
            if (!productsByType[typeName]) {
                productsByType[typeName] = [];
            }
            productsByType[typeName].push(product);
        });

        // Sort types and products within each type
        const sortedTypes = Object.keys(productsByType).sort();
        
        let optionsHtml = '<option value="">Select a product</option>';
        sortedTypes.forEach(typeName => {
            const sortedProducts = productsByType[typeName].sort((a, b) => a.code.localeCompare(b.code));
            optionsHtml += `<optgroup label="${UIUtils.escapeHtml(typeName)}">`;
            sortedProducts.forEach(product => {
                optionsHtml += `<option value="${UIUtils.escapeHtml(product.code)}">${UIUtils.escapeHtml(product.code)} - ${UIUtils.escapeHtml(product.description)}</option>`;
            });
            optionsHtml += '</optgroup>';
        });
        
        select.innerHTML = optionsHtml;
    }

    updateDashboard() {
        const portfoliosCount = document.getElementById('portfolios-count');
        if (portfoliosCount) portfoliosCount.textContent = this.portfolios.length;
    }

    getPortfolios() {
        return this.portfolios;
    }

    updateSortIcons() {
        // Portfolios table doesn't currently have sortable headers
        // This method exists for compatibility with app.js
        return;
    }

    loadPortfolioFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const portfolioId = urlParams.get('id');
        
        if (!portfolioId) {
            // If no ID in URL, redirect to portfolios page
            window.location.href = 'portfolios.html';
            return;
        }

        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) {
            // If portfolio not found, redirect to portfolios page
            UIUtils.showAlert('Portfolio not found', 'danger');
            setTimeout(() => {
                window.location.href = 'portfolios.html';
            }, 2000);
            return;
        }

        // Set current portfolio and load details
        this.currentPortfolio = portfolioId;
        const broker = this.brokerManager.getBrokers().find(br => br.code === portfolio.brokerCode);
        
        // Update page title and breadcrumb
        document.getElementById('portfolio-title').textContent = `${broker ? broker.name : 'Unknown Broker'} Portfolio`;
        document.getElementById('portfolio-breadcrumb').textContent = `${broker ? broker.name : 'Unknown Broker'} Portfolio`;
        
        // Load products and product options
        this.loadPortfolioProducts();
        this.loadProductOptions();
        this.updateProductsSortIcons();
    }

    sortProductsByColumn(column) {
        // Toggle sort direction if clicking the same column
        if (this.sortConfig.column === column) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.column = column;
            this.sortConfig.direction = 'asc';
        }

        this.loadPortfolioProducts();
        this.updateProductsSortIcons();
    }

    updateProductsSortIcons() {
        // Clear all sort icons
        const sortIcons = document.querySelectorAll('#portfolio-products-table-header .sort-icon');
        if (sortIcons.length === 0) return; // Exit if no portfolio products table on current page
        
        sortIcons.forEach(icon => {
            icon.className = 'sort-icon bi bi-arrow-down-up';
        });

        // Set active sort icon using data-column attribute
        const activeHeader = document.querySelector(`#portfolio-products-table-header [data-column="${this.sortConfig.column}"] .sort-icon`);
        if (activeHeader) {
            activeHeader.className = `sort-icon bi bi-arrow-${this.sortConfig.direction === 'asc' ? 'up' : 'down'}`;
        }
    }

    // Unified Portfolio Methods
    getUnifiedPortfolio() {
        const productMap = new Map();
        const products = this.productManager.getProducts();
        const productTypes = this.productTypeManager.getProductTypes();
        const brokers = this.brokerManager.getBrokers();

        // Iterate through all portfolios and their products
        this.portfolios.forEach(portfolio => {
            const broker = brokers.find(br => br.code === portfolio.brokerCode);
            const brokerName = broker ? broker.name : 'Unknown Broker';
            
            if (portfolio.products) {
                portfolio.products.forEach(portfolioProduct => {
                    const product = products.find(p => p.code === portfolioProduct.productCode);
                    if (product) {
                        const productType = productTypes.find(pt => pt.code === product.typeCode);
                        const key = product.code;
                        
                        if (productMap.has(key)) {
                            // Add to existing product
                            const existing = productMap.get(key);
                            existing.totalAmount += portfolioProduct.amount;
                            existing.portfolios.push(brokerName);
                        } else {
                            // Create new unified product entry
                            productMap.set(key, {
                                code: product.code,
                                description: product.description,
                                type: productType ? productType.name : 'Unknown Type',
                                typeCode: product.typeCode,
                                totalAmount: portfolioProduct.amount,
                                portfolios: [brokerName]
                            });
                        }
                    }
                });
            }
        });

        return Array.from(productMap.values());
    }

    loadUnifiedPortfolio() {
        const tableBody = document.getElementById('unified-portfolio-table');
        const emptyState = document.getElementById('unified-portfolio-empty');
        
        if (!tableBody) return; // Exit if table doesn't exist on current page
        
        const unifiedProducts = this.getUnifiedPortfolio();
        
        if (unifiedProducts.length === 0) {
            tableBody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Sort unified products
        const sortedProducts = SortUtils.sortByColumn(
            [...unifiedProducts], 
            this.unifiedSortConfig?.column || 'type', 
            this.unifiedSortConfig?.direction || 'asc'
        );

        tableBody.innerHTML = sortedProducts.map(product => {
            const uniquePortfolios = [...new Set(product.portfolios)];
            const portfoliosBadges = uniquePortfolios.map(portfolioName => 
                `<span class="badge bg-secondary me-1">${UIUtils.escapeHtml(portfolioName)}</span>`
            ).join('');

            return `
                <tr>
                    <td><span class="badge bg-secondary">${UIUtils.escapeHtml(product.type)}</span></td>
                    <td><strong>${UIUtils.escapeHtml(product.code)}</strong></td>
                    <td>${UIUtils.escapeHtml(product.description)}</td>
                    <td class="text-end">${product.totalAmount.toLocaleString()}</td>
                    <td>${portfoliosBadges}</td>
                </tr>
            `;
        }).join('');
    }

    sortUnifiedPortfolioByColumn(column) {
        // Initialize unified sort config if not exists
        if (!this.unifiedSortConfig) {
            this.unifiedSortConfig = { column: 'type', direction: 'asc' };
        }

        // Toggle sort direction if clicking the same column
        if (this.unifiedSortConfig.column === column) {
            this.unifiedSortConfig.direction = this.unifiedSortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.unifiedSortConfig.column = column;
            this.unifiedSortConfig.direction = 'asc';
        }

        this.loadUnifiedPortfolio();
        this.updateUnifiedPortfolioSortIcons();
    }

    updateUnifiedPortfolioSortIcons() {
        // Clear all sort icons
        const sortIcons = document.querySelectorAll('#unified-portfolio-table-header .sort-icon');
        if (sortIcons.length === 0) return; // Exit if no unified portfolio table on current page
        
        sortIcons.forEach(icon => {
            icon.className = 'sort-icon bi bi-arrow-down-up';
        });

        // Set active sort icon using data-column attribute
        const config = this.unifiedSortConfig || { column: 'type', direction: 'asc' };
        const activeHeader = document.querySelector(`#unified-portfolio-table-header [data-column="${config.column}"] .sort-icon`);
        if (activeHeader) {
            activeHeader.className = `sort-icon bi bi-arrow-${config.direction === 'asc' ? 'up' : 'down'}`;
        }
    }
}
