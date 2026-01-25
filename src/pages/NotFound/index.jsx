import React from 'react';
import './style.css';

export default function NotFound(){
  return (
    <section className="notfound-page section-padding">
      <div className="container text-center">
        <h2 className="section-title">404 — Not Found</h2>
        <p>The page you are looking for does not exist.</p>
      </div>
    </section>
  );
}
