import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from './pages/errors/NotFound'
import ROUTE from './helper/Route';
import LandingPage from './pages/landingpage';
import Lead from './pages/lead';
import Account from './pages/account';
import Contact from './pages/contact';
import Opportunity from './pages/opportunity'
import ProjectMaster from './pages/project-master';
import Permission from './pages/permission';
import Users from './pages/users'
import ReportDashboard from "./pages/report-dashboard";
import Login from './pages/login/login';
import Calendar from "./pages/calendar"
import Task from './pages/task';
import TaskDetail from './pages/task/TaskDetail';
import EditProfile from './components/EditProfile';
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PermissionDetail from './pages/permission/PermissionDetail';
import ClientConfirmation from './components/ClientConfirmation'; 
import ReportDasboardDetail from "./pages/report-dashboard/ReportDashboardDetails";
import DetailPage from './components/DetailPage';
import { AuthProvider } from './helper/AuthWrapper';
import ProtectedRoute from './helper/ProtectedRoute';
import Backup from './pages/backup'
import InternalServer from './pages/errors/InternalServer';
import SocketRegistrar from './helper/SocketRegistrar'; 
import Category from './pages/category/index';
import TaskDashboard from './pages/task/TaskDashboard';
import NavigationInitializer from './config/NavigationInitializer';
import Product from './pages/product';

import Ledgers from './pages/ledgers';
import StockItem from './pages/stockItem';
import Voucher from './pages/vouchers';
import Order from './pages/order';
import Setting from './pages/setting';

function App() {
  return (
    <>
    <AuthProvider>
      <SocketRegistrar />
      <Router>
        <NavigationInitializer />
        <Routes>
          <Route path={ROUTE.LOGIN} element={<Login />} />
          <Route path={ROUTE.HOME} element={<LandingPage />} />
          <Route
            path={ROUTE.LEAD}
            element={<ProtectedRoute moduleName="Lead"><Lead /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route
            path={ROUTE.ACCOUNT}
            element={<ProtectedRoute moduleName="Account"><Account /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route
            path={ROUTE.CONTACT}
            element={<ProtectedRoute moduleName="Contact"><Contact /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route
            path={ROUTE.CATEGORY}
            element={<ProtectedRoute moduleName="Category"><Category /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>

          <Route
            path={ROUTE.LEDGERS}
            element={<ProtectedRoute moduleName="Ledgers"><Ledgers /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route
            path={ROUTE.STOCKITEM}
            element={<ProtectedRoute moduleName="Stock_Items"><StockItem /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route
            path={ROUTE.VOUCHER}
            element={<ProtectedRoute moduleName="Vouchers"><Voucher /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route
            path={ROUTE.ORDER}
            element={<ProtectedRoute moduleName="Orders"><Order /></ProtectedRoute>}>
          </Route> 
          <Route
            path={ROUTE.SETTING}
            element={<ProtectedRoute moduleName="Setting"><Setting /></ProtectedRoute>}>
          </Route> 
          {/* <Route path="order/:id" element={<OrderModal />} /> */} 
          <Route
            path={ROUTE.PRODUCT}
            element={<ProtectedRoute moduleName="Product"><Product /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route
            path={ROUTE.TASK}
            element={<ProtectedRoute moduleName="Task"><Task /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route
            path={ROUTE.OPPORTUNITY}
            element={<ProtectedRoute moduleName="Opportunity"><Opportunity /></ProtectedRoute>}>
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          {/* <Route path={ROUTE.OPPORTUNITY} element={<Opportunity />} /> */}
          <Route path={ROUTE.PROJECTMASTER} element={<ProjectMaster />} />

          <Route path={ROUTE.PERMISSION} element={<Permission />} > 
            <Route path="view/:id" element={<PermissionDetail />} />
          </Route>
          <Route path={ROUTE.CALENDAR} element={<Calendar />} />
          <Route path={ROUTE.BACKUP} element={<Backup />} />
          <Route path={ROUTE.USER} element={<Users />} >
            <Route path="view/:id" element={<DetailPage />} />
          </Route>
          <Route path={ROUTE.TASK} element={<TaskDashboard />} >
            <Route path='view/:id' element={<TaskDetail />} />
          </Route>
          <Route path={ROUTE.REPORT_DASHBOARD} element={<ReportDashboard />} >
            <Route path='view/:id' element={<ReportDasboardDetail />} />
          </Route>
          <Route path={ROUTE.EDITPROFILE} element={<EditProfile />} />
          <Route path={`${ROUTE.CLIENTCONFIRMATION}/:id`} element={<ClientConfirmation />} />
          
          <Route path='/internalserver' element={<InternalServer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>  
    </>
  );
}

export default App;
