// Storage Module - Handles localStorage operations
export class StorageManager {
    constructor() {
        this.keys = {
            brokers: 'portfolioManager_brokers',
            products: 'portfolioManager_products',
            productTypes: 'portfolioManager_productTypes',
            portfolios: 'portfolioManager_portfolios'
        };
    }

    // Broker storage
    loadBrokers() {
        const stored = localStorage.getItem(this.keys.brokers);
        return stored ? JSON.parse(stored) : [];
    }

    saveBrokers(brokers) {
        localStorage.setItem(this.keys.brokers, JSON.stringify(brokers));
    }

    // Product storage
    loadProducts() {
        const stored = localStorage.getItem(this.keys.products);
        return stored ? JSON.parse(stored) : [];
    }

    saveProducts(products) {
        localStorage.setItem(this.keys.products, JSON.stringify(products));
    }

    // Product Type storage
    loadProductTypes() {
        const stored = localStorage.getItem(this.keys.productTypes);
        return stored ? JSON.parse(stored) : [];
    }

    saveProductTypes(productTypes) {
        localStorage.setItem(this.keys.productTypes, JSON.stringify(productTypes));
    }

    // Portfolio storage
    loadPortfolios() {
        const stored = localStorage.getItem(this.keys.portfolios);
        return stored ? JSON.parse(stored) : [];
    }

    savePortfolios(portfolios) {
        localStorage.setItem(this.keys.portfolios, JSON.stringify(portfolios));
    }

    // Clear all data
    clearAll() {
        localStorage.removeItem(this.keys.brokers);
        localStorage.removeItem(this.keys.products);
        localStorage.removeItem(this.keys.productTypes);
        localStorage.removeItem(this.keys.portfolios);
    }

    // Export all data to JSON
    exportAllData() {
        const data = {
            brokers: this.loadBrokers(),
            products: this.loadProducts(),
            productTypes: this.loadProductTypes(),
            portfolios: this.loadPortfolios(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    // Import all data from JSON
    importAllData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.brokers || !data.products || !data.productTypes || !data.portfolios) {
                throw new Error('Invalid data format: missing required sections');
            }

            // Validate data arrays
            if (!Array.isArray(data.brokers) || !Array.isArray(data.products) || 
                !Array.isArray(data.productTypes) || !Array.isArray(data.portfolios)) {
                throw new Error('Invalid data format: sections must be arrays');
            }

            // Save the imported data
            this.saveBrokers(data.brokers);
            this.saveProducts(data.products);
            this.saveProductTypes(data.productTypes);
            this.savePortfolios(data.portfolios);

            return {
                success: true,
                message: 'Data imported successfully',
                counts: {
                    brokers: data.brokers.length,
                    products: data.products.length,
                    productTypes: data.productTypes.length,
                    portfolios: data.portfolios.length
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to import data'
            };
        }
    }

    // Download JSON file
    downloadJSON(filename = null) {
        if (!filename) {
            const today = new Date();
            const dateStr = today.getFullYear().toString() + 
                          (today.getMonth() + 1).toString().padStart(2, '0') + 
                          today.getDate().toString().padStart(2, '0');
            filename = `${dateStr}-portfolio-data-backup.json`;
        }
        const data = this.exportAllData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
