# LocalPortfolioManager

A simple web application for managing brokers, products, and product types in a portfolio management system. Built with pure HTML, CSS (Bootstrap), and JavaScript with a modular page structure.

## Features

### Dashboard

- Overview of total brokers, products, and product types
- Quick navigation to management sections
- Real-time count updates

### Broker Management (CRUD)

- **Create**: Add new brokers with code and name
- **Read**: View all brokers in a sortable table
- **Update**: Edit existing broker information
- **Delete**: Remove brokers with confirmation
- **Sort**: Click column headers to sort by code or name

### Product Management (CRUD)

- **Create**: Add new products with code, description, and type
- **Read**: View all products in a sortable table
- **Update**: Edit existing product information
- **Delete**: Remove products with confirmation
- **Sort**: Click column headers to sort by code, description, or type

### Product Type Management (CRUD)

- **Create**: Add new product types with code and name
- **Read**: View all product types in a sortable table
- **Update**: Edit existing product type information
- **Delete**: Remove product types with confirmation (prevents deletion if in use)
- **Sort**: Click column headers to sort by code or name

### Portfolio Management (CRUD)

- **Create**: Add new portfolios assigned to brokers
- **Read**: View all portfolios with product counts
- **Update**: Edit portfolio details and manage products
- **Delete**: Remove portfolios with confirmation
- **Product Management**: Add, edit, and remove products from portfolios with amounts
- **Unified Portfolio**: View consolidated products across all portfolios

### Additional Features

- **Data Import/Export**: Backup and restore all data via JSON files with date-stamped filenames
- **Floating Alerts**: User-friendly notifications for all actions
- **Responsive Design**: Works on desktop and mobile devices
- **Input Validation**: Prevents duplicate codes and missing fields
- **Sample Data**: Includes Argentine financial market examples
- **Unified Portfolio View**: Consolidated view of all products across portfolios

## Data Model

### Broker

- `code`: Unique identifier for the broker (e.g., "IOL", "RIG")
- `name`: Display name of the broker (e.g., "Invertir OnLine")

### Product Type

- `code`: Unique identifier for the product type (e.g., "MON", "ACC")
- `name`: Display name of the product type (e.g., "MONEDA", "ACCION")

### Product

- `code`: Unique identifier for the product (e.g., "USD", "AAPL")
- `description`: Description of the product (e.g., "Dólar", "Apple Inc.")
- `type`: Reference to product type code

### Portfolio

- `id`: Unique identifier for the portfolio
- `brokerCode`: Reference to the broker managing this portfolio
- `products`: Array of portfolio products with amounts

### Portfolio Product

- `productCode`: Reference to the product
- `amount`: Quantity or value of the product in the portfolio

## Technology Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5.3.0
- **JavaScript**: ES6+ Modules with modern import/export syntax
- **Icons**: Bootstrap Icons
- **Storage**: Browser localStorage for data persistence
- **Architecture**: Modular design with separation of concerns

## Modular Architecture

The application now uses ES6 modules for better organization and maintainability:

- **`storage.js`**: Handles all localStorage operations
- **`ui-utils.js`**: UI utilities, alerts, and dashboard updates
- **`sort-utils.js`**: Reusable sorting functionality for all tables
- **`broker-manager.js`**: Complete broker CRUD operations
- **`product-manager.js`**: Complete product CRUD operations
- **`product-type-manager.js`**: Complete product type CRUD operations
- **`portfolio-manager.js`**: Complete portfolio CRUD operations and unified portfolio view
- **`sample-data.js`**: Sample data generation for demonstration
- **`app.js`**: Main application orchestrator and initialization

## Getting Started

1. Clone or download the project files
2. Open `dashboard.html` in a web browser (or `index.html` which redirects)
3. Navigate between different sections using the top navigation
4. Start managing your brokers, products, and product types!

## File Structure

