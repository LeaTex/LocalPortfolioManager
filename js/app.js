// Main Application Module
import { StorageManager } from './storage.js';
import { UIUtils } from './ui-utils.js';
import { BrokerManager } from './broker-manager.js';
import { ProductManager } from './product-manager.js';
import { ProductTypeManager } from './product-type-manager.js';
import { PortfolioManager } from './portfolio-manager.js';
import { SampleData } from './sample-data.js';

class LocalPortfolioManager {
    constructor() {
        this.storage = new StorageManager();
        this.productTypeManager = new ProductTypeManager(this.storage);
        this.brokerManager = new BrokerManager(this.storage);
        this.productManager = new ProductManager(this.storage, this.productTypeManager);
        this.portfolioManager = new PortfolioManager(
            this.storage, 
            this.brokerManager, 
            this.productManager, 
            this.productTypeManager
        );
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submissions - only attach if elements exist
        const brokerForm = document.getElementById('brokerForm');
        if (brokerForm) {
            brokerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.brokerManager.save();
            });
        }

        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.productManager.save();
            });
        }

        const productTypeForm = document.getElementById('productTypeForm');
        if (productTypeForm) {
            productTypeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.productTypeManager.save();
            });
        }

        const portfolioForm = document.getElementById('portfolioForm');
        if (portfolioForm) {
            portfolioForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.portfolioManager.save();
            });
        }

        const portfolioProductForm = document.getElementById('portfolioProductForm');
        if (portfolioProductForm) {
            portfolioProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.portfolioManager.saveProduct();
            });
        }
    }

    // Public methods for global access
    getBrokerManager() {
        return this.brokerManager;
    }

    getProductManager() {
        return this.productManager;
    }

    getProductTypeManager() {
        return this.productTypeManager;
    }

    getPortfolioManager() {
        return this.portfolioManager;
    }

    updateDashboard() {
        const brokersCount = document.getElementById('brokers-count');
        const productsCount = document.getElementById('products-count');
        const productTypesCount = document.getElementById('product-types-count');
        const portfoliosCount = document.getElementById('portfolios-count');

        if (brokersCount) brokersCount.textContent = this.brokerManager.getBrokers().length;
        if (productsCount) productsCount.textContent = this.productManager.getProducts().length;
        if (productTypesCount) productTypesCount.textContent = this.productTypeManager.getProductTypes().length;
        if (portfoliosCount) portfoliosCount.textContent = this.portfolioManager.getPortfolios().length;
    }

    // Export data functionality
    exportData() {
        try {
            this.storage.downloadJSON();
            UIUtils.showAlert('Data exported successfully!', 'success');
        } catch (error) {
            UIUtils.showAlert('Failed to export data: ' + error.message, 'danger');
        }
    }

    // Import data functionality
    importData() {
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.click();
        } else {
            alert('Import file element not found');
        }
    }

    // Handle file import
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = e.target.result;
                const data = JSON.parse(jsonData);
                
                // Show preview in modal
                const importCounts = document.getElementById('importCounts');
                const importPreview = document.getElementById('importPreview');
                
                if (importCounts && importPreview) {
                    importCounts.innerHTML = `
                        <li><i class="bi bi-building text-primary"></i> Brokers: ${data.brokers?.length || 0}</li>
                        <li><i class="bi bi-box text-success"></i> Products: ${data.products?.length || 0}</li>
                        <li><i class="bi bi-tags text-warning"></i> Product Types: ${data.productTypes?.length || 0}</li>
                        <li><i class="bi bi-briefcase-fill text-info"></i> Portfolios: ${data.portfolios?.length || 0}</li>
                        ${data.exportDate ? `<li><i class="bi bi-calendar text-muted"></i> Export Date: ${new Date(data.exportDate).toLocaleDateString()}</li>` : ''}
                    `;
                    importPreview.style.display = 'block';
                }

                // Store the data for confirmation
                this.pendingImportData = jsonData;
                
                // Show confirmation modal
                const importModal = new bootstrap.Modal(document.getElementById('importModal'));
                importModal.show();
                
            } catch (error) {
                console.error('Error parsing JSON:', error);
                UIUtils.showAlert('Invalid JSON file: ' + error.message, 'danger');
            }
        };
        
        reader.readAsText(file);
        
        // Reset the file input
        event.target.value = '';
    }

    // Confirm import
    confirmImport() {
        if (!this.pendingImportData) return;

        const result = this.storage.importAllData(this.pendingImportData);
        
        if (result.success) {
            UIUtils.showAlert(
                `Data imported successfully! ${result.counts.brokers} brokers, ${result.counts.products} products, ${result.counts.productTypes} product types, and ${result.counts.portfolios} portfolios loaded.`,
                'success'
            );
            
            // Refresh all managers
            this.brokerManager = new BrokerManager(this.storage);
            this.productManager = new ProductManager(this.storage, this.productTypeManager);
            this.portfolioManager = new PortfolioManager(
                this.storage, 
                this.brokerManager, 
                this.productManager, 
                this.productTypeManager
            );
            
            // Update dashboard
            this.updateDashboard();
            
            // Refresh current page data if needed
            if (document.getElementById('portfolios-table')) {
                this.portfolioManager.loadTable();
                this.portfolioManager.loadUnifiedPortfolio();
                this.portfolioManager.updateUnifiedPortfolioSortIcons();
            }
            
            // Hide modal
            const importModal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
            if (importModal) importModal.hide();
            
        } else {
            UIUtils.showAlert('Import failed: ' + result.message, 'danger');
        }
        
        this.pendingImportData = null;
    }
}

