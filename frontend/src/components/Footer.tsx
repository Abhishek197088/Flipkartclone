import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-fk-dark text-gray-400 text-xs py-8 mt-12 border-t border-gray-800">
      <div className="max-w-[1248px] mx-auto px-4 grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
        
        <div>
          <h4 className="text-gray-300 font-semibold mb-3 uppercase text-[10px]">About</h4>
          <ul className="space-y-2 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Flipkart Stories</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-300 font-semibold mb-3 uppercase text-[10px]">Help</h4>
          <ul className="space-y-2 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">Payments</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-300 font-semibold mb-3 uppercase text-[10px]">Consumer Policy</h4>
          <ul className="space-y-2 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">Return Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms Of Use</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-300 font-semibold mb-3 uppercase text-[10px]">Social</h4>
          <ul className="space-y-2 font-medium">
            <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
            <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
          </ul>
        </div>

        <div className="border-l border-gray-700 pl-4 col-span-2 space-y-4">
          <div>
            <h4 className="text-gray-300 font-semibold mb-1 uppercase text-[10px]">Mail Us:</h4>
            <p className="leading-5 text-gray-400 font-medium">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103, Karnataka, India
            </p>
          </div>
        </div>

      </div>

      <div className="border-t border-gray-800 pt-6 text-center text-gray-500 max-w-[1248px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>© 2007-2026 Flipkart.com. Developed for SDE Intern Assignment.</span>
        <div className="flex gap-4">
          <span className="hover:text-gray-300 transition-colors">Become a Seller</span>
          <span className="hover:text-gray-300 transition-colors">Advertise</span>
          <span className="hover:text-gray-300 transition-colors">Gift Cards</span>
          <span className="hover:text-gray-300 transition-colors">Help Center</span>
        </div>
      </div>
    </footer>
  );
}
