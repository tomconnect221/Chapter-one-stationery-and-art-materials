import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyPayment = ({ reference: propReference, onVerified }) => {
  const [status, setStatus] = useState('idle');
  const [reference, setReference] = useState(propReference || localStorage.getItem('payment_reference'));
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!reference) return;
    const verify = async () => {
      setStatus('verifying');
      try {
        const token = localStorage.getItem('auth_token');
        // Attempt to call verify endpoint - adjust URL if your API differs
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/verify-payment?reference=${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          setStatus('success');
          setDetails(res.data.data || null);
          toast.success(res.data.message || 'Payment verified');
          if (onVerified) onVerified(res.data.data);
        } else {
          setStatus('failed');
          toast.error(res.data.message || 'Payment verification failed');
        }
      } catch (err) {
        setStatus('failed');
        toast.error(err.response?.data?.message || 'Verification request failed');
      }
    };

    verify();
  }, [reference, propReference, onVerified]);

  if (!reference) return (
    <div className="verify-payment">
      <p>No payment reference found. Please complete payment first.</p>
    </div>
  );

  return (
    <div className="verify-payment">
      <h3>Verifying payment</h3>
      <p>Reference: {reference}</p>
      {status === 'verifying' && <p>Checking payment status...</p>}
      {status === 'success' && <p>Payment verified ✔️</p>}
      {status === 'failed' && <p>Payment not verified ❌</p>}
    </div>
  );
};

export default VerifyPayment;
