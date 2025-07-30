// UI Utils Module - Handles UI utilities and alerts
export class UIUtils {
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.floating-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create floating alert container
        const alertContainer = document.createElement('div');
        alertContainer.className = 'floating-alert-container';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `floating-alert alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${UIUtils.getAlertIcon(type)} me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        `;

        alertContainer.appendChild(alertDiv);
        document.body.appendChild(alertContainer);

        // Trigger animation
        setTimeout(() => {
            alertDiv.classList.add('show-alert');
        }, 10);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (alertContainer && alertContainer.parentNode) {
                alertDiv.classList.remove('show-alert');
                setTimeout(() => {
                    alertContainer.remove();
                }, 300);
            }
        }, 3000);
    }

    static getAlertIcon(type) {
        const icons = {
            'success': 'bi-check-circle-fill',
            'danger': 'bi-exclamation-triangle-fill',
            'warning': 'bi-exclamation-circle-fill',
            'info': 'bi-info-circle-fill'
        };
        return icons[type] || 'bi-info-circle-fill';
    }

    static updateDashboard(brokers, products, productTypes, portfolios) {
        const brokersCount = document.getElementById('brokers-count');
        const productsCount = document.getElementById('products-count');
        const productTypesCount = document.getElementById('product-types-count');
        const portfoliosCount = document.getElementById('portfolios-count');
        
        if (brokersCount) brokersCount.textContent = brokers.length;
        if (productsCount) productsCount.textContent = products.length;
        if (productTypesCount) productTypesCount.textContent = productTypes.length;
        if (portfoliosCount) portfoliosCount.textContent = portfolios ? portfolios.length : 0;
    }
}
