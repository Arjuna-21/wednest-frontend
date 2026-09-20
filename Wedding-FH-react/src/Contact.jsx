import React from 'react'
import './Contact.css'
import Navbar from './Navbar'

function Contact() {
  return (
    <div className='contact-page'>
        <Navbar />
        <h1>Contact Us</h1>
        <p>Have a question? We would love to hear from you</p>
        <div class="contact-container">
            <div class="contact-info">
                <h2>Get In Touch</h2>
                <p>📞  +91 63051 85993</p>
                <p>📧 support@wednest.com</p>

                <h3>Follow us</h3>
                <div className='social-links'>
                    <a href="#">Instagram</a>
                    <a href="#">Facebook</a>
                    <a href="#">YouTube</a>
                </div>
            </div>
            <div class="contact-form">
                <h2>Send us a message</h2>
                <form>
                    <input type="text" placeholder='Your Name' />
                    <input type="email" placeholder='Your Email' />
                    <textarea name="" placeholder='Your Message' rows="5" id=""></textarea>
                    <button>Send Message</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Contact