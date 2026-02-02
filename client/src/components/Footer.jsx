import { Link } from 'react-router-dom';
import { HiSparkles, HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    discover: [
      { label: 'Browse Hotels', path: '/hotels' },
      { label: 'Popular Destinations', path: '/hotels' },
      { label: 'Special Offers', path: '/hotels' },
      { label: 'Travel Guides', path: '#' },
    ],
    company: [
      { label: 'About Us', path: '#' },
      { label: 'Careers', path: '#' },
      { label: 'Press', path: '#' },
      { label: 'Blog', path: '#' },
    ],
    support: [
      { label: 'Help Center', path: '#' },
      { label: 'Contact Us', path: '#' },
      { label: 'FAQs', path: '#' },
      { label: 'Cancellation Policy', path: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '#' },
      { label: 'Terms of Service', path: '#' },
      { label: 'Cookie Policy', path: '#' },
    ],
  };

  const socialLinks = [
    { icon: FaFacebookF, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-secondary-900 text-white">
      {/* Main Footer Content */}
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                <HiSparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold font-display">HotelBook</span>
            </Link>
            <p className="text-secondary-400 text-sm leading-relaxed mb-6 max-w-sm">
              Discover and book your perfect stay with ease. We connect travelers with amazing hotels
              worldwide, offering the best prices and seamless booking experience.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:support@hotelbook.com" className="flex items-center gap-3 text-secondary-400 hover:text-white transition-colors text-sm">
                <HiMail className="h-4 w-4 flex-shrink-0" />
                support@hotelbook.com
              </a>
              <a href="tel:+18001234567" className="flex items-center gap-3 text-secondary-400 hover:text-white transition-colors text-sm">
                <HiPhone className="h-4 w-4 flex-shrink-0" />
                +1 (800) 123-4567
              </a>
              <div className="flex items-start gap-3 text-secondary-400 text-sm">
                <HiLocationMarker className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>123 Travel Street, Suite 100<br />San Francisco, CA 94102</span>
              </div>
            </div>
          </div>

          {/* Discover Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Discover</h4>
            <ul className="space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-secondary-400 hover:text-white transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-secondary-400 hover:text-white transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-secondary-400 hover:text-white transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-secondary-400 hover:text-white transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-800">
        <div className="container-custom py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-secondary-400 text-center sm:text-left">
              &copy; {currentYear} HotelBook. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-secondary-800 hover:bg-secondary-700 flex items-center justify-center text-secondary-400 hover:text-white transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
