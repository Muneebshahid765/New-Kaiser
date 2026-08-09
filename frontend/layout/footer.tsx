import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SocialIconProps {
  children: React.ReactNode;
  href: string;
  label: string;
}

interface HoursItemProps {
  day: string;
  time: string;
}

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ children, href, label }) => (
  <a
    href={href}
    aria-label={label}
    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 text-white hover:bg-white hover:text-[#b8956a] hover:-translate-y-1"
  >
    {children}
  </a>
);

const HoursItem: React.FC<HoursItemProps> = ({ day, time }) => (
  <div className="flex items-start gap-3">
    <svg
      className="flex-shrink-0 text-white/80 mt-0.5"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
    <div>
      <p className="font-medium text-white m-0 text-[0.9375rem]">{day}</p>
      <p className="text-white/90 m-0 text-[0.875rem]">{time}</p>
    </div>
  </div>
);

const ContactItem: React.FC<ContactItemProps> = ({ icon, label, value, isLink = false, href }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 text-white/80 mt-0.5">{icon}</div>
    <div>
      <p className="font-medium text-white m-0 text-[0.9375rem]">{label}</p>
      {isLink && href ? (
        <a href={href} className="text-white/90 no-underline text-[0.875rem] hover:text-white hover:underline transition-colors duration-200">
          {value}
        </a>
      ) : (
        <p className="text-white/90 m-0 text-[0.875rem] leading-relaxed">{value}</p>
      )}
    </div>
  </div>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#b8956a] text-white w-full">
      <div className="max-w-[1280px] mx-auto px-4 py-12 md:px-8 lg:px-12 lg:py-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-6 lg:gap-12 mb-12">
          
          {/* Column 1: Brand & Description */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#b8956a] font-bold text-xl">AK</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white m-0 leading-tight">Africa Kaiser</h3>
                <p className="text-sm text-white/80 m-0">Building Materials</p>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-white/90 m-0">
              We are a leading provider of high-quality building materials, committed to delivering excellence and efficiency in every project.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3 flex-wrap">
              <SocialIcon href="#" label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col">
            <h4 className="text-[1.125rem] font-semibold text-white m-0 mb-6">Quick Links</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li>
                <Link href="/" className="text-white/90 no-underline text-[0.9375rem] transition-all duration-200 hover:text-white hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/90 no-underline text-[0.9375rem] transition-all duration-200 hover:text-white hover:translate-x-1 inline-block">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/90 no-underline text-[0.9375rem] transition-all duration-200 hover:text-white hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/90 no-underline text-[0.9375rem] transition-all duration-200 hover:text-white hover:translate-x-1 inline-block">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/90 no-underline text-[0.9375rem] transition-all duration-200 hover:text-white hover:translate-x-1 inline-block">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Business Hours */}
          <div className="flex flex-col">
            <h4 className="text-[1.125rem] font-semibold text-white m-0 mb-6">Business Hours</h4>
            <div className="flex flex-col gap-4">
              <HoursItem day="Monday - Friday" time="8:00 AM - 5:00 PM" />
              <HoursItem day="Saturday" time="9:00 AM - 1:00 PM" />
              <HoursItem day="Sunday" time="Closed" />
            </div>
          </div>

          {/* Column 4: Contact Info */}
          <div className="flex flex-col">
            <h4 className="text-[1.125rem] font-semibold text-white m-0 mb-6">Contact Us</h4>
            <div className="flex flex-col gap-5">
              <ContactItem
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
                label="Email"
                value="info@akaiser.com"
                isLink={true}
                href="mailto:info@akaiser.com"
              />
              <ContactItem
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                }
                label="Phone"
                value="+123 456 7890"
                isLink={true}
                href="tel:+1234567890"
              />
              <ContactItem
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                }
                label="Address"
                value="123 Business Street, City, Country"
              />
            </div>
          </div>
        </div>

        {/* Trust Badges / Company Logos Section */}
        <div className="my-8 py-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
            <div className="flex flex-col items-center gap-2 text-center group">
              <div className="w-[50px] h-[50px] md:w-[50px] md:h-[50px] flex items-center justify-center bg-white/10 rounded-full transition-all duration-300 group-hover:scale-105">
                <Image 
                  src="/logo/logo2.webp" 
                  alt="Quality Award" 
                  width={50} 
                  height={50} 
                  className="w-[50px] h-[50px] object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center group">
              <div className="w-[50px] h-[50px] md:w-[50px] md:h-[50px] flex items-center justify-center bg-white/10 rounded-full transition-all duration-300 group-hover:scale-105">
                <Image 
                  src="/logo/logo1.webp" 
                  alt="ISO Certified" 
                  width={50} 
                  height={50} 
                  className="w-[50px] h-[50px] object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center group">
              <div className="w-[50px] h-[50px] md:w-[50px] md:h-[50px] flex items-center justify-center bg-white/10 rounded-full transition-all duration-300 group-hover:scale-105">
                <Image 
                  src="/logo/logo3.webp" 
                  alt="Trusted Partner" 
                  width={50} 
                  height={50} 
                  className="w-[50px] h-[50px] object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/20 my-8" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-white/80 text-sm m-0">
            © A. Kaiser. All Rights Reserved 2024
          </p>
          {/* Uncomment if needed */}
          {/* <div className="flex items-center gap-3 text-sm">
            <Link href="/privacy" className="text-white/80 no-underline hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <span className="text-white/50">•</span>
            <Link href="/terms" className="text-white/80 no-underline hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;