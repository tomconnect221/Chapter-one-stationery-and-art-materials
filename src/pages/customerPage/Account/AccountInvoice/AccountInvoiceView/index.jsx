import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './AccountInvoiceView.css';
import useSettings from '../../../../../hooks/useSettings';
const AccountInvoiceView = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const { settings, isLoading: settingsLoading } = useSettings();
  // Fetch single invoice from API
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/invoices/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const invoiceData = response.data.data;
        const transformedInvoice = {
          id: invoiceData.invoice_number,
          invoiceId: invoiceData.id,
          orderId: invoiceData.order?.order_number || 'N/A',
          date: invoiceData.created_at,
          dueDate: invoiceData.expires_at,
          issueDate: invoiceData.created_at,
          status: invoiceData.status,
          amount: parseFloat(invoiceData.amount) * 100,
          subtotal: parseFloat(invoiceData.paystack_response?.metadata?.subtotal || invoiceData.amount) * 100,
          shippingFee: parseFloat(invoiceData.paystack_response?.metadata?.delivery_fee || 0) * 100,
          tax: parseFloat(invoiceData.paystack_response?.metadata?.tax_amount || 0) * 100,
          discount: 0,
          items: invoiceData.order?.order_items?.map(item => ({
            id: item.id,
            name: item.product?.name || 'Product',
            description: item.product?.short_description || item.product?.description || '',
            quantity: item.quantity,
            price: parseFloat(item.unit_price) * 100,
            total: parseFloat(item.total_price) * 100,
            image: item.product?.image || 'https://via.placeholder.com/60x60?text=Product'
          })) || [],
          customer: {
            name: (invoiceData.paystack_response?.customer?.first_name + ' ' + invoiceData.paystack_response?.customer?.last_name).trim() || 'Customer',
            email: invoiceData.customer_email,
            phone: invoiceData.customer_phone || 'N/A',
            address: {
              street: invoiceData.customer_address || 'N/A',
              city: 'N/A',
              state: 'N/A',
              country: 'Nigeria'
            }
          },
          shipping: {
            method: 'Standard Delivery',
            trackingNumber: invoiceData.order?.id || 'N/A',
            estimatedDelivery: invoiceData.order?.created_at,
            address: {
              street: invoiceData.order?.delivery_address || invoiceData.customer_address || 'N/A',
              city: 'N/A',
              state: 'N/A',
              country: 'Nigeria'
            }
          },
          payment: {
            method: invoiceData.payment_channel || 'N/A',
            transactionId: invoiceData.paystack_transaction_id,
            cardLast4: invoiceData.paystack_response?.authorization?.last4 || null,
            paymentDate: invoiceData.paid_at,
            status: invoiceData.status === 'paid' ? 'completed' : invoiceData.status
          },
          seller: {
            name: 'ChapterOneSrationeryunlimited Nigeria',
            address: '14, Idowu Martins Street, Victoria Island, Lagos',
            phone: '+234 700 500 0000',
            email: 'support@ChapterOneSrationeryunlimited.com.ng',
            website: 'www.ChapterOneSrationeryunlimited.com.ng'
          }
        };
        
        setInvoice(transformedInvoice);
      } else {
        throw new Error('Failed to fetch invoice');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && invoiceId) {
      fetchInvoice();
    }
  }, [token, invoiceId]);

  const formatPrice = (price) => {
    return `₦${(price / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: 'Paid', color: 'success', icon: '✓' },
      overdue: { label: 'Overdue', color: 'error', icon: '⏰' },
      refunded: { label: 'Refunded', color: 'warning', icon: '↩' },
      pending: { label: 'Pending', color: 'warning', icon: '⏳' }
    };

    const config = statusConfig[status] || { label: status, color: 'text-secondary', icon: '📄' };

    return (
      <span className={`status-badge status-${config.color}`}>
        <span className="status-ico">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const handleDownloadPDF = () => {
    alert(`Downloading invoice ${invoice.id} as PDF...`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    alert(`Sharing invoice ${invoice.id}...`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="invoice-loading-container">
        <div className="invoice-spinner"></div>
        <p className="invoice-loading-text">Loading invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Invoice</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={fetchInvoice} className="btn btn-primary">
            Try Again
          </button>
          <button onClick={handleBack} className="btn btn-outline">
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-empty-container">
        <h3>Invoice not found</h3>
        <button onClick={handleBack} className="btn btn-primary">
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="col-lg-10">
    <div className="invoice-view ">
      {/* Header Section */}
      <div className="invoice-header">
        <div className="header-conten">
          <button className="back-button" onClick={handleBack}>
            <span className="back-icon">←</span>
            Back to Invoices
          </button>
          
          <div className="header-main">
            <div className="header-inf0">
              <h1 className="invoice-title">Invoice #{invoice.id}</h1>
              <div className="invoice-meta">
                <div className="meta-item">
                  <span className="meta-label">Order:</span>
                  <span className="meta-value">{invoice.orderId}</span>
                </div>
                <div className="meta-item" style={{color:'#e4e2e2ff'}}>
                  <span className="meta-label text-light" ><b style={{color:'white'}}> Issued:</b> </span>
                  <span className="meta-value text-light">{formatDate(invoice.date)}</span>
                </div>
              </div>
            </div>

            <div className="header-action d-flex mt-3 gap-2 ">
            
              <button className="btn text-light d-flex" style={{background:'#ff9900'}} onClick={handlePrint}>
                <span className="btn-icon">🖨️</span>
                Print
              </button>
              <button className="btn btn-primary d-flex" onClick={handleDownloadPDF}>
                <span className="btn-icon">📥</span>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="invoice-content">
        {/* Company & Invoice Info */}
        <div className="invoice-overview">
          {settings && <div className="company-card">
            <div className="company-header">
            
              <div className="company-info">
                {settings.site_name && <h3>{settings.site_name}</h3>}
                {/* {settings && <p>14, Idowu Martins Street</p>} */}
               
                <div className="company-contact">
                 {settings.store_phone &&  <span>📞 {settings.store_phone}</span>}
                  {settings.store_email && <span>✉️ {settings.store_email}</span>}
                  {/* <span>🌐 www.chapterone.com.ng</span> */}
                </div>
              </div>
            </div>
          </div>}

          <div className="invoice-details-card">
            <h4 className="card-title">Invoice Details</h4>
            <div className="details-grid">
              <div className="detail-item text-left">
                <span className="detail-label">Invoice Number</span>
                <span className="detail-value">{invoice.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Order Number</span>
                <span className="detail-value">{invoice.orderId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Issue Date</span>
                <span className="detail-value">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Due Date</span>
                <span className="detail-value">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <div className="detail-value">{getStatusBadge(invoice.status)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="address-section">
          <div className="address-card">
            <h4 className="card-title">Bill To</h4>
            <div className="address-content">
              <div className="customer-name">{invoice.customer.name}</div>
              <div className="customer-contact">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  {invoice.customer.email}
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  {invoice.customer.phone}
                </div>
              </div>
              <div className="customer-address">
                <div>{invoice.customer.address.street}</div>
                <div>{invoice.customer.address.city}, {invoice.customer.address.state}</div>
                <div>{invoice.customer.address.country}</div>
              </div>
            </div>
          </div>

          <div className="address-card">
            <h4 className="card-title">Ship To</h4>
            <div className="address-content">
              <div className="shipping-method">{invoice.shipping.method}</div>
              {invoice.shipping.trackingNumber && (
                <div className="tracking-info">
                  <div className="tracking-item">
                    <span className="tracking-label">Tracking:</span>
                    {invoice.shipping.trackingNumber}
                  </div>
                  <div className="tracking-item">
                    <span className="tracking-label">Est. Delivery:</span>
                    {formatDate(invoice.shipping.estimatedDelivery)}
                  </div>
                </div>
              )}
              <div className="shipping-address">
                <div>{invoice.shipping.address.street}</div>
                <div>{invoice.shipping.address.city}, {invoice.shipping.address.state}</div>
                <div>{invoice.shipping.address.country}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-section">
          <h3 className="section-title">Order Items</h3>
          <div className="items-table">
            <div className="table-header">
              <div className="col-item">Product</div>
              <div className="col-quantity">Quantity</div>
              <div className="col-price">Unit Price</div>
              <div className="col-total">Amount</div>
            </div>

            <div className="table-body">
              {invoice.items.map((item) => (
                <div key={item.id} className="item-row">
                  <div className="col-item">
                    <div className="item-info">
                      <div className="item-image">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x60?text=Product';
                          }}
                        />
                      </div>
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        {/* <div className="item-description">{item.description}</div> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-quantity">
                    <span className="quantity-badge">{item.quantity}</span>
                  </div>
                  <div className="col-price">
                    <span className="price">{formatPrice(item.price)}</span>
                  </div>
                  <div className="col-total">
                    <span className="total-amount">{formatPrice(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary & Payment */}
        <div className="summary-payment-section">
          <div className="summary-card">
            <h4 className="card-title">Order Summary</h4>
            <div className="summary-rows">
              <div className="summary-row">
                <span className="label">Subtotal</span>
                <span className="value">{formatPrice(invoice.subtotal)}</span>
              </div>

              {invoice.shippingFee > 0 && (
                <div className="summary-row">
                  <span className="label">Shipping Fee</span>
                  <span className="value">{formatPrice(invoice.shippingFee)}</span>
                </div>
              )}

              {invoice.tax > 0 && (
                <div className="summary-row">
                  <span className="label">Tax</span>
                  <span className="value">{formatPrice(invoice.tax)}</span>
                </div>
              )}

              {invoice.discount > 0 && (
                <div className="summary-row discount">
                  <span className="label">Discount</span>
                  <span className="value">-{formatPrice(invoice.discount)}</span>
                </div>
              )}

              <div className="summary-row total">
                <span className="label">Total Amount</span>
                <span className="value">{formatPrice(invoice.amount)}</span>
              </div>
            </div>
          </div>

          <div className="payment-card">
            <h4 className="card-title">Payment Information</h4>
            <div className="payment-details">
              <div className="payment-row">
                <span className="label">Payment Method</span>
                <span className="value">{invoice.payment.method}</span>
              </div>
              {invoice.payment.cardLast4 && (
                <div className="payment-row">
                  <span className="label">Card Number</span>
                  <span className="value">**** **** **** {invoice.payment.cardLast4}</span>
                </div>
              )}
              <div className="payment-row">
                <span className="label">Transaction ID</span>
                <span className="value transaction-id">{invoice.payment.transactionId}</span>
              </div>
              <div className="payment-row">
                <span className="label">Payment Date</span>
                <span className="value">{formatDateTime(invoice.payment.paymentDate)}</span>
              </div>
              <div className="payment-row">
                <span className="label">Payment Status</span>
                <span className="value status-completed">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Footer */}
        <div className="terms-section">
          <div className="terms-card">
            <h4 className="card-title">Terms & Conditions</h4>
            <div className="terms-content">
              <div className="term-item">
                <span className="term-icon">•</span>
                <span>Payment is due within 7 days of invoice date</span>
              </div>
              <div className="term-item">
                <span className="term-icon">•</span>
                <span>Late payments are subject to a fee of 1.5% per month</span>
              </div>
              <div className="term-item">
                <span className="term-icon">•</span>
                <span>All sales are final unless otherwise specified</span>
              </div>
              <div className="term-item">
                <span className="term-icon">•</span>
                <span>Make all checks payable to ChapterOne Stationery Unlimited</span>
              </div>
              <div className="term-item">
                <span className="term-icon">•</span>
                <span>If you have any questions concerning this invoice, contact support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="invoice-footer">
          <div className="footer-content">
            <div className="thank-you">Thank you for your business! 🎉</div>
            <div className="footer-contacts">
              <span>📞 +234 700 500 0000</span>
              <span>✉️ support@chapterone.com.ng</span>
              <span>🌐 www.chapterone.com.ng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="mobile-actions">
        <button className="btn btn-ghost" onClick={handleShare}>
          📤 Share
        </button>
        <button className="btn btn-ghost" onClick={handlePrint}>
          🖨️ Print
        </button>
        <button className="btn btn-primary" onClick={handleDownloadPDF}>
          📥 Download
        </button>
      </div>
    </div>
    </div>
  );
};

export default AccountInvoiceView;