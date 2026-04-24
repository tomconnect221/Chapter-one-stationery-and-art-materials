import React from 'react';
import useSettings from '../hooks/useSettings';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const { settings } = useSettings();
  console.log(settings);
  const phoneNumber = settings?.whatsapp || "1234567890"; // Replace with actual field if different

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      title="Chat with us on WhatsApp"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
    </a>
  );
};

export default WhatsAppButton;