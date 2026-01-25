import React from 'react';

const formatPrice = (price) => {
  const p = parseFloat(price || 0);
  if (Number.isNaN(p)) return '₦0.00';
  return `₦${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const OrderView = ({ order, onClose, onMarkDelivered, onCallCustomer, onNavigate }) => {
  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delivery-modal">
        <div className="modal-header">
          <h2>Order Details - {order.order_number || order.id}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <section>
            <h4>Customer</h4>
            <div className="customer-block">
              <div><strong>Name:</strong> {order.customer?.name}</div>
              <div><strong>Phone:</strong> {order.delivery_phone || order.customer?.phone}</div>
              <div><strong>Address:</strong> {order.delivery_address || order.customer?.address}</div>
              <div><strong>Branch:</strong> {order.branch?.name || '-'}</div>
            </div>
          </section>

          <section>
            <h4>Items</h4>
            <div className="items-list-detailed">
              {order.order_items?.map((it) => (
                <div key={it.id} className="item-row">
                  <span className="item-name">{it.product?.name || it.name}</span>
                  <span className="item-quantity">× {it.quantity}</span>
                  <span className="item-price">{formatPrice(it.total_price || it.totalPrice || 0)}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4>Summary</h4>
            <div className="summary-block">
              <div><strong>Subtotal:</strong> {formatPrice(order.subtotal)}</div>
              <div><strong>Tax:</strong> {formatPrice(order.tax_amount)}</div>
              <div><strong>Delivery Fee:</strong> {formatPrice(order.delivery_fee)}</div>
              <div><strong>Total:</strong> {formatPrice(order.total_amount)}</div>
              <div><strong>Status:</strong> {order.status}</div>
            </div>
          </section>

          <div className="action-buttons-modal">
            {order.status !== 'delivered' && (
              <button className="btn btn-success btn-large" onClick={() => onMarkDelivered(order.id)}>
                ✅ Mark Delivered
              </button>
            )}

            <button className="btn btn-outline" onClick={() => onCallCustomer(order.delivery_phone || order.customer?.phone)}>
              📞 Call Customer
            </button>

            <button className="btn btn-outline" onClick={() => onNavigate({ lat: order.branch?.latitude || order.customer?.latitude, lng: order.branch?.longitude || order.customer?.longitude })}>
              🗺️ Navigate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderView;
