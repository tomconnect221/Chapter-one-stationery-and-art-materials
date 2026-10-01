import React, { useState, useEffect } from 'react';
import '../AdminProducts/AdminProducts.css';
import { useSelector } from 'react-redux';
import { hasPermission } from '../../utils/permissions';

const AdminInventory = ({ userType = 'admin', userBranch = null }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('restock');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
 const { token,user } = useSelector((state) => state.auth);

 const API_BASE_URL = user?.role == 'admin' ? `${import.meta.env.VITE_API_URL}/api/subadmin` : `${import.meta.env.VITE_API_URL}/api/subadmin`
  // Fetch all inventories
  const fetchInventory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/inventory?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      if (data.success) {
        setInventory(data.data.data);
        setCurrentPage(data.data.current_page);
        setTotalPages(data.data.last_page);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch low stock alerts
  const fetchLowStockAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/alerts/low-stock`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch low stock alerts');
      }

      const data = await response.json();
      if (data.success) {
        setLowStockAlerts(data.data);
      }
    } catch (err) {
      console.error('Error fetching low stock alerts:', err);
    }
  };

  // Update inventory
  const updateInventory = async (inventoryId, updateData) => {
    try {
      const formData = new URLSearchParams();
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== null && updateData[key] !== undefined) {
          formData.append(key, updateData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/inventory/${inventoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      const data = await response.json();
      if (data.success) {
        await fetchInventory(currentPage); // Refresh the list
        return data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Restock inventory
  const restockInventory = async (inventoryId, restockData) => {
    try {
      const formData = new URLSearchParams();
      
      Object.keys(restockData).forEach(key => {
        if (restockData[key] !== null && restockData[key] !== undefined) {
          formData.append(key, restockData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/inventory/${inventoryId}/restock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to restock inventory');
      }

      const data = await response.json();
      if (data.success) {
        await fetchInventory(currentPage); // Refresh the list
        return data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete inventory
  const deleteInventory = async (inventoryId) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${inventoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete inventory');
      }

      const data = await response.json();
      if (data.success) {
        await fetchInventory(currentPage); // Refresh the list
        alert('Inventory deleted successfully');
      }
    } catch (err) {
      setError(err.message);
      alert('Error deleting inventory: ' + err.message);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchLowStockAlerts();
  }, []);

  const handleRestock = (item) => {
    setModalMode('restock');
    setSelectedItem({ ...item, quantity: 0, supplier: '', variant_id: '' });
    setShowModal(true);
  };

  const handleAdjust = (item) => {
    setModalMode('adjust');
    setSelectedItem({ 
      ...item, 
      quantity_in_stock: item.quantity_in_stock,
      quantity_reserved: item.quantity_reserved,
      reorder_level: item.reorder_level,
      max_stock_level: item.max_stock_level,
      cost_price: item.cost_price,
      selling_price: item.selling_price,
      supplier: item.supplier,
      expiry_date: item.expiry_date,
      notes: item.notes,
      is_active: item.is_active
    });
    setShowModal(true);
  };

  const handleViewDetails = (item) => {
    // Navigate to single inventory view
    window.location.href = `/admin/inventory/${item.id}`;
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'restock') {
        await restockInventory(selectedItem.id, {
          quantity: selectedItem.quantity,
          supplier: selectedItem.supplier,
          variant_id: selectedItem.variant_id
        });
      } else if (modalMode === 'adjust') {
        const updateData = {
          reorder_level: selectedItem.reorder_level,
          max_stock_level: selectedItem.max_stock_level,
          cost_price: selectedItem.cost_price,
          selling_price: selectedItem.selling_price,
          supplier: selectedItem.supplier,
          expiry_date: selectedItem.expiry_date,
          notes: selectedItem.notes,
          is_active: selectedItem.is_active
        };
        if (!selectedItem.product?.variants?.length) {
          updateData.quantity_in_stock = selectedItem.quantity_in_stock;
          updateData.quantity_reserved = selectedItem.quantity_reserved;
        }
        await updateInventory(selectedItem.id, updateData);
      }
      setShowModal(false);
    } catch (err) {
      // Error is already handled in the functions
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity_available === 0) return { label: 'Out of Stock', class: 'out' };
    if (item.quantity_available <= item.reorder_level) return { label: 'Low Stock', class: 'low' };
    return { label: 'In Stock', class: 'good' };
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStockStatus(item);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'in_stock' && status.class === 'good') ||
                         (filterStatus === 'low_stock' && status.class === 'low') ||
                         (filterStatus === 'out_of_stock' && status.class === 'out');
    
    return matchesSearch && matchesStatus;
  });

  const canEdit = hasPermission(user, 'inventory.update');
  const canRestock = hasPermission(user, 'inventory.restock');
  const canDelete = hasPermission(user, 'inventory.delete');

  if (loading) return <div className="loading">Loading inventory...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-products">
      <div className="products-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Monitor and manage stock levels</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-warning" 
            onClick={() => setShowLowStockAlert(true)}
            style={{marginRight: '10px'}}
          >
            ⚠️ Low Stock Alerts ({lowStockAlerts.length})
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card d-flex justify-content-between">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-label">Total Items ({inventory.length})</div>
          </div>
        </div>
        <div className="stat-card d-flex justify-content-between">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">In Stock ({inventory.filter(i => getStockStatus(i).class === 'good').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex justify-content-between">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-label">Low Stock ({inventory.filter(i => getStockStatus(i).class === 'low').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex justify-content-between">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-label">Out of Stock ({inventory.filter(i => getStockStatus(i).class === 'out').length})</div>
          </div>
        </div>
      </div>

      <div className="filters-section justify-content-between">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Current Stock</th>
              {/* <th>Available</th> */}
              <th>Reorder Level</th>
              <th>Selling Price</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => {
              const status = getStockStatus(item);
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.product?.name}</strong>
                    <div style={{fontSize: '0.8em', color: '#666'}}>
                      {item.product?.brand} • {item.product?.model}
                    </div>
                    {item.product?.variants?.length > 0 && (
                      <div style={{fontSize: '0.8em', color: '#666'}}>
                        {item.product.variants.length} options; restock by option
                      </div>
                    )}
                  </td>
                  <td>{item.product?.sku}</td>
                  <td>
                    <span className={`stock-badge ${status.class}`}>
                      {item.quantity_in_stock}
                    </span>
                  </td>
                  {/* <td>{item.quantity_available}</td> */}
                  <td>{item.reorder_level}</td>
                  <td>₦{parseFloat(item.selling_price).toLocaleString()}</td>
                  <td>
                    <span className={`stock-badge ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-button d-flex justify-content-center">
                      {/* <button 
                        className="btn-icon" 
                        onClick={() => handleViewDetails(item)} 
                        title="View Details"
                        style={{fontSize: '14px'}}
                      >
                        👁️
                      </button> */}
                      {canRestock && (
                          <button 
                            className="btn-icon" 
                            onClick={() => handleRestock(item)} 
                            title="Restock"
                            style={{fontSize: '14px'}}
                          >
                            📥
                          </button>
                      )}
                      {canEdit && (
                        <button
                          className="btn-icon"
                          onClick={() => handleAdjust(item)}
                          title="Adjust inventory"
                          style={{ fontSize: '14px' }}
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-icon danger"
                          onClick={() => deleteInventory(item.id)}
                          title="Delete inventory"
                          style={{ fontSize: '14px' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          disabled={currentPage === 1} 
          onClick={() => fetchInventory(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          disabled={currentPage === totalPages} 
          onClick={() => fetchInventory(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {showModal && (
        <InventoryModal
          mode={modalMode}
          item={selectedItem}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          onChange={setSelectedItem}
        />
      )}

      {showLowStockAlert && (
        <LowStockAlertModal
          alerts={lowStockAlerts}
          onClose={() => setShowLowStockAlert(false)}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

const InventoryModal = ({ mode, item, onSave, onClose, onChange }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
        <div className="modal-header">
          <h2>{mode === 'restock' ? 'Restock Item' : 'Adjust Inventory'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid" style={{gridTemplateColumns: '1fr'}}>
            <div className="form-field">
              <label>Product</label>
              <input type="text" value={item.product?.name} disabled />
            </div>

            <div className="form-field">
              <label>SKU</label>
              <input type="text" value={item.product?.sku} disabled />
            </div>

            {mode === 'restock' ? (
              <>
                {item.product?.variants?.length > 0 && (
                  <div className="form-field">
                    <label>Product option *</label>
                    <select
                      value={item.variant_id}
                      onChange={(e) => onChange({ ...item, variant_id: e.target.value })}
                    >
                      <option value="">Select color / size / dimensions</option>
                      {item.product.variants.map(variant => (
                        <option key={variant.id} value={variant.id}>
                          {[variant.color, variant.size, variant.dimensions].filter(Boolean).join(' · ')} ({variant.stock_quantity} in stock)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-field">
                  <label>Restock Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onChange({ ...item, quantity: e.target.value })}
                    placeholder="Enter quantity to add"
                  />
                </div>
                <div className="form-field">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={item.supplier}
                    onChange={(e) => onChange({ ...item, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>
              </>
            ) : (
              <>
                {item.product?.variants?.length > 0 && (
                  <p className="small text-muted">Total stock is calculated from options. Adjust each option in product management or use Restock to add stock to one option.</p>
                )}
                <div className="form-field">
                  <label>Quantity in Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity_in_stock}
                    onChange={(e) => onChange({ ...item, quantity_in_stock: e.target.value })}
                    disabled={item.product?.variants?.length > 0}
                  />
                </div>

                <div className="form-field">
                  <label>Quantity Reserved</label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity_reserved}
                    onChange={(e) => onChange({ ...item, quantity_reserved: e.target.value })}
                    disabled={item.product?.variants?.length > 0}
                  />
                </div>

                <div className="form-field">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={item.reorder_level}
                    onChange={(e) => onChange({ ...item, reorder_level: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Max Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    value={item.max_stock_level || ''}
                    onChange={(e) => onChange({ ...item, max_stock_level: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.cost_price || ''}
                    onChange={(e) => onChange({ ...item, cost_price: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Selling Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.selling_price}
                    onChange={(e) => onChange({ ...item, selling_price: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={item.supplier || ''}
                    onChange={(e) => onChange({ ...item, supplier: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={item.expiry_date || ''}
                    onChange={(e) => onChange({ ...item, expiry_date: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Notes</label>
                  <textarea
                    value={item.notes || ''}
                    onChange={(e) => onChange({ ...item, notes: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={item.is_active}
                      onChange={(e) => onChange({ ...item, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave} disabled={mode === 'restock' && item.product?.variants?.length > 0 && !item.variant_id}>
            {mode === 'restock' ? 'Restock' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LowStockAlertModal = ({ alerts, onClose, onViewDetails }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px'}}>
        <div className="modal-header">
          <h2>⚠️ Low Stock Alerts</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {alerts.length === 0 ? (
            <p>No low stock alerts at this time.</p>
          ) : (
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    {/* <th>Available</th> */}
                    <th>Reorder Level</th>
                    <th>Status</th>
                    {/* <th>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.product?.name}</strong>
                        <div style={{fontSize: '0.8em', color: '#666'}}>
                          SKU: {item.product?.sku}
                        </div>
                      </td>
                      <td>{item.quantity_in_stock}</td>
                      {/* <td>{item.quantity_available}</td> */}
                      <td>{item.reorder_level}</td>
                      <td>
                        <span className="stock-badge low">
                          Low Stock
                        </span>
                      </td>
                      <td>
                        {/* <button 
                          className="btn-primary"
                          onClick={() => onViewDetails(item)}
                          style={{padding: '5px 10px', fontSize: '12px'}}
                        >
                          View Details
                        </button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;