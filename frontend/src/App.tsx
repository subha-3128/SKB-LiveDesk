import { useState, useEffect } from 'react';
import { apiService, setAuthToken } from './services/api';
import type { Order, DashboardStats, NeedsAttentionItem, User, OrderShiftData } from './types';
import { Navigation } from './components/Navigation';
import { AddOrderModal } from './components/AddOrderModal';
import { ShiftOrderModal } from './components/ShiftOrderModal';
import { NotifyCustomerModal } from './components/NotifyCustomerModal';
import { Dashboard } from './pages/Dashboard';
import { OrdersPage } from './pages/OrdersPage';
import { ShiftedPage } from './pages/ShiftedPage';
import { DeliveredPage } from './pages/DeliveredPage';
import { CustomersPage } from './pages/CustomersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BillingPage } from './pages/BillingPage';
import { LoginPage } from './pages/LoginPage';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { BackgroundBlobs } from './components/BackgroundBlobs';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);
  const [attentionItems, setAttentionItems] = useState<NeedsAttentionItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shiftModalOrder, setShiftModalOrder] = useState<Order | null>(null);
  const [notifyModalOrder, setNotifyModalOrder] = useState<Order | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshData = async () => {
    try {
      const [statsData, attentionData, ordersData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getNeedsAttention(),
        apiService.getOrders({ search: searchQuery })
      ]);
      setStats(statsData);
      setAttentionItems(attentionData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('garments_token');
    if (token) {
      setAuthToken(token);
      apiService.getMe()
        .then((user) => {
          setCurrentUser(user);
          refreshData();
        })
        .catch(() => {
          setAuthToken(null);
          setCurrentUser(null);
        })
        .finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [searchQuery]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    refreshData();
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  const handleOrderCreated = (newOrder: Order) => {
    refreshData();
    showToast(`Order #${newOrder.order_number} created successfully!`);
  };

  const handleConfirmShift = async (orderId: number, data: OrderShiftData) => {
    try {
      const updated = await apiService.shiftOrder(orderId, data);
      await refreshData();
      showToast(`Order #${updated.order_number} marked as Shifted via ${updated.courier}`);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to shift order', 'error');
    }
  };

  const handleConfirmNotificationSent = async (orderId: number) => {
    try {
      const updated = await apiService.notifyCustomer(orderId);
      await refreshData();
      showToast(`Customer notification recorded for #${updated.order_number}`);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to record notification', 'error');
    }
  };

  const handleDeliverOrder = async (order: Order) => {
    try {
      const updated = await apiService.deliverOrder(order.id);
      await refreshData();
      showToast(`Order #${updated.order_number} successfully marked as DELIVERED!`);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to mark order as delivered', 'error');
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    try {
      await apiService.deleteOrder(order.id);
      await refreshData();
      showToast(`Order #${order.order_number} deleted successfully!`);
      if (selectedOrderId === order.id) {
        setActiveTab('orders');
        setSelectedOrderId(null);
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete order', 'error');
    }
  };

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedOrderId(null);
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrderId(order.id);
    setActiveTab('order_details');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-plum)] text-white flex items-center justify-center font-black mx-auto animate-pulse">
            BB
          </div>
          <p className="text-xs font-bold text-[var(--color-plum)]">Loading Bepari &amp; Brothers...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Liquid Glass Blobs */}
      <BackgroundBlobs />

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        <Navigation
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setSelectedOrderId(null); }}
          stats={stats}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onLogout={handleLogout}
          staffName={currentUser.name}
        />

        <main className="flex-1 md:ml-64 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pt-16 md:pt-6 pb-24 md:pb-8">
          {toastMessage && (
            <div className="fixed top-4 right-4 z-50 animate-bounce-in">
              <div className={`py-3 px-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-red-600 text-white border-red-700'
              }`}>
                {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <AlertCircle className="w-4 h-4 text-red-200" />}
                <span>{toastMessage.text}</span>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              attentionItems={attentionItems}
              recentOrders={orders}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onViewOrder={handleViewOrderDetails}
              onShiftOrder={(ord) => setShiftModalOrder(ord)}
              onDeliverOrder={handleDeliverOrder}
              onDeleteOrder={handleDeleteOrder}
              onNavigateTab={handleNavigateTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersPage
              orders={orders}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onViewOrder={handleViewOrderDetails}
              onShiftOrder={(ord) => setShiftModalOrder(ord)}
              onDeleteOrder={handleDeleteOrder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'shifted' && (
            <ShiftedPage
              orders={orders}
              onViewOrder={handleViewOrderDetails}
              onNotifyCustomer={(ord) => setNotifyModalOrder(ord)}
              onDeliverOrder={handleDeliverOrder}
              onDeleteOrder={handleDeleteOrder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'delivered' && (
            <DeliveredPage
              orders={orders}
              onViewOrder={handleViewOrderDetails}
              onDeleteOrder={handleDeleteOrder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'order_details' && selectedOrderId && (
            <OrderDetailsPage
              orderId={selectedOrderId}
              onBack={() => setActiveTab('dashboard')}
              onShiftOrder={(ord) => setShiftModalOrder(ord)}
              onNotifyCustomer={(ord) => setNotifyModalOrder(ord)}
              onDeliverOrder={handleDeliverOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              onViewOrder={handleViewOrderDetails}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'billing' && <BillingPage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>

        <AddOrderModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onOrderCreated={handleOrderCreated}
        />

        <ShiftOrderModal
          order={shiftModalOrder}
          isOpen={!!shiftModalOrder}
          onClose={() => setShiftModalOrder(null)}
          onConfirmShift={handleConfirmShift}
        />

        <NotifyCustomerModal
          order={notifyModalOrder}
          isOpen={!!notifyModalOrder}
          onClose={() => setNotifyModalOrder(null)}
          onConfirmNotificationSent={handleConfirmNotificationSent}
        />
      </div>
    </div>
  );
}

export default App;
