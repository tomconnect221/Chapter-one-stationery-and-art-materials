import { Link, Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AccountDetails from './AccountDetails';
import AccountSidebar from './accountAssets/accountSideBarNav';
import { useAuth } from '../../../component/Auth/AuthContext';

function CustomerAccount() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const { user } = useAuth();
  // Redirect to login if not authenticated and not customer
  if (!isAuthenticated ) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className='verticalLimit mt-5'>
      <div className='row'>
        <AccountSidebar />
        <Outlet />
      </div>
    </div>
  );
}
export default CustomerAccount;