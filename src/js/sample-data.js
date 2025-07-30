// Sample Data Module
export class SampleData {
    static getBrokers() {
        return [
            { code: 'IBK', name: 'Interactive Brokers' },
            { code: 'ETR', name: 'eToro' },
            { code: 'HPI', name: 'Hapi' }
        ];
    }

    static getProductTypes() {
        return [
            { code: 'ACC', name: 'ACCION' },
            { code: 'BON', name: 'BONO' },
            { code: 'CED', name: 'CEDEAR' },
            { code: 'ETF', name: 'ETF' },
            { code: 'LTR', name: 'LETRA' },
            { code: 'MON', name: 'MONEDA' },
            { code: 'ON', name: 'OBLIGACION_NEGOCIABLE' },
            { code: 'OTR', name: 'OTRO' }
        ];
    }

    static getProducts() {
        return [
            { code: 'USD', description: 'Dólar', typeCode: 'MON' },
            { code: 'APPL', description: 'Apple Inc.', typeCode: 'ACC' },
            { code: 'TSL', description: 'Tesla', typeCode: 'ACC' },
            { code: 'MSFT', description: 'Microsoft Corporation', typeCode: 'ACC' },
            { code: 'GOOGL', description: 'Alphabet Inc.', typeCode: 'ACC' },
            { code: 'AMZN', description: 'Amazon.com Inc.', typeCode: 'ACC' }
        ];
    }

    static getPortfolios() {
        return [
            {
                id: '1',
                brokerCode: 'IBK',
                products: [
                    { productCode: 'USD', amount: 1200 },
                    { productCode: 'APPL', amount: 5000 },
                    { productCode: 'AMZN', amount: 3500 }
                ]
            },
            {
                id: '2',
                brokerCode: 'ETR',
                products: [
                    { productCode: 'USD', amount: 10000 },
                    { productCode: 'TSL', amount: 2000 },
                    { productCode: 'MSFT', amount: 3000 }
                ]
            }
        ];
    }

    static loadSampleData(brokerManager, productManager, productTypeManager, portfolioManager) {
        // Only add sample data if no data exists
        if (brokerManager.getBrokers().length === 0) {
            brokerManager.brokers = SampleData.getBrokers();
            brokerManager.storage.saveBrokers(brokerManager.brokers);
            brokerManager.loadTable();
        }

        if (productTypeManager.getProductTypes().length === 0) {
            productTypeManager.productTypes = SampleData.getProductTypes();
            productTypeManager.storage.saveProductTypes(productTypeManager.productTypes);
            productTypeManager.loadTable();
        }

        if (productManager.getProducts().length === 0) {
            productManager.products = SampleData.getProducts();
            productManager.storage.saveProducts(productManager.products);
            productManager.loadTable();
        }

        if (portfolioManager && portfolioManager.getPortfolios().length === 0) {
            portfolioManager.portfolios = SampleData.getPortfolios();
            portfolioManager.storage.savePortfolios(portfolioManager.portfolios);
            portfolioManager.loadTable();
            portfolioManager.loadUnifiedPortfolio();
        }
    }
}
