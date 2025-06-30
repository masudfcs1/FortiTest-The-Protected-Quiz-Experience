'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, Users, Menu, X, Sun, Moon, CheckCircle, ArrowRight, Play, Zap, Globe, Clock, Smartphone, Code, BarChart3, UserCheck, Download, Github, Twitter, Mail, Heart } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  gradient?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay, gradient = "from-blue-500/20 to-purple-500/20" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      <div className="group relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <div className="relative z-10">
          <div className="text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-300 transition-colors duration-300">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-100 transition-colors duration-300">{description}</p>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  number: string;
  label: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ number, label, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      <div className="text-center group">
        <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
          {number}
        </div>
        <div className="text-gray-600 dark:text-gray-300 font-medium">{label}</div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'dark bg-gradient-to-br from-gray-900 via-slate-900 to-black' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Enhanced Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/10 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-black/20' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                QuizGuard
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Features</a>
              <a href="#security" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Security</a>
              <a href="#stats" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Stats</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium">Pricing</a>
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
                Get Started
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-white/10 dark:bg-gray-900/90 backdrop-blur-xl`}>
          <div className="px-4 py-6 space-y-4">
            <a href="#features" className="block text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium py-2">Features</a>
            <a href="#security" className="block text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium py-2">Security</a>
            <a href="#stats" className="block text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium py-2">Stats</a>
            <a href="#pricing" className="block text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium py-2">Pricing</a>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors font-medium py-2"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold mt-4">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="transform transition-all duration-1000 translate-y-0 opacity-100">
            <div className="inline-flex items-center space-x-3 bg-white/10 dark:bg-gray-800/30 rounded-full px-6 py-3 mb-12 backdrop-blur-xl border border-white/20 shadow-lg">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-sm font-semibold text-gray-700 dark:text-white">Privacy-First Quiz Platform</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-12 leading-tight">
              <span className="bg-gradient-to-r from-pink-200 via-blue-300 to-purple-300 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Secure Quiz
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Revolution
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-200 mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
              Experience the future of secure learning with military-grade encryption, zero-knowledge architecture, and beautiful design that puts your privacy first.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <button className="group bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
                <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                <span>Start Quiz Now</span>
              </button>
              <button className="group bg-white/10 dark:bg-gray-800/30 text-gray-800 dark:text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-xl border border-white/20 flex items-center space-x-3 hover:shadow-xl">
                <Shield className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Security Details</span>
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-300">
              <div className="flex items-center space-x-3 bg-white/5 dark:bg-gray-800/20 px-4 py-2 rounded-full backdrop-blur-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/5 dark:bg-gray-800/20 px-4 py-2 rounded-full backdrop-blur-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium">Zero Data Collection</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/5 dark:bg-gray-800/20 px-4 py-2 rounded-full backdrop-blur-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium">Open Source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 dark:bg-gray-800/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Trusted Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join millions of users who trust QuizGuard with their most sensitive educational content.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="2M+" label="Active Users" delay={100} />
            <StatCard number="50M+" label="Quizzes Created" delay={200} />
            <StatCard number="99.9%" label="Uptime" delay={300} />
            <StatCard number="256-bit" label="Encryption" delay={400} />
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Revolutionary Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience the next generation of secure quiz platforms with cutting-edge features designed for privacy, security, and user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={<Lock className="w-10 h-10" />}
              title="End-to-End Encryption"
              description="Military-grade AES-256 encryption ensures your quiz data is protected before it ever leaves your device. Even we can't access your content."
              delay={100}
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            <FeatureCard
              icon={<Eye className="w-10 h-10" />}
              title="Zero Tracking Promise"
              description="No cookies, no analytics, no fingerprinting, no tracking pixels. Your quiz activity remains completely private and anonymous."
              delay={200}
              gradient="from-purple-500/20 to-pink-500/20"
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10" />}
              title="Secure Link Sharing"
              description="Share quizzes with cryptographically secure links that auto-expire and can be password-protected for maximum security."
              delay={300}
              gradient="from-green-500/20 to-teal-500/20"
            />
            <FeatureCard
              icon={<Users className="w-10 h-10" />}
              title="Anonymous Participation"
              description="Take quizzes without creating accounts, providing email addresses, or sharing any personal information whatsoever."
              delay={400}
              gradient="from-orange-500/20 to-red-500/20"
            />
            <FeatureCard
              icon={<Smartphone className="w-10 h-10" />}
              title="Cross-Platform Sync"
              description="Seamlessly sync your quizzes across all devices with end-to-end encryption maintaining your privacy everywhere."
              delay={500}
              gradient="from-violet-500/20 to-purple-500/20"
            />
            <FeatureCard
              icon={<Globe className="w-10 h-10" />}
              title="Offline Capability"
              description="Take and create quizzes even without internet connection. All data is encrypted and synced when you're back online."
              delay={600}
              gradient="from-indigo-500/20 to-blue-500/20"
            />
            <FeatureCard
              icon={<BarChart3 className="w-10 h-10" />}
              title="Advanced Analytics"
              description="Get detailed insights into quiz performance with privacy-preserving analytics that never leave your device."
              delay={700}
              gradient="from-emerald-500/20 to-green-500/20"
            />
            <FeatureCard
              icon={<Clock className="w-10 h-10" />}
              title="Smart Time Limits"
              description="Set intelligent time limits with grace periods and automatic extensions for accessibility and fairness."
              delay={800}
              gradient="from-amber-500/20 to-yellow-500/20"
            />
            <FeatureCard
              icon={<Code className="w-10 h-10" />}
              title="Open Source Transparency"
              description="Full source code transparency with regular third-party security audits. Verify our security claims yourself."
              delay={900}
              gradient="from-slate-500/20 to-gray-500/20"
            />
          </div>
        </div>
      </section>

      {/* Enhanced Security Section */}
      <section id="security" className="py-32 px-4 sm:px-6 lg:px-8 bg-white/5 dark:bg-gray-800/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black mb-10 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Unbreakable Security
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
                Your privacy is sacred. We employ the same encryption standards used by governments, banks, and Fortune 500 companies to protect your most sensitive data.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mt-1 backdrop-blur-lg">
                    <CheckCircle className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">AES-256 Encryption</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">The gold standard in encryption technology, trusted by intelligence agencies and banks worldwide for protecting classified information.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mt-1 backdrop-blur-lg">
                    <CheckCircle className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Zero-Knowledge Architecture</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">We literally cannot access your data, even if compelled by law enforcement. Your encryption keys never leave your devices.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mt-1 backdrop-blur-lg">
                    <CheckCircle className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">Continuous Security Monitoring</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">24/7 threat detection with monthly penetration testing by leading cybersecurity firms ensures your data stays protected.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300">Initializing secure connection...</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" style={{animationDelay: '0.5s'}}></div>
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300">Generating 256-bit encryption keys...</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{animationDelay: '1s'}}></div>
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300">Establishing secure tunnel...</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" style={{animationDelay: '1.5s'}}></div>
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300">Verifying certificate chain...</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                    <span className="text-sm font-mono text-green-400 font-bold">✓ Connection secured with AES-256-GCM</span>
                  </div>
                  <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <p className="text-xs font-mono text-green-400">Security Level: MAXIMUM</p>
                    <p className="text-xs font-mono text-gray-400 dark:text-gray-300 mt-1">Threat Detection: ACTIVE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-12 backdrop-blur-xl border border-white/20 shadow-2xl">
            <h2 className="text-5xl md:text-6xl font-black mb-10 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Join the Revolution
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join millions of educators, students, and organizations who have chosen QuizGuard as their trusted platform for secure, private, and beautiful quiz experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button className="group bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white px-16 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3">
                <span>Start Creating Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors flex items-center space-x-3 font-bold text-lg">
                <Github className="w-6 h-6" />
                <span>View on GitHub</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
              <div className="flex items-center space-x-2 bg-white/10 dark:bg-gray-800/30 px-4 py-2 rounded-full backdrop-blur-lg">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-gray-600 dark:text-gray-300">Made with love</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 dark:bg-gray-800/30 px-4 py-2 rounded-full backdrop-blur-lg">
                <Download className="w-4 h-4 text-blue-400" />
                <span className="text-gray-600 dark:text-gray-300">Free forever</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 dark:bg-gray-800/30 px-4 py-2 rounded-full backdrop-blur-lg">
                <UserCheck className="w-4 h-4 text-green-400" />
                <span className="text-gray-600 dark:text-gray-300">No registration required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 dark:bg-gray-800/20 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  QuizGuard
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed max-w-md">
                The world&#39;s most secure quiz platform. Built with privacy by design, open source, and audited by security experts worldwide.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-blue-500/20 rounded-xl flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-purple-500/20 rounded-xl flex items-center justify-center transition-colors">
                  <Github className="w-5 h-5 text-gray-400 hover:text-purple-400" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-green-500/20 rounded-xl flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5 text-gray-400 hover:text-green-400" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
                <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-500 transition-colors">Security</a>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>© 2025 QuizGuard. Built with privacy by design. Open source and auditable.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;