import About from './pages/About';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';
import AdminGrocery from './pages/AdminGrocery';
import AdminTasks from './pages/AdminTasks';
import AdminCalendar from './pages/AdminCalendar';
import AdminReviews from './pages/AdminReviews';
import AdminLabels from './pages/AdminLabels';
import AdminPOS from './pages/AdminPOS';
import AdminInventory from './pages/AdminInventory';
import BookEvent from './pages/BookEvent';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
import MyOrders from './pages/MyOrders';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderOnline from './pages/OrderOnline';
import Reviews from './pages/Reviews';
import TrackOrder from './pages/TrackOrder';
// import MonthlyPlans from './pages/MonthlyPlans';
// import MonthlyPlanCheckout from './pages/MonthlyPlanCheckout';
import __Layout from './Layout.jsx';



export const PAGES = {
    "About": About,
    "AdminOrders": AdminOrders,
    "AdminMenu": AdminMenu,
    "AdminGrocery": AdminGrocery,
    "AdminTasks": AdminTasks,
    "AdminCalendar": AdminCalendar,
    "AdminReviews": AdminReviews,
    "AdminLabels": AdminLabels,
    "AdminPOS": AdminPOS,
    "AdminInventory": AdminInventory,
    "BookEvent": BookEvent,
    "Cart": Cart,
    "Checkout": Checkout,
    "Contact": Contact,
    "Gallery": Gallery,
    "Home": Home,
    "Login": Login,
    "Menu": Menu,
    "MyOrders": MyOrders,
    "OrderConfirmation": OrderConfirmation,
    "OrderOnline": OrderOnline,
    // "MonthlyPlans": MonthlyPlans,
    // "MonthlyPlanCheckout": MonthlyPlanCheckout,
    "Reviews": Reviews,
    "TrackOrder": TrackOrder,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};