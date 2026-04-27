/* global React, ReactDOM, Sidebar, TopBar, Dashboard, ProductsList, ProductDetail, AddProduct, Calendar, Analytics, Earnings, Settings, Prompts, Links, Icon */
const { useState, useEffect } = React;

const App = () => {
  // Parse hash: #routeName::theme (used for embedding in design canvas)
  const parseHash = () => {
    const h = (window.location.hash || '').slice(1);
    const [name, theme] = h.split('::');
    return { name: name || 'dashboard', theme: theme || 'light' };
  };
  const initial = parseHash();
  const [theme, setTheme] = useState(initial.theme);
  const [route, setRoute] = useState({ name: initial.name });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // If embedded in design canvas via hash, auto-open product when name === 'product'
    if (initial.name === 'product') {
      setRoute({ name: 'product', product: window.ALFI_DATA.PRODUCTS[0] });
    }
  }, []);

  const nav = (name) => setRoute({ name });
  const goProduct = (product) => setRoute({ name: 'product', product });

  let title = 'Dashboard';
  let crumbs = ['alfi', 'Dashboard'];
  let body;
  switch (route.name) {
    case 'dashboard':
      body = <Dashboard onProduct={goProduct} onNav={nav}/>;
      crumbs = ['alfi', 'Dashboard'];
      break;
    case 'products':
      body = <ProductsList onProduct={goProduct} onNav={nav}/>;
      crumbs = ['alfi', 'Products'];
      break;
    case 'product':
      body = <ProductDetail product={route.product} onBack={() => nav('products')}/>;
      crumbs = ['alfi', 'Products', route.product?.id];
      break;
    case 'add':
      body = <AddProduct onBack={() => nav('products')} onProduct={goProduct}/>;
      crumbs = ['alfi', 'Products', 'New'];
      break;
    case 'calendar':
      body = <Calendar/>;
      crumbs = ['alfi', 'Calendar'];
      break;
    case 'analytics':
      body = <Analytics/>;
      crumbs = ['alfi', 'Analytics'];
      break;
    case 'earnings':
    case 'inbox':
      body = <Earnings/>;
      crumbs = ['alfi', 'Earnings'];
      break;
    case 'settings':
      body = <Settings/>;
      crumbs = ['alfi', 'Settings'];
      break;
    case 'prompts':
      body = <Prompts/>;
      crumbs = ['alfi', 'Workshop', 'Prompt library'];
      break;
    case 'links':
      body = <Links/>;
      crumbs = ['alfi', 'Workshop', 'Short links'];
      break;
    default:
      body = <Dashboard onProduct={goProduct} onNav={nav}/>;
  }

  return (
    <div className="app">
      <Sidebar
        active={route.name === 'product' || route.name === 'add' ? 'products' : (route.name === 'inbox' ? 'inbox' : route.name)}
        onNav={nav}
        counts={{ products: 12, calendar: 23, inbox: 15 }}
      />
      <div className="main">
        <TopBar crumbs={crumbs} theme={theme} onTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}/>
        <div className="content">{body}</div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
