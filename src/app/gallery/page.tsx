'use client';

import { useState, useEffect } from 'react';
import { useGalleryAnalytics } from '@/hooks/useGalleryAnalytics';
import { GallerySpecies } from '@/types';

// How often the gallery reloads /api/species. The catalog only changes on a deploy.
const REFRESH_INTERVAL_MS = 300000;

export default function GalleryPage() {
  const [species, setSpecies] = useState<GallerySpecies[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<GallerySpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<'image' | 'video'>('image');
  const [mounted, setMounted] = useState(false);

  // Analytics hook
  const analytics = useGalleryAnalytics();

  // Load the species on mount, then refresh on a timer
  useEffect(() => {
    setMounted(true);
    loadSpecies();

    const interval = setInterval(() => loadSpecies(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Show the image first whenever the selected species changes
  useEffect(() => {
    if (selectedSpecies) {
      setSelectedMedia(selectedSpecies.image_url ? 'image' : 'video');
    }
  }, [selectedSpecies?.id]);

  const loadSpecies = async (preserveSelection = false) => {
    try {
      const response = await fetch('/api/species');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const speciesList: GallerySpecies[] = data.species || [];

      setSpecies(speciesList);

      if (preserveSelection) {
        // Keep the current species selected, with fresh data from the API
        setSelectedSpecies(prev => prev ? speciesList.find(s => s.id === prev.id) ?? prev : prev);
      } else if (speciesList.length > 0) {
        // Always start with a random species
        const randomSpecies = speciesList[Math.floor(Math.random() * speciesList.length)];
        setSelectedSpecies(randomSpecies);

        // Track random species selection from the landing page
        if (new URLSearchParams(window.location.search).get('random') === 'true') {
          analytics.trackGalleryNavigation('random');
        }
        analytics.trackSpeciesView(randomSpecies.common_name, randomSpecies.id);
      } else {
        setMessage('No species found.');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading species:', error);
      // A failed refresh keeps the species already shown
      if (!preserveSelection) {
        setMessage(`Error loading species: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div>Loading species...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        
        /* Suppress hydration warnings from browser extensions */
        html {
          color-scheme: dark;
        }
        
        /* Prevent browser extension interference */
        html[data-darkreader-white-flash-suppressor] {
          color-scheme: dark !important;
        }
        
        /* ===== OPTIMIZED IMAGE DISPLAY FOR MAXIMUM SPACE UTILIZATION ===== */
        
        /* Base media container - allow full flexibility */
        .media-container {
          overflow: hidden;
        }
        
        /* Main media display container - maximize available space */
        .mobile-media-display {
          overflow: hidden;
        }
        
        /* Optimized image display - fill available space while maintaining aspect ratio */
        .mobile-media-display img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          object-position: center;
          display: block;
        }
        
        /* Optimized video display - fill available space while maintaining aspect ratio */
        .mobile-media-display video {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          object-position: center;
          display: block;
        }
        
        /* Desktop and large screens - maximize space */
        @media (min-width: 769px) {
          .media-container {
            padding: 10px;
          }
          
          .mobile-media-display {
            padding: 10px;
          }
        }
        
        /* Mobile layout optimizations */
        @media (max-width: 768px) {
          .gallery-container {
            flex-direction: column !important;
          }
          .species-list {
            width: 100% !important;
            height: 280px !important;
            order: 2 !important;
          }
          .species-list-scroll {
            max-height: 230px !important;
          }
          .main-display {
            order: 1 !important;
            flex: 1 !important;
          }
          
          /* Mobile header layout - stack vertically */
          .mobile-header-stack {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          
          /* Compact mobile text */
          .mobile-species-title {
            font-size: 18px !important;
            line-height: 1.1 !important;
            margin-bottom: 4px !important;
          }
          
          .mobile-species-scientific {
            font-size: 12px !important;
            margin-bottom: 8px !important;
          }
          
          .mobile-species-details {
            font-size: 11px !important;
            text-align: left !important;
            line-height: 1.3 !important;
          }
          
          .mobile-species-details > div {
            margin-bottom: 3px !important;
          }
          
          /* Optimize media container for mobile - maximize space */
          .mobile-media-container {
            padding: 5px !important;
          }
          
          /* Compact header */
          .mobile-header-section {
            padding: 15px !important;
          }
          
          /* Compact navigation */
          .mobile-media-navigation {
            margin-bottom: 10px !important;
            padding-bottom: 10px !important;
          }
          
          /* Hide entity section on mobile for more space */
          .mobile-entity-section {
            display: none !important;
          }
        }
        
        /* Compact layout for very small screens */
        @media (max-width: 414px) {
          .mobile-header-section {
            padding: 10px !important;
          }
          
          .mobile-media-container {
            padding: 3px !important;
          }
        }
        
        /* Short screen optimizations */
        @media (max-height: 700px) {
          .mobile-header-section {
            padding: 15px !important;
          }
          
          .species-list {
            height: 250px !important;
          }
          
          .species-list-scroll {
            max-height: 200px !important;
          }
        }
      `}</style>
      
      <div className="gallery-container" style={{ height: '100vh', display: 'flex' }}>
        {/* Species List - Left Side */}
        <div className="species-list" style={{
          width: '350px',
          background: 'rgba(0,0,0,0.3)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Header with Entity title and navigation */}
          <div className="mobile-entity-section" style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className="mobile-entity-title" style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '300',
                  fontStyle: 'italic',
                  color: '#fff'
                }}>
                  Entity v1.0
                </h1>
                <p className="mobile-entity-subtitle" style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: '300'
                }}>
                  Extinct Species Gallery
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => window.location.href = '/landing'}
                  className="mobile-entity-buttons"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    minWidth: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.setAttribute('title', 'Back to Landing');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                >
                  ←
                </button>
              </div>
            </div>
          </div>

          <div className="species-list-scroll" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px'
          }} id="species-list-container">
            {species.map((spec) => (
              <div
                key={spec.id}
                onClick={() => {
                  // Store current scroll position before changing species
                  const container = document.getElementById('species-list-container');
                  const scrollTop = container?.scrollTop || 0;

                  setSelectedSpecies(spec);

                  // Track species selection
                  analytics.trackGalleryNavigation('species_select');
                  analytics.trackSpeciesView(spec.common_name, spec.id);

                  // Restore scroll position after a brief delay to allow re-render
                  setTimeout(() => {
                    if (container) {
                      container.scrollTop = scrollTop;
                    }
                  }, 50);
                }}
                style={{
                  padding: '15px',
                  margin: '5px 0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedSpecies?.id === spec.id
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: selectedSpecies?.id === spec.id
                    ? '1px solid rgba(76, 175, 80, 0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease',
                  minHeight: '80px', // Fixed minimum height
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flex: 1
                }}>
                  <div style={{
                    flex: 1,
                    paddingRight: '10px'
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                      {spec.common_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic', marginBottom: '4px' }}>
                      {spec.scientific_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      Extinct: {spec.year_extinct}
                    </div>
                  </div>

                  {/* Fixed-size thumbnail area */}
                  <div style={{
                    width: '60px',
                    height: '45px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start'
                  }}>
                    {/* Thumbnails in fixed container - Image above Video with padding */}
                    {(spec.image_url || spec.video_url) && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        alignItems: 'flex-end'
                      }}>
                        {spec.image_url && (
                          <img
                            src={spec.image_url}
                            alt={`${spec.common_name} thumbnail`}
                            style={{
                              width: '35px',
                              height: '24px',
                              objectFit: 'cover',
                              borderRadius: '3px',
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          />
                        )}
                        {spec.video_url && (
                          <div style={{
                            position: 'relative',
                            width: '35px',
                            height: '24px',
                            borderRadius: '3px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            overflow: 'hidden'
                          }}>
                            <video
                              src={spec.video_url}
                              muted
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: 'white',
                              fontSize: '10px',
                              textShadow: '0 0 3px rgba(0,0,0,0.8)',
                              pointerEvents: 'none'
                            }}>
                              ▶
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Display - Right Side */}
        <div className="main-display" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedSpecies && (
            <>
              {/* Header - Mobile responsive layout */}
              <div className="header-section mobile-header-section" style={{
                padding: '30px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <div className="mobile-header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Species Names */}
                  <div style={{ flex: '0 0 auto', marginRight: '40px' }}>
                    <h1 className="mobile-species-title" style={{ margin: 0, fontSize: '28px', fontWeight: '300', marginBottom: '10px' }}>
                      {selectedSpecies.common_name}
                    </h1>
                    <p className="mobile-species-scientific" style={{ margin: 0, fontSize: '16px', color: '#ccc', fontStyle: 'italic', marginBottom: '16px' }}>
                      {selectedSpecies.scientific_name}
                    </p>
                  </div>

                  {/* Species Details - will move below names on mobile */}
                  <div className="mobile-species-details" style={{
                    flex: '0 0 auto',
                    fontSize: '14px',
                    color: '#aaa',
                    textAlign: 'right',
                    lineHeight: '1.4'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#888' }}>Extinct: </span>
                      <span style={{ color: '#fff' }}>{selectedSpecies.year_extinct}</span>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#888' }}>Last seen: </span>
                      <span style={{ color: '#fff' }}>{selectedSpecies.last_seen}</span>
                    </div>
                    <div>
                      <span style={{ color: '#888' }}>Cause: </span>
                      <span style={{ color: '#fff' }}>{selectedSpecies.extinction_cause}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div style={{
                  padding: '15px',
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '6px',
                  margin: '0 30px',
                  color: '#4CAF50',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {message}
                </div>
              )}

              {/* Media Display */}
              <div className="media-container mobile-media-container" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '15px',
                minHeight: '0',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div className="mobile-media-display" style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  minHeight: '300px',
                  overflow: 'hidden',
                  padding: '10px',
                  position: 'relative'
                }}>
                  {/* Always prioritize image display first, then video */}
                  {selectedMedia === 'image' && selectedSpecies.image_url ? (
                    <div style={{
                      position: 'relative',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        key={`${selectedSpecies.id}-image`}
                        src={selectedSpecies.image_url}
                        alt={selectedSpecies.common_name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '8px',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                        onError={() => console.error('Image failed to load:', selectedSpecies.image_url)}
                      />
                    </div>
                  ) : selectedMedia === 'video' && selectedSpecies.video_url ? (
                    <div style={{
                      position: 'relative',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <video
                        key={`${selectedSpecies.id}-video`}
                        src={selectedSpecies.video_url}
                        controls
                        autoPlay
                        loop
                        muted
                        onPlay={() => analytics.trackMediaInteraction(selectedSpecies.common_name, 'video', 'play')}
                        onPause={() => analytics.trackMediaInteraction(selectedSpecies.common_name, 'video', 'pause')}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '8px',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                {/* Media Type Selection */}
                {(selectedSpecies.image_url || selectedSpecies.video_url) && (
                  <div className="mobile-media-navigation" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    marginTop: '20px',
                    width: '100%',
                    maxWidth: '600px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'center'
                    }}>
                      {selectedSpecies.image_url && (
                        <button
                          onClick={() => {
                            const previousMedia = selectedMedia;
                            setSelectedMedia('image');
                            // Track media type switch
                            if (previousMedia !== 'image') {
                              analytics.trackMediaTypeSwitch(selectedSpecies.common_name, previousMedia, 'image');
                            }
                            // Track media interaction
                            analytics.trackMediaInteraction(selectedSpecies.common_name, 'image', 'view');
                          }}
                          style={{
                            width: '80px',
                            height: '55px',
                            border: selectedMedia === 'image' ? '2px solid #4CAF50' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            padding: 0,
                            position: 'relative'
                          }}
                        >
                          <img
                            src={selectedSpecies.image_url}
                            alt="Image thumbnail"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </button>
                      )}
                      {selectedSpecies.video_url && (
                        <button
                          onClick={() => {
                            const previousMedia = selectedMedia;
                            setSelectedMedia('video');
                            // Track media type switch
                            if (previousMedia !== 'video') {
                              analytics.trackMediaTypeSwitch(selectedSpecies.common_name, previousMedia, 'video');
                            }
                            // Track media interaction
                            analytics.trackMediaInteraction(selectedSpecies.common_name, 'video', 'view');
                          }}
                          style={{
                            width: '80px',
                            height: '55px',
                            border: selectedMedia === 'video' ? '2px solid #4CAF50' : '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            padding: 0,
                            position: 'relative'
                          }}
                        >
                          <video
                            src={selectedSpecies.video_url}
                            muted
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: '18px',
                            textShadow: '0 0 6px rgba(0,0,0,0.8)',
                            pointerEvents: 'none'
                          }}>
                            ▶
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