// Global variables for backward compatibility
let portfolioManagerApp;
let brokerManager;
let productManager;
let productTypeManager;
let portfolioManager;

// Global functions for HTML onclick handlers
window.openBrokerModal = () => brokerManager.openModal();
window.saveBroker = () => brokerManager.save();
window.editBroker = (code) => brokerManager.edit(code);
window.confirmDeleteBroker = (code) => brokerManager.confirmDelete(code);
window.sortBrokersByColumn = (column) => brokerManager.sortByColumn(column);

window.openProductModal = () => productManager.openModal();
window.saveProduct = () => productManager.save();
window.editProduct = (code) => productManager.edit(code);
window.confirmDeleteProduct = (code) => productManager.confirmDelete(code);
window.sortProductsByColumn = (column) => productManager.sortByColumn(column);
window.applyProductFilters = () => productManager.applyFilters();
window.clearProductFilters = () => productManager.clearFilters();

window.openProductTypeModal = () => productTypeManager.openModal();
window.saveProductType = () => productTypeManager.save();
window.editProductType = (code) => productTypeManager.edit(code);
window.confirmDeleteProductType = (code) => productTypeManager.confirmDelete(code);
window.sortProductTypesByColumn = (column) => productTypeManager.sortByColumn(column);

window.openPortfolioModal = () => portfolioManager.openModal();
window.savePortfolio = () => portfolioManager.save();
window.editPortfolio = (id) => portfolioManager.edit(id);
window.confirmDeletePortfolio = (id) => portfolioManager.confirmDelete(id);
window.sortPortfoliosByColumn = (column) => portfolioManager.sortByColumn(column);
window.viewPortfolioDetails = (id) => portfolioManager.view(id);
window.openPortfolioProductModal = (portfolioId) => portfolioManager.openProductModal(portfolioId);
window.savePortfolioProduct = () => portfolioManager.saveProduct();
window.editPortfolioProduct = (portfolioId, productCode) => portfolioManager.editProduct(portfolioId, productCode);
window.confirmDeletePortfolioProduct = (portfolioId, productCode) => portfolioManager.confirmDeleteProduct(portfolioId, productCode);
window.sortPortfolioProductsByColumn = (column) => portfolioManager.sortProductsByColumn(column);
window.sortUnifiedPortfolioByColumn = (column) => portfolioManager.sortUnifiedPortfolioByColumn(column);

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    portfolioManagerApp = new LocalPortfolioManager();
    
    // Make app available globally
    window.portfolioManagerApp = portfolioManagerApp;
    
    // Set global manager references
    brokerManager = portfolioManagerApp.getBrokerManager();
    productManager = portfolioManagerApp.getProductManager();
    productTypeManager = portfolioManagerApp.getProductTypeManager();
    portfolioManager = portfolioManagerApp.getPortfolioManager();
    
    // Initialize specific page data based on what elements exist
    setTimeout(() => {
        if (document.getElementById('brokers-table')) {
            brokerManager.loadTable();
            brokerManager.updateSortIcons();
        }
        if (document.getElementById('products-table')) {
            productManager.loadTable();
            productManager.updateSortIcons();
            productManager.loadFilterOptions();
            productManager.setupFilterListeners();
        }
        if (document.getElementById('product-types-table')) {
            productTypeManager.loadTable();
            productTypeManager.updateSortIcons();
        }
        if (document.getElementById('portfolios-table')) {
            portfolioManager.loadTable();
            portfolioManager.updateSortIcons();
            // Also load unified portfolio if on portfolios page
            portfolioManager.loadUnifiedPortfolio();
            portfolioManager.updateUnifiedPortfolioSortIcons();
        }
        if (document.getElementById('portfolio-details')) {
            portfolioManager.loadPortfolioFromUrl();
        }
        if (document.getElementById('brokers-count') || 
            document.getElementById('products-count') || 
            document.getElementById('product-types-count') ||
            document.getElementById('portfolios-count')) {
            portfolioManagerApp.updateDashboard();
        }
    }, 100);
});

// Load sample data (optional)
function addSampleData() {
    if (portfolioManagerApp) {
        SampleData.loadSampleData(
            portfolioManagerApp.getBrokerManager(),
            portfolioManagerApp.getProductManager(),
            portfolioManagerApp.getProductTypeManager(),
            portfolioManagerApp.getPortfolioManager()
        );
        
        // Update dashboard after loading sample data
        portfolioManagerApp.updateDashboard();
    }
}

// Uncomment the line below to add sample data on first load
// setTimeout(addSampleData, 1000);

// Global functions for HTML onclick handlers
window.exportData = function() {
    const app = window.portfolioManagerApp || portfolioManagerApp;
    if (app) {
        app.exportData();
    } else {
        alert('Application not initialized yet. Please wait a moment and try again.');
    }
};

window.importData = function() {
    const app = window.portfolioManagerApp || portfolioManagerApp;
    if (app) {
        app.importData();
    } else {
        alert('Application not initialized yet. Please wait a moment and try again.');
    }
};

window.handleFileImport = function(event) {
    const app = window.portfolioManagerApp || portfolioManagerApp;
    if (app) {
        app.handleFileImport(event);
    } else {
        alert('Application not initialized yet. Please wait a moment and try again.');
    }
};

// Setup import modal confirmation handler
document.addEventListener('DOMContentLoaded', () => {
    const confirmImportBtn = document.getElementById('confirmImport');
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            const app = window.portfolioManagerApp || portfolioManagerApp;
            if (app) {
                app.confirmImport();
            } else {
                alert('Application not initialized yet. Please wait a moment and try again.');
            }
        });
    }
});
