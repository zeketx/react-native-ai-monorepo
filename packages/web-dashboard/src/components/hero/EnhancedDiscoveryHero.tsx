import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Users, Compass, Sparkles, Globe, Camera } from 'lucide-react';
import './hero-animations.css';

interface FloatingElement {
  id: number;
  icon: React.ReactNode;
  x: number;
  y: number;
  delay: number;
  size: number;
}

const EnhancedDiscoveryHero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [travelers, setTravelers] = useState('2 travelers');
  const [isSearching, setIsSearching] = useState(false);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  // Generate floating discovery elements
  useEffect(() => {
    const elements: FloatingElement[] = [
      { id: 1, icon: <Search className="w-6 h-6 text-white" />, x: 85, y: 15, delay: 0, size: 60 },
      { id: 2, icon: <MapPin className="w-5 h-5 text-white" />, x: 15, y: 75, delay: 2, size: 50 },
      { id: 3, icon: <Compass className="w-5 h-5 text-white" />, x: 90, y: 60, delay: 4, size: 45 },
      { id: 4, icon: <Globe className="w-4 h-4 text-white" />, x: 10, y: 25, delay: 1, size: 40 },
      { id: 5, icon: <Camera className="w-4 h-4 text-white" />, x: 85, y: 85, delay: 3, size: 40 },
      { id: 6, icon: <Sparkles className="w-3 h-3 text-white" />, x: 20, y: 50, delay: 5, size: 30 },
    ];
    setFloatingElements(elements);
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      // Here you would typically trigger navigation or show results
    }, 2000);
  };

  const popularDestinations = [
    { name: 'Santorini, Greece', emoji: '🏛️', gradient: 'from-blue-400 to-cyan-300' },
    { name: 'Bali, Indonesia', emoji: '🌴', gradient: 'from-green-400 to-emerald-300' },
    { name: 'Patagonia, Chile', emoji: '🏔️', gradient: 'from-slate-400 to-slate-300' },
    { name: 'Maldives', emoji: '🏖️', gradient: 'from-blue-300 to-teal-300' },
  ];

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background with Parallax */}
      <div className="absolute inset-0 z-0 parallax-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-700"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Animated Wave Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
          <svg viewBox="0 0 1200 120" className="w-full h-full">
            <path 
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 V120 H0 V60 Z" 
              fill="rgba(255,255,255,0.1)"
              className="animate-pulse"
            />
            <path 
              d="M0,80 C300,20 600,100 900,40 C1050,10 1150,70 1200,40 V120 H0 V80 Z" 
              fill="rgba(255,255,255,0.05)"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* Floating Discovery Elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute pointer-events-none animate-float depth-2"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            width: `${element.size}px`,
            height: `${element.size}px`,
          }}
        >
          <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover-glow">
            {element.icon}
          </div>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-7xl mx-auto animate-slide-up">
        {/* Hero Title with Enhanced Typography */}
        <div className="mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center animate-pulse-glow">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-blue-300 font-semibold tracking-wide">DISCOVERY AWAITS</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            <span className="inline-block animate-shimmer">
              Discover Your
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 animate-pulse">
              Next Adventure
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
            Explore breathtaking destinations with our AI-powered travel platform. 
            <span className="text-cyan-300 font-medium"> Every journey begins with a single search.</span>
          </p>
        </div>

        {/* Enhanced Search Interface */}
        <div className="search-interface rounded-3xl p-8 mb-12 hover-lift">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Destination Search */}
            <div className="relative group">
              <label className="block text-white/90 text-sm font-semibold mb-3 text-left">
                <MapPin className="w-4 h-4 inline mr-2" />
                Where to?
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-cyan-300 transition-colors" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
                {destination && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-lg rounded-lg border border-white/30 p-3 space-y-2">
                    {popularDestinations.map((dest, idx) => (
                      <div 
                        key={idx}
                        className="quick-tag flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                        onClick={() => setDestination(dest.name)}
                      >
                        <span className="text-2xl">{dest.emoji}</span>
                        <span className="text-white font-medium">{dest.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Selection */}
            <div className="relative group">
              <label className="block text-white/90 text-sm font-semibold mb-3 text-left">
                <Calendar className="w-4 h-4 inline mr-2" />
                When?
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-cyan-300 transition-colors" />
                <input
                  type="text"
                  placeholder="Add dates"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Travelers */}
            <div className="relative group">
              <label className="block text-white/90 text-sm font-semibold mb-3 text-left">
                <Users className="w-4 h-4 inline mr-2" />
                Who?
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-cyan-300 transition-colors" />
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-4 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all appearance-none"
                >
                  <option value="1 traveler">1 traveler</option>
                  <option value="2 travelers">2 travelers</option>
                  <option value="3 travelers">3 travelers</option>
                  <option value="4+ travelers">4+ travelers</option>
                </select>
              </div>
            </div>

            {/* Enhanced Search Button */}
            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="discovery-button w-full py-4 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Discovering...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Discover
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Quick Tags */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { emoji: '🏖️', text: 'Beach Escapes', gradient: 'from-blue-400 to-cyan-400' },
              { emoji: '🏔️', text: 'Mountain Adventures', gradient: 'from-green-400 to-emerald-400' },
              { emoji: '🏛️', text: 'Cultural Journeys', gradient: 'from-purple-400 to-pink-400' },
              { emoji: '🌆', text: 'City Breaks', gradient: 'from-orange-400 to-red-400' },
            ].map((tag, idx) => (
              <span 
                key={idx}
                className={`quick-tag px-6 py-3 bg-gradient-to-r ${tag.gradient} bg-opacity-20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium hover-lift cursor-pointer flex items-center gap-2`}
              >
                <span className="text-lg">{tag.emoji}</span>
                {tag.text}
              </span>
            ))}
          </div>
        </div>

        {/* Trust Indicators with Enhanced Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10M+', label: 'Happy Travelers', icon: <Users className="w-6 h-6 text-blue-400" /> },
            { value: '150+', label: 'Countries', icon: <Globe className="w-6 h-6 text-emerald-400" /> },
            { value: '24/7', label: 'Support', icon: <Sparkles className="w-6 h-6 text-purple-400" /> },
            { value: '4.9★', label: 'Rating', icon: <Search className="w-6 h-6 text-yellow-400" /> },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl hover-lift group">
              <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {stat.value}
              </div>
              <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce depth-5">
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-sm font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDiscoveryHero;