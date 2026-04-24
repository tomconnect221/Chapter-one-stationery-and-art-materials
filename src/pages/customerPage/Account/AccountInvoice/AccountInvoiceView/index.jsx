import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './AccountInvoiceView.css';
import useSettings from '../../../../../hooks/useSettings';
import siteLightLogo from '/assets/image/light_logo.png';
const AccountInvoiceView = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { settings, isLoading: settingsLoading } = useSettings();

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
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
            name: settings?.site_name || 'ChapterOne Stationery',
            address: settings?.store_address || '14, Idowu Martins Street, Victoria Island, Lagos',
            phone: settings?.store_phone || '+234 700 500 0000',
            email: settings?.store_email || '',
            // website: 'www.chapterone.com.ng'
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
      paid: { label: 'Paid', class: 'status-paid', icon: '✓' },
      overdue: { label: 'Overdue', class: 'status-overdue', icon: '⏰' },
      refunded: { label: 'Refunded', class: 'status-refunded', icon: '↩' },
      pending: { label: 'Pending', class: 'status-pending', icon: '⏳' }
    };
    const config = statusConfig[status] || { label: status, class: 'status-default', icon: '📄' };
    return (
      <span className={`invoice-status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        <span> {config.label} </span>
      </span>
    );
  };

  const handleDownloadPDF = async () => {
    const downloadBtn = document.querySelector('.download-btn');
    
    try {
      const originalBtnText = downloadBtn?.innerHTML || '';
      if (downloadBtn) downloadBtn.innerHTML = '<span className="btn-spinner"></span> Generating...';

      // Create a clean, well-structured receipt container
      const receiptContainer = document.createElement('div');
      receiptContainer.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        width: 500px;
        min-height: 700px;
        padding: 40px;
        background: #fff;
        font-family: Arial, Helvetica, sans-serif;
      `;
      
      // Build clean, well-structured receipt HTML
      let receiptHTML = `
        <div style="text-align: center; padding: 0 0 20px 0; border-bottom: 2px solid #333;">
          <h1 style="margin: 0; font-size: 28px; color: #1a1a2e; text-transform: uppercase; letter-spacing: 2px;">
            ${settings?.site_name || 'ChapterOne Stationery'}
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #333;">${settings?.store_address || '39 Ojuelegba Road, Tejuosho, Surulere, Lagos'}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #333;">Tel: ${settings?.store_phone || '+234 700 500 0000'} | Email: ${settings?.store_email || ''}</p>
        </div>
        
        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;">
              <strong style="font-size: 11px; color: #666;">INVOICE NUMBER</strong><br>
              <span style="font-size: 14px; font-weight: bold; color: #1a1a2e;">${invoice.id}</span>
            </td>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;">
              <strong style="font-size: 11px; color: #666;">DATE</strong><br>
              <span style="font-size: 14px; font-weight: bold; color: #1a1a2e;">${formatDate(invoice.issueDate)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;">
              <strong style="font-size: 11px; color: #666;">ORDER NUMBER</strong><br>
              <span style="font-size: 14px; font-weight: bold; color: #1a1a2e;">${invoice.orderId}</span>
            </td>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;">
              <strong style="font-size: 11px; color: #666;">STATUS</strong><br>
              <span style="font-size: 14px; font-weight: bold; color: #10b981;">${invoice.status.toUpperCase()}</span>
            </td>
          </tr>
        </table>
        
        <div style="margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 5px;">BILLING ADDRESS</h3>
          <p style="margin: 0; font-size: 12px; color: #333; line-height: 1.6;">
            ${invoice.customer.email}<br>
            ${invoice.customer.phone}<br>
            ${invoice.customer.address.street}<br>
            ${invoice.customer.address.country}
          </p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 5px;">SHIPPING ADDRESS</h3>
          <p style="margin: 0; font-size: 12px; color: #333; line-height: 1.6;">
            ${invoice.shipping.address.street}<br>
            ${invoice.shipping.address.country}<br>
            <strong>Method:</strong> ${invoice.shipping.method}
          </p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 5px;">ORDER ITEMS</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #1a1a2e; color: #fff;">
                <th style="padding: 10px 5px; text-align: left; font-size: 11px;">#</th>
                <th style="padding: 10px 5px; text-align: left; font-size: 11px;">ITEM</th>
                <th style="padding: 10px 5px; text-align: center; font-size: 11px;">QTY</th>
                <th style="padding: 10px 5px; text-align: right; font-size: 11px;">PRICE</th>
                <th style="padding: 10px 5px; text-align: right; font-size: 11px;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      invoice.items.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#fff' : '#f9f9f9';
        receiptHTML += `
          <tr style="background: ${bgColor};">
            <td style="padding: 10px 5px; border-bottom: 1px solid #ddd; font-size: 12px;">${index + 1}</td>
            <td style="padding: 10px 5px; border-bottom: 1px solid #ddd; font-size: 12px;">
              <strong>${item.name}</strong>
              ${item.description ? `<br><span style="color: #666; font-size: 10px;">${item.description.substring(0, 50)}</span>` : ''}
            </td>
            <td style="padding: 10px 5px; border-bottom: 1px solid #ddd; text-align: center; font-size: 12px;">${item.quantity}</td>
            <td style="padding: 10px 5px; border-bottom: 1px solid #ddd; text-align: right; font-size: 12px;">${formatPrice(item.price)}</td>
            <td style="padding: 10px 5px; border-bottom: 1px solid #ddd; text-align: right; font-size: 12px; font-weight: bold;">${formatPrice(item.total)}</td>
          </tr>
        `;
      });
      
      receiptHTML += `
            </tbody>
          </table>
        </div>
        
        <div style="margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 5px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #666;">Subtotal</td>
              <td style="padding: 8px 0; font-size: 13px; text-align: right;">${formatPrice(invoice.subtotal)}</td>
            </tr>
      `;
      
      if (invoice.shippingFee > 0) {
        receiptHTML += `
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #666;">Shipping Fee</td>
              <td style="padding: 8px 0; font-size: 13px; text-align: right;">${formatPrice(invoice.shippingFee)}</td>
            </tr>
        `;
      }
      
      if (invoice.tax > 0) {
        receiptHTML += `
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #666;">Tax</td>
              <td style="padding: 8px 0; font-size: 13px; text-align: right;">${formatPrice(invoice.tax)}</td>
            </tr>
        `;
      }
      
      receiptHTML += `
            <tr style="border-top: 2px solid #1a1a2e;">
              <td style="padding: 12px 0; font-size: 16px; font-weight: bold; color: #1a1a2e;">TOTAL</td>
              <td style="padding: 12px 0; font-size: 16px; font-weight: bold; text-align: right; color: #e94560;">${formatPrice(invoice.amount)}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1a1a2e;">PAYMENT INFORMATION</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #666;">Payment Method</td>
              <td style="padding: 6px 0; font-size: 12px; text-align: right;">${invoice.payment.method}</td>
            </tr>
            ${invoice.payment.cardLast4 ? `
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #666;">Card Number</td>
              <td style="padding: 6px 0; font-size: 12px; text-align: right;">**** **** **** ${invoice.payment.cardLast4}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #666;">Transaction ID</td>
              <td style="padding: 6px 0; font-size: 12px; text-align: right; font-family: monospace;">${invoice.payment.transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #666;">Payment Date</td>
              <td style="padding: 6px 0; font-size: 12px; text-align: right;">${formatDateTime(invoice.payment.paymentDate)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 12px; color: #666;">Payment Status</td>
              <td style="padding: 6px 0; font-size: 12px; text-align: right; font-weight: bold; color: #10b981;">${invoice.status.toUpperCase()}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; padding: 25px 0 0 0; border-top: 2px solid #333; margin-top: 20px;">
          <h2 style="margin: 0; font-size: 18px; color: #1a1a2e;">THANK YOU FOR YOUR PATRONAGE!</h2>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">Goods sold are not returnable unless defective.</p>
          <p style="margin: 15px 0 0 0; font-size: 10px; color: #999;">Powered by ChapterOne | www.chapterone.com.ng</p>
        </div>
      `;
      
      receiptContainer.innerHTML = receiptHTML;
      document.body.appendChild(receiptContainer);

      const canvas = await html2canvas(receiptContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Remove temporary container
      document.body.removeChild(receiptContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate how many pages needed
      const totalPages = Math.ceil(pdfHeight / pageHeight);
      
      if (totalPages <= 1) {
        // Single page - fits completely
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        // Multiple pages - slice the image correctly for each page
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
          if (pageNum > 0) {
            pdf.addPage();
          }
          
          // Calculate Y offset in mm for this page
          const yOffsetMM = pageNum * pageHeight;
          const remainingHeightMM = pdfHeight - yOffsetMM;
          const sliceHeightMM = Math.min(pageHeight, remainingHeightMM);
          
          // Convert to pixel coordinates for canvas slicing
          const scale = imgProps.height / pdfHeight;
          const sourceY = yOffsetMM * scale;
          const sourceHeight = sliceHeightMM * scale;
          
          // Create canvas to extract just this page's slice
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = imgProps.width;
          sliceCanvas.height = sourceHeight;
          
          const sliceCtx = sliceCanvas.getContext('2d');
          
          // Draw the specific slice from the original image
          const tempImg = new Image();
          tempImg.src = imgData;
          await new Promise(resolve => {
            tempImg.onload = () => {
              sliceCtx.drawImage(
                tempImg,
                0, sourceY, imgProps.width, sourceHeight,
                0, 0, imgProps.width, sourceHeight
              );
              resolve();
            };
          });
          
          const sliceData = sliceCanvas.toDataURL('image/png');
          pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidth, sliceHeightMM);
        }
      }

      pdf.save(`receipt_${invoice.id}.pdf`);

      if (downloadBtn) downloadBtn.innerHTML = originalBtnText;
    } catch (err) {
      console.error('PDF generation failed:', err);
      if (downloadBtn) downloadBtn.innerHTML = originalBtnText;
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="invoice-loading">
          <div className="loading-spinner"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-page">
        <div className="invoice-error">
          <div className="error-illustration">📋</div>
          <h3>Unable to Load Invoice</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchInvoice} className="btn-retry">Try Again</button>
            <button onClick={handleBack} className="btn-back">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-page">
        <div className="invoice-error">
          <div className="error-illustration">🔍</div>
          <h3>Invoice Not Found</h3>
          <button onClick={handleBack} className="btn-back">Go Back</button>
        </div>
      </div>
    );
  }

  return (
     <div className="col-lg-10 p-0 m-0">
    <div className="invoice-page">
      {/* Header */}
      <div className="invoice-header-section">
        <div className="header-left">
          <button className="back-btn" onClick={handleBack}>
            <span>←</span> Back
          </button>
        </div>
        <div className="header-right">
          <button className="download-btn" onClick={handleDownloadPDF}>
            <span>📥</span> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Container */}
      <div className="invoice-containe p-0 m-0" id="invoice-container">
        {/* Invoice Header */}
        <div className="invoice-main-header">
          <div className="company-brand">
            <div className="brand-logo">📦</div>
            <div className="brand-info">
              <h1>{settings?.site_name || 'ChapterOne Stationery'}</h1>
              <p style={{color:'white'}}>{settings?.store_address || '39 Ojuelegba Road, Tejuosho. Surulere. Lagos .'}</p>
            </div>
          </div>
          <div className="invoice-info">
            <div className="invoice-number">
              { /* <span className="label">Invoice</span> */}
              <span style={{color:'white'}} className="value">#{invoice.id}</span>
            </div>
            <div className="invoice-status">
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        </div>

          <div className="invoice-meta-grid">
          <div className="meta-card">
            <div className="meta-icon">📅</div>
            <div className="meta-content">
              <span className="meta-label">Issue Date</span>
              <span className="meta-value">{formatDate(invoice.issueDate)}</span>
            </div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">⏰</div>
            <div className="meta-content">
              <span className="meta-label">Due Date</span>
              <span className="meta-value">{formatDate(invoice.dueDate)}</span>
            </div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">🛒</div>
            <div className="meta-content">
              <span className="meta-label">Order</span>
              <span className="meta-value">{invoice.orderId}</span>
            </div>
          </div>
          <div className="meta-card highlight">
            <div className="meta-icon">💰</div>
            <div className="meta-content">
              <span className="meta-label">Total Amount</span>
              <span className="meta-value total">{formatPrice(invoice.amount)}</span>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="addresses-grid p-2">
          <div className="address-panel bill-to">
            <div className="panel-header">
              <span className="panel-icon">👤</span>
              <h3>Bill To</h3>
            </div>
            {/* {console.log(invoice.customer)} */}
            <div className="panel-body">
              {/* <p className="customer-name">{invoice.customer.name}</p> */}
              <p className="customer-detail">📧 {invoice.customer.email}</p>
              <p className="customer-detail">📞 {invoice.customer.phone}</p>
              <p className="customer-address">
                {invoice.customer.address.street}<br />
                {/* {invoice.customer.address.city}, {invoice.customer.address.state}<br /> */}
                {invoice.customer.address.country}
              </p>
            </div>
          </div>

          <div className="address-panel ship-to p-2">
            <div className="panel-header">
              <span className="panel-icon">🚚</span>
              <h3>Ship To</h3>
            </div>
            <div className="panel-body">
              <p className="shipping-method">{invoice.shipping.method}</p>
              <p className="customer-address">
                {invoice.shipping.address.street}<br />
                {/* {invoice.shipping.address.city}, {invoice.shipping.address.state}<br /> */}
                {invoice.shipping.address.country}
              </p>
              {invoice.shipping.trackingNumber && (
                <div className="tracking-box d-block">
                  <span className="tracking-label">Tracking:</span> <br/>
                  <span className="tracking-value w-100">{invoice.shipping.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table - Card-based Layout */}
        <div className="items-section">
          <h3 className="section-title">
            <span className="title-icon">📋</span>
            Order Items
            <span className="item-count">{invoice.items.length} {invoice.items.length === 1 ? 'item' : 'items'}</span>
          </h3>
          <div className="items-card-grid">
            {invoice.items.map((item, index) => (
              <div 
                key={item.id} 
                className="order-item-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="item-card-header">
                  <div className="product-image-wrapper">
                    <img 
                    style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px'}}
                      src={import.meta.env.VITE_API_URL + '/' + item.image} 
                      alt={item.name} 
                      onError={(e) => { 
                        e.target.src = 'https://via.placeholder.com/80x80?text=Product'; 
                      }} 
                    />
                    <div className="item-number">{index + 1}</div>
                  </div>
                  <div className="product-details">
                    <h4 className="product-name">{item.name}</h4>
                    {item.description && (
                      <p className="product-desc">{item.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="item-card-footer">
                  <div className="item-meta">
                    <div className="meta-block">
                      <span className="meta-label">Quantity</span>
                      <span className="qty-badge">{item.quantity}</span>
                    </div>
                    <div className="meta-block">
                      <span className="meta-label">Unit Price</span>
                      <span className="unit-price">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                  <div className="item-total">
                    <span className="total-label">Total</span>
                    <span className="total-value">{formatPrice(item.total)}</span>
                  </div>
                </div>
                
                <div className="item-card-bg-pattern"></div>
              </div>
            ))}
          </div>
          
          {/* Summary inline for items */}
          <div className="items-summary-bar">
            <div className="summary-stat">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Subtotal</span>
              <span className="stat-value">{formatPrice(invoice.subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-card d-block">
            <div>Order Summary</div>
            <div className="summary-lines  w-100 ">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatPrice(invoice.subtotal)}</span>
              </div>
              {invoice.shippingFee > 0 && (
                <div className="summary-line">
                  <span>Shipping</span>
                  <span>{formatPrice(invoice.shippingFee)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="summary-line">
                  <span>Tax</span>
                  <span>{formatPrice(invoice.tax)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="summary-line discount">
                  <span>Discount</span>
                  <span>-{formatPrice(invoice.discount)}</span>
                </div>
              )}
              <div className="summary-line total">
                <span>Total</span>
                <span>{formatPrice(invoice.amount)}</span>
              </div>
            </div>
          </div>

          <div className="payment-card summary-card d-block">
            <h3>Payment Details</h3>
            <div className="payment-lines">
              <div className="payment-line">
                <span>Method</span>
                <span>{invoice.payment.method}</span>
              </div>
              {invoice.payment.cardLast4 && (
                <div className="payment-line">
                  <span>Card</span>
                  <span>**** {invoice.payment.cardLast4}</span>
                </div>
              )}
              <div className="payment-line">
                <span>Transaction ID</span>
                <span className="transaction-id">{invoice.payment.transactionId}</span>
              </div>
              <div className="payment-line">
                <span>Date</span>
                <span>{formatDateTime(invoice.payment.paymentDate)}</span>
              </div>
              <div className="payment-line status">
                <span>Status</span>
                <span className="payment-status paid">✓ Paid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="thank-you-message">
            {/* <span className="thank-icon">💚</span> */}
            <p className="text-light">Thank you for your business!</p>
          </div>
          <div className="footer-contact">
            <span>📞 {settings?.store_phone || '+234 700 500 0000'}</span>
            <span>✉️ {settings?.store_email || ''}</span>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} {settings?.site_name || 'ChapterOne Stationery'}. All rights reserved.
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AccountInvoiceView;
