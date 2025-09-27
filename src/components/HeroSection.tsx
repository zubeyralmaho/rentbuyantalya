'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroVideoSettings {
  video_url: string;
  fallback_image_url: string;
  is_active: boolean;
  title: string;
  subtitle: string;
}

interface HeroSectionProps {
  whatsappNumber?: string;
  instagramUrl?: string;
  instagramUrl2?: string;
}

export default function HeroSection({ 
  whatsappNumber, 
  instagramUrl, 
  instagramUrl2 
}: HeroSectionProps) {
  const [heroSettings, setHeroSettings] = useState<HeroVideoSettings>({
    video_url: '/herovideo.mp4',
    fallback_image_url: '/hero-bg.jpg',
    is_active: true,
    title: 'RENT&BUY',
    subtitle: 'Rent the Difference'
  });
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Fetch hero settings from API
    fetch('/api/hero')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setHeroSettings(data);
        }
      })
      .catch(error => {
        console.error('Error fetching hero settings:', error);
      });
  }, []);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  return (
    <section className="bg-gradient-hero relative py-8 sm:py-16 lg:py-24 overflow-hidden">
      {/* Video Background */}
      {heroSettings.is_active && heroSettings.video_url && !videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoLoad}
        >
          <source src={heroSettings.video_url} type="video/mp4" />
        </video>
      )}
      
      {/* Fallback Image Background */}
      {(videoError || !heroSettings.is_active || !heroSettings.video_url) && heroSettings.fallback_image_url && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={heroSettings.fallback_image_url}
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      
      {/* Dark Overlay */}
      <div className="hero-overlay absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="text-center text-white fade-in">
          {/* Empty hero content - social buttons moved to services section */}
        </div>
      </div>
    </section>
  );
}