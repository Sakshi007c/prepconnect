import React from 'react';
import { BookOpen, Twitter, Github, Linkedin, ArrowRight } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold">PrepConnect</span>
          </div>
          <p className="text-gray-500 mb-6">
            A community-driven platform to share real interview experiences, preparation strategies, and connect with mentors.
          </p>
          <div className="flex gap-4">
            <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
            <Github className="w-5 h-5 text-gray-400 hover:text-black cursor-pointer" />
            <Linkedin className="w-5 h-5 text-gray-400 hover:text-blue-700 cursor-pointer" />
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6">Community</h4>
          <ul className="space-y-4 text-gray-500">
            <li><a href="#" className="hover:text-blue-600">Recent Experiences</a></li>
            <li><a href="#" className="hover:text-blue-600">Top Mentors</a></li>
            <li><a href="#" className="hover:text-blue-600">Discussion Forums</a></li>
            <li><a href="#" className="hover:text-blue-600">Write a Post</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-gray-500">
            <li><a href="#" className="hover:text-blue-600">About Us</a></li>
            <li><a href="#" className="hover:text-blue-600">Careers</a></li>
            <li><a href="#" className="hover:text-blue-600">Guidelines</a></li>
            <li><a href="#" className="hover:text-blue-600">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Weekly Digest</h4>
          <p className="text-gray-500 mb-4 text-sm">Get the best interview experiences delivered to your inbox.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
        <p>© 2026 PrepConnect. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
          <a href="#" className="hover:text-gray-600">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;