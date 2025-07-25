// Sample Data Module
export class SampleData {
    static getBrokers() {
        return [
            { code: 'RIG', name: 'Rig Valores' },
            { code: 'IOL', name: 'Invertir OnLine' },
            { code: 'VETA', name: 'Veta Capital' },
            { code: 'PPI', name: 'Portfolio Personal Inversiones' },
            { code: 'BLZ', name: 'Balanz Capital' },
            { code: 'HSBC', name: 'HSBC' },
            { code: 'MP', name: 'MercadoPago' }
        ];
    }

    static getProductTypes() {
        return [
            { code: 'ACC', name: 'ACCION' },
            { code: 'BON', name: 'BONO_NACIONAL' },
            { code: 'BOP', name: 'BONO_PROVINCIAL' },
            { code: 'CED', name: 'CEDEAR' },
            { code: 'CP', name: 'CUOTAPARTE' },
            { code: 'ETF', name: 'ETF' },
            { code: 'LEB', name: 'LEBAC' },
            { code: 'LET', name: 'LETE' },
            { code: 'LTR', name: 'LETRA' },
            { code: 'MON', name: 'MONEDA' },
            { code: 'ON', name: 'OBLIGACION_NEGOCIABLE' },
            { code: 'OTR', name: 'OTRO' }
        ];
    }

    static getProducts() {
        return [
            { code: 'ARS', description: 'Peso', type: 'MON' },
            { code: 'USD', description: 'Dólar', type: 'MON' },
            { code: 'USD-D', description: 'Dólar divisa', type: 'MON' }
        ];
    }

    static getPortfolios() {
        return [
            {
                id: '1',
                brokerCode: 'IOL',
                products: [
                    { productCode: 'ARS', amount: 50000 },
                    { productCode: 'USD', amount: 1000 }
                ]
            },
            {
                id: '2',
                brokerCode: 'PPI',
                products: [
                    { productCode: 'USD-D', amount: 2500 },
                    { productCode: 'ARS', amount: 100000 }
                ]
            },
            {
                id: '3',
                brokerCode: 'RIG',
                products: [
                    { productCode: 'USD', amount: 500 },
                    { productCode: 'ARS', amount: 25000 }
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