```text
portafolio/
├── dashboard.html          # Main dashboard page
├── brokers.html           # Brokers management page
├── products.html          # Products management page
├── product-types.html     # Product types management page
├── portfolios.html        # Portfolios management page
├── portfolio-details.html # Individual portfolio details page
├── index.html             # Redirects to dashboard
├── styles.css             # Custom styles and floating alerts
├── favicon.png            # Application favicon
├── debug.html             # Debug page for development
├── data/                  # Sample data files
│   └── sample-backup.json # Sample backup file for testing import functionality
├── js/                    # Modular JavaScript files
│   ├── app.js             # Main application module
│   ├── storage.js         # localStorage management
│   ├── ui-utils.js        # UI utilities and alerts
│   ├── sort-utils.js      # Sorting functionality
│   ├── broker-manager.js  # Broker CRUD operations
│   ├── product-manager.js # Product CRUD operations
│   ├── product-type-manager.js # Product type CRUD operations
│   ├── portfolio-manager.js # Portfolio CRUD operations
│   └── sample-data.js     # Sample data for demonstration
└── README.md              # This file
```

## Page Structure

The application uses separate HTML files for each section:

- **Dashboard** (`dashboard.html`): Overview and navigation hub with import/export functionality
- **Brokers** (`brokers.html`): Complete broker CRUD operations
- **Products** (`products.html`): Complete product CRUD operations with filtering
- **Product Types** (`product-types.html`): Complete product type CRUD operations
- **Portfolios** (`portfolios.html`): Portfolio management with unified portfolio view
- **Portfolio Details** (`portfolio-details.html`): Individual portfolio product management

Each page includes:

- Navigation bar with active page highlighting
- All necessary modals and forms for that section
- Shared JavaScript functionality via modular ES6 imports

## Sample Data

The application includes sample data relevant to the Argentine financial market:

**Brokers**: IOL, RIG, Veta Capital, PPI, Balanz, HSBC, MercadoPago
**Product Types**: MONEDA, ACCION, BONO_NACIONAL, CEDEAR, ETF, etc.
**Products**: ARS (Peso), USD (Dólar), USD-D (Dólar divisa)
**Portfolios**: Sample portfolios with products and amounts

## Features Details

### User Interface

- Modern, clean design with Bootstrap components
- Responsive layout that works on all screen sizes
- Modal dialogs for creating and editing records
- Confirmation dialogs for delete operations
- Toast notifications for user feedback

### Data Management

- Client-side storage using localStorage
- Data persistence across browser sessions
- Input validation and duplicate prevention
- Safe HTML rendering to prevent XSS

### User Experience

- Smooth animations and transitions
- Loading states and feedback messages
- Empty state handling with helpful messages
- Keyboard navigation support
- Mobile-friendly design

## Browser Compatibility

This application works in all modern browsers that support:

- ES6+ JavaScript features
- localStorage API
- CSS Grid and Flexbox
- Bootstrap 5 requirements

## Development

The application is built with vanilla technologies for simplicity and doesn't require any build process or dependencies. However, due to ES6 module imports, the application needs to be served over HTTP/HTTPS rather than opened directly as files.

### Running the Application

You have several options to run the application:

#### Option 1: Simple HTTP Server (Recommended)

If you have Python installed:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

If you have Node.js installed:

```bash
# Install a simple server globally
npm install -g http-server

# Run the server
http-server
```

Then open `http://localhost:8000` in your browser.

#### Option 2: Browser with Disabled Security (Not Recommended for Regular Use)

Start Chrome with disabled web security (Windows):

```bash
chrome.exe --user-data-dir="C:/Chrome dev" --disable-web-security
```

#### Option 3: Use a Code Editor with Live Server

- **VS Code**: Install the "Live Server" extension
- **Other editors**: Many have similar live server plugins

#### Option 4: Use Online Hosting

Upload the files to any web hosting service or use services like:

- GitHub Pages
- Netlify
- Vercel

### CORS Error Solution

If you see a CORS error like "origin 'null' has been blocked by CORS policy", it means you're opening the HTML file directly in the browser. Use one of the server options above to resolve this issue.

### Loading Sample Data

You can load sample data by:

1. Uncommenting the sample data line in `js/app.js` and refreshing the page
2. Importing the sample backup file `data/sample-backup.json` via the dashboard import feature

To enable automatic sample data loading on first visit, edit `js/app.js` and uncomment this line:

```javascript
// setTimeout(addSampleData, 1000);
```

Alternatively, you can call the `addSampleData()` function manually from the browser console.

## Future Enhancements

Potential improvements for future versions:

- Advanced search and filtering capabilities
- Data validation with custom business rules
- Bulk operations for mass data management
- Print/PDF generation for reports
- Integration with external financial APIs
- User authentication and multi-user support
- Real-time data synchronization
- Portfolio performance analytics

## License

This project is open source and available under the MIT License.
