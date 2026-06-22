import About from './pages/About';
import AdminOrders from './pages/AdminOrders';
import BookEvent from './pages/BookEvent';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Menu from './pages/Menu';
import MyOrders from './pages/MyOrders';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderOnline from './pages/OrderOnline';
import Reviews from './pages/Reviews';
import __Layout from './Layout.jsx';



export const PAGES = {
    "About": About,
    "AdminOrders": AdminOrders,
    "BookEvent": BookEvent,
    "Cart": Cart,
    "Checkout": Checkout,
    "Contact": Contact,
    "Gallery": Gallery,
    "Home": Home,
    "Menu": Menu,
    "MyOrders": MyOrders,
    "OrderConfirmation": OrderConfirmation,
    "OrderOnline": OrderOnline,
    "Reviews": Reviews,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};