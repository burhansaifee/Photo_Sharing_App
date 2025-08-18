// src/pages/LandingPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './LandingPage.css';


export default function LandingPage({ user }) {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    phone: '',
    message: '',
    agreed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! (Form submission is not implemented)');
    console.log(formData);
  };


  return (
    <div className="landing-page">
      {/* Home Section */}
      <section id="home">
        <div className="hero-slider ">
            <Slider {...sliderSettings}>
            <div>
                <div className="hero-section" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1364&q=80')` }}>
                <h1 >Share Your Moments</h1>
                <p>The best place for photographers and clients to connect.</p>
                {!user && <Link to="/login" className="btn btn-accent">Get Started</Link>}
                </div>
            </div>
            <div>
                <div className="hero-section" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1505238680356-667803448bb6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')` }}>
                <h1>Beautiful, Private Albums</h1>
                <p>Effortlessly upload and organize your photos.</p>
                {!user && <Link to="/login" className="btn btn-accent">Get Started</Link>}
                </div>
            </div>
            <div>
                <div className="hero-section" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1554080353-a576cf803bda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')` }}>
                <h1>Securely Share with Clients</h1>
                <p>Privacy and security you can trust.</p>
                {!user && <Link to="/login" className="btn btn-accent">Get Started</Link>}
                </div>
            </div>
            </Slider>
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Easy Uploads</h3>
            <p>Effortlessly upload and organize your photos into beautiful, private albums.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Sharing</h3>
            <p>Share albums with specific clients using unique IDs, ensuring privacy and security.</p>
          </div>
          <div className="feature-card">
            <h3>Client Collaboration</h3>
            <p>Allow clients to view, download, and even share albums with their family and friends.</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"PhotoShare has revolutionized how I deliver photos to my clients. It's simple, elegant, and professional."</p>
            <h4>- Alex Johnson, Wedding Photographer</h4>
          </div>
          <div className="testimonial-card">
            <p>"As a client, I love how easy it is to view and download my photos. The interface is beautiful and intuitive."</p>
            <h4>- Sarah Lee, Happy Client</h4>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-content-section page-container">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-statement">
            Welcome to PhotoShare, the seamless solution for photographers to share their work with clients. 
            Our platform is designed to be simple, secure, and beautiful, allowing you to create private albums, 
            upload high-quality images, and share them effortlessly with clients or other stakeholders.
            </p>
        </div>
        <div className="team-section">
            <div className="page-container">
                <h2 className="section-title">Meet the Team</h2>
                <div className="team-grid">
                    <div className="team-member-card">
                        <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" alt="Team Member 1" />
                        <h3>John Doe</h3>
                        <p>Lead Developer</p>
                    </div>
                    <div className="team-member-card">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" alt="Team Member 2" />
                        <h3>Jane Smith</h3>
                        <p>UI/UX Designer</p>
                    </div>
                    <div className="team-member-card">
                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" alt="Team Member 3" />
                        <h3>Peter Jones</h3>
                        <p>Project Manager</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <div className="contact-page-container">
            <div className="contact-info-panel">
                <h3>Get in touch</h3>
                <div className="contact-info-section">
                    <h4>Visit us</h4>
                    <p>Come say hello at our office HQ.</p>
                    <p>67 Wisteria Way Croydon South VIC 3136 AU</p>
                </div>
                <div className="contact-info-section">
                    <h4>Chat to us</h4>
                    <p>Our friendly team is here to help.</p>
                    <a href="mailto:support@photoshare.com">support@photoshare.com</a>
                </div>
                <div className="contact-info-section">
                    <h4>Call us</h4>
                    <p>Mon-Fri from 8am to 5pm</p>
                    <a href="tel:+995555555555">(+995) 555-55-55-55</a>
                </div>
            </div>
            <div className="contact-form-panel">
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label" htmlFor="firstName">First Name</label>
                        <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="lastName">Last Name</label>
                        <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="form-group full-width">
                        <label className="form-label" htmlFor="message">Message</label>
                        <textarea name="message" id="message" value={formData.message} onChange={handleChange} className="form-input form-textarea" required />
                    </div>
                </div>
                <div className="checkbox-group">
                    <input type="checkbox" name="agreed" id="agreed" checked={formData.agreed} onChange={handleChange} required />
                    <label htmlFor="agreed">
                        I agree to the <a href="#">Privacy Policy</a>
                    </label>
                </div>
                <button type="submit" className="btn">Send Message</button>
            </form>
            </div>
        </div>
      </section>
    </div>
  );
}