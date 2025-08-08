import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: '#18B497',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
    marginTop: 'auto'
  };

  const quickLinksStyle = {
    listStyleType: 'none',
    margin: '0',
    padding: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px'
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
  };

  return (
    <footer style={footerStyle}>
      <div>
        <p>MYPropertyWise</p>
        <p>PTD 64888, Jalan Selatan Utama, KM 15, Off, Skudai Lbh, 81300 Skudai, Johor</p>
        <p>+6012-3642845</p>
        <p>support@PropertyWise.com</p>
      </div>
      <div>
        <ul style={quickLinksStyle}>
          <li><a href="/" style={linkStyle}>Home</a></li>
          <li><a href="/search-results" style={linkStyle}>Listings</a></li>
          <li><a href="/comparison" style={linkStyle}>Comparison</a></li>     
          <li><a href="/affordability-calculator" style={linkStyle}>Affordability Calculator</a></li>
          <li><a href="/chat" style={linkStyle}>Property Assistant</a></li>
          <li><a href="/about" style={linkStyle}>About</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
