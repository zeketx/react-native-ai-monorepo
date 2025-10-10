import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

const DiscoveryHero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [travelers, setTravelers] = useState('2 travelers');

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/api/placeholder/1920/1080" 
          alt="Coastal Discovery"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      </div>

      {/* Floating Elements - Discovery Theme */}
      <div className="absolute top-20 right-20 animate-float">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-16 animate-float-delayed">
        <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center">
          <MapPin className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Hero Title */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Next Adventure
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Explore breathtaking destinations with our AI-powered travel platform. 
            Every journey begins with a single search.
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Destination Search */}
            <div className="relative">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Where to?
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div className="relative">
              <label className="block text-white/80 text-sm font-medium mb-2">
                When?
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  placeholder="Add dates"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Travelers */}
            <div className="relative">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Who?
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all backdrop-blur-sm appearance-none"
                >
                  <option value="1 traveler">1 traveler</option>
                  <option value="2 travelers">2 travelers</option>
                  <option value="3 travelers">3 travelers</option>
                  <option value="4+ travelers">4+ travelers</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Discover
              </button>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm hover:bg-white/30 transition-all cursor-pointer">
              🏖️ Beach Escapes
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm hover:bg-white/30 transition-all cursor-pointer">
              🏔️ Mountain Adventures
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm hover:bg-white/30 transition-all cursor-pointer">
              🏛️ Cultural Journeys
            </span>
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm hover:bg-white/30 transition-all cursor-pointer">
              🌆 City Breaks
            </span>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-2">10M+</div>
            <div className="text-blue-200 text-sm">Happy Travelers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">150+</div>
            <div className="text-blue-200 text-sm">Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-blue-200 text-sm">Support</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">4.9★</div>
            <div className="text-blue-200 text-sm">Rating</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryHero;