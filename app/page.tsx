'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Eye, 
  Shield, 
  Lightbulb, 
  BarChart4, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Users, 
  Zap, 
  Clock,
  ExternalLink
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [showFallback, setShowFallback] = useState(false);
  
  // Show fallback buttons if Clerk doesn't load within 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) setShowFallback(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoaded]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="relative h-10 w-10 mr-2">
                  <Image
                    src="/images/Mini Logo OphthalmoScan.png"
                    alt="OphthalmoScan Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  OphthalmoScan
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-teal-600 transition-colors px-1 py-2 text-sm font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-teal-600 transition-colors px-1 py-2 text-sm font-medium">
                How It Works
              </a>
              <a href="#about" className="text-gray-600 hover:text-teal-600 transition-colors px-1 py-2 text-sm font-medium">
                About
              </a>
              <a href="#internship" className="text-gray-600 hover:text-teal-600 transition-colors px-1 py-2 text-sm font-medium">
                Internship
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <SignedOut>
                <div className="flex gap-3">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 border border-gray-200 rounded-md hover:bg-gray-50 transition duration-150 ease-in-out">
                      Sign In
                    </button>
                  </SignInButton>
                  
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-md hover:from-teal-700 hover:to-blue-700 transition duration-150 ease-in-out shadow-sm">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-md hover:from-teal-700 hover:to-blue-700 transition duration-150 ease-in-out shadow-sm"
                  >
                    Go to Dashboard
                  </button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_50%,rgba(13,148,136,0.06)_0%,rgba(13,148,136,0)_100%)]" />
          <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-teal-600/10 ring-1 ring-teal-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-2xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                  Revolutionizing Eye Care with 
                  <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent"> AI-Powered Diagnosis</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                  OphthalmoScan is an advanced ophthalmology diagnostic support system that combines cutting-edge AI technology with medical expertise to improve eye care efficiency and accessibility.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-md shadow-sm hover:from-teal-700 hover:to-blue-700 transition-all duration-200 w-full sm:w-auto">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-md shadow-sm hover:from-teal-700 hover:to-blue-700 transition-all duration-200 w-full sm:w-auto"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </SignedIn>
                  <a 
                    href="#how-it-works" 
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto"
                  >
                    Learn More
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="relative rounded-2xl bg-gray-900/5 p-8 shadow-2xl shadow-gray-500/20 border border-gray-200/60">
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                  <Image
                    src="/public/images/10007_right_dr.jpeg"
                    alt="Eye scan with AI diagnosis"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-white text-sm font-medium">AI Diagnosis: Diabetic Retinopathy</span>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-300">Confidence Score</span>
                          <span className="text-xs text-white font-medium">87%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Advanced Features</h2>
              <p className="mt-4 text-lg text-gray-600">
                Cutting-edge tools designed to revolutionize ophthalmology diagnosis and patient care
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-5">
                  <Eye className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Advanced machine learning algorithms analyze eye scans with high accuracy, helping identify potential issues quickly.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-5">
                  <BarChart4 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Comprehensive Analytics</h3>
                <p className="text-gray-600">
                  Detailed performance metrics and analytics to track diagnosis accuracy and treatment outcomes.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-5">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Patient Data</h3>
                <p className="text-gray-600">
                  Enterprise-grade security ensures all patient information and scan data remain protected and compliant.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-5">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Role-Based Access</h3>
                <p className="text-gray-600">
                  Customized dashboards for administrators, doctors, and patients with relevant information and tools.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-5">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Processing</h3>
                <p className="text-gray-600">
                  Fast analysis of uploaded scans with immediate results and diagnosis support for medical professionals.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-5">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Efficient Workflow</h3>
                <p className="text-gray-600">
                  Streamlined process from scan upload to diagnosis, reducing wait times and improving patient care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">
                A simple, effective process that combines AI technology with medical expertise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Upload Scan</h3>
                  <p className="text-gray-600">
                    Medical professionals upload patient eye scans through the secure platform interface.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-teal-500" />
                </div>
              </div>

              <div className="relative">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">AI Analysis</h3>
                  <p className="text-gray-600">
                    Our advanced algorithms analyze the scan, identifying potential issues and providing confidence scores.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-teal-500" />
                </div>
              </div>

              <div className="relative">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Expert Review</h3>
                  <p className="text-gray-600">
                    Doctors review AI results and provide final diagnosis, combining technology with medical expertise.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-md shadow-sm hover:from-teal-700 hover:to-blue-700 transition-all duration-200">
                    Start Using OphthalmoScan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-md shadow-sm hover:from-teal-700 hover:to-blue-700 transition-all duration-200"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </SignedIn>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">About OphthalmoScan</h2>
              <p className="mt-4 text-lg text-gray-600">
                An innovative solution at the intersection of healthcare and technology
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden">
                    <Image
                      src="/images/Logo OphthalmoScan.png"
                      alt="OphthalmoScan Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600 mb-6">
                    OphthalmoScan-AI aims to revolutionize ophthalmology diagnostics by leveraging artificial intelligence to assist medical professionals in providing faster, more accurate diagnoses for patients with eye conditions.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Our platform combines cutting-edge machine learning technology with medical expertise to analyze eye scans, identify potential issues, and recommend treatment options, improving accessibility and efficiency in eye care.
                  </p>
                  <p className="text-gray-600">
                    Developed as part of an internship project at ENSAM Casablanca in collaboration with Capgemini Engineering, OphthalmoScan represents the future of AI-assisted medical diagnostics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Internship Section */}
        <section id="internship" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Internship Project</h2>
              <p className="mt-4 text-lg text-gray-600">
                Developed as part of an engineering internship at ENSAM Casablanca
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Project Details</h3>
                  <p className="text-gray-600 mb-6">
                    OphthalmoScan-AI was developed as part of an engineering internship at the National Higher School of Arts and Crafts (ENSAM) Casablanca, in collaboration with Capgemini Engineering.
                  </p>
                  <p className="text-gray-600 mb-6">
                    The project focuses on applying deep learning techniques to analyze retinal scans and assist in the diagnosis of various eye conditions, with a particular emphasis on diabetic retinopathy.
                  </p>
                  <p className="text-gray-600">
                    Our implementation combines a sophisticated neural network model with a user-friendly interface to make AI-assisted diagnosis accessible to healthcare professionals.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Supervisors Acknowledgment</h3>
                  <p className="text-gray-600 mb-6">
                    We extend our sincere gratitude to our academic and professional supervisors who provided invaluable guidance throughout this project:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Professor [Supervisor Name] - ENSAM Casablanca</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>[Supervisor Name] - Capgemini Engineering</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Powered By Section */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-semibold text-gray-900 mb-12">Powered By</h2>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
              <div className="relative w-32 h-16">
                <Image
                  src="/images/logo-ensam-casablanca.png"
                  alt="ENSAM Casablanca"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative w-48 h-16">
                <Image
                  src="/images/CapgeminiEngineering_Logo.jpg"
                  alt="Capgemini Engineering"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <div className="relative h-10 w-10 mr-2 bg-white rounded-full p-1">
                  <Image
                    src="/images/Mini Logo OphthalmoScan.png"
                    alt="OphthalmoScan Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-white">
                  OphthalmoScan
                </span>
              </div>
              <p className="mt-4 text-gray-400 max-w-md">
                An ophthalmology diagnostic support system powered by AI, developed as part of an engineering internship at ENSAM Casablanca.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.ensam-casa.ma/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    ENSAM Casablanca
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a href="https://www.capgemini.com/services/capgemini-engineering/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    Capgemini Engineering
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} OphthalmoScan. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <SignedOut>
                <div className="flex gap-4">
                  <SignInButton mode="modal">
                    <button className="text-sm text-gray-400 hover:text-white transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Dashboard
                  </button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </footer>

      {/* Fallback buttons for when Clerk doesn't load */}
      {(!isLoaded || showFallback) && !isSignedIn && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
          <p className="text-sm text-gray-600 mb-3">Auth system loading slowly? Try direct links:</p>
          <div className="flex gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}