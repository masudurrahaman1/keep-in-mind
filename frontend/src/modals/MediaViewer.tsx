import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, ChevronRight, ExternalLink, Maximize2, Play, Pause, 
  Volume2, VolumeX, Pencil, RotateCcw, RotateCw, FastForward, Rewind, 
  Settings, Download, ZoomIn, ZoomOut, RotateCw as RotateIcon
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface MediaViewerProps {
  media: any;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRename: (id: string, currentName: string) => void;
}

export default function MediaViewer({ media, onClose, onNext, onPrev, onRename }: MediaViewerProps) {
  const { googleAccessToken } = useAuth();
  const isVideo = media.fileType.startsWith('video/');
  
  // Video States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipX, setTooltipX] = useState(0);
  
  // Image States
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout|null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const directLink = (googleAccessToken && googleAccessToken !== 'undefined' && googleAccessToken !== 'null')
    ? `${API_BASE}/gallery/stream/${media.fileId}?token=${googleAccessToken}`
    : media.fileUrl; // Fallback to original URL if possible

  // Idle Detection for Auto-hide Controls
  const resetIdleTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  }, [isPlaying]);

  useEffect(() => {
    resetIdleTimer();
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [resetIdleTimer]);

  // Video Handlers
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    }
  }, [media.fileId, isVideo, playbackRate]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) setIsMuted(true);
      else if (isMuted) setIsMuted(false);
    }
  };

  // Fullscreen Sync
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT';
      if (isInput) return;

      switch(e.key.toLowerCase()) {
        case ' ': 
          e.preventDefault(); 
          togglePlay(); 
          break;
        case 'f': 
          toggleFullscreen(); 
          break;
        case 'm': 
          setIsMuted(prev => !prev); 
          break;
        case 'arrowright': 
          if (isVideo) skip(5); 
          else onNext();
          break;
        case 'arrowleft': 
          if (isVideo) skip(-5); 
          else onPrev();
          break;
        case 'escape': 
          onClose(); 
          break;
      }
      resetIdleTimer();
    };

    const handleGlobalPointerUp = () => setIsSeeking(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isVideo, isPlaying, resetIdleTimer, onNext, onPrev, onClose]);

  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    setHoverTime(percentage * duration);
    setTooltipX(x);
  };

  const handleMediaError = async () => {
     console.error('Media playback failed. Attempting to refresh session...');
  };

  const modalContent = (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/98 backdrop-blur-3xl transition-all duration-500 overflow-hidden ${showControls ? 'cursor-default' : 'cursor-none'}`}
      onMouseMove={resetIdleTimer}
      onClick={() => isVideo && togglePlay()}
    >
      {/* Top Bar Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-4 md:p-8 flex items-center justify-between z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={onClose}
                className="p-2.5 md:p-3 bg-white/10 hover:bg-error/30 text-white rounded-2xl transition-all backdrop-blur-xl border border-white/10 shadow-lg active:scale-90"
                title="Close"
              >
                <X size={24} />
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-1 hidden md:block"></div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-heading font-bold text-base md:text-2xl line-clamp-1 drop-shadow-2xl max-w-[120px] sm:max-w-md">{media.fileName}</h2>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRename(media._id, media.fileName); }}
                    className="p-1.5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <p className="text-white/50 text-[9px] md:text-xs font-bold uppercase tracking-widest">
                  {format(new Date(media.uploadedAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => window.open(directLink + '&download=true')} 
                className="p-2.5 md:p-3 bg-white/5 hover:bg-primary text-white rounded-2xl transition-all backdrop-blur-xl border border-white/5 active:scale-90"
                title="Download"
              >
                <Download size={20} />
              </button>
              <a
                href={media.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all backdrop-blur-xl border border-white/5 hidden lg:flex items-center gap-2 px-5"
              >
                <ExternalLink size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Drive</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Navigation Controls (On-Screen Buttons) */}
        <AnimatePresence>
          {showControls && (
            <>
              {/* Previous Button */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 md:left-8 z-50 p-4 md:p-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-xl border border-white/5 group"
              >
                <ChevronLeft size={32} className="group-hover:scale-110 transition-transform" />
              </motion.button>

              {/* Next Button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 md:right-8 z-50 p-4 md:p-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-xl border border-white/5 group"
              >
                <ChevronRight size={32} className="group-hover:scale-110 transition-transform" />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Media Logic */}
        <motion.div
          key={media.fileId}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          onDoubleClick={toggleFullscreen}
          className={`relative flex items-center justify-center transition-all duration-500 ${isFullscreen ? 'w-screen h-screen' : 'max-w-full max-h-full'}`}
        >
          {isVideo ? (
            <div className={`relative group/video overflow-hidden transition-all duration-500 ${isFullscreen ? 'w-screen h-screen rounded-none shadow-none border-none' : 'shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/5'}`}>
              <video
                ref={videoRef}
                src={directLink}
                className={`w-full h-full transition-all duration-500 ${isFullscreen ? 'object-contain' : 'max-h-[90vh] md:max-h-[85vh] w-auto h-auto'}`}
                controls={false}
                loop
                muted={isMuted}
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                  if (videoRef.current && !isSeeking) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
                onError={handleMediaError}
              />
              
              {/* Playback Central Indicator */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-none"
                  >
                    <div className="p-10 bg-white shadow-2xl rounded-full text-black">
                      <Play size={64} fill="currentColor" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Advanced Bottom Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    onClick={e => e.stopPropagation()}
                    className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-4"
                  >
                    <div 
                      className="w-full flex flex-col group/seeker relative pt-4 pb-2" 
                      onClick={e => e.stopPropagation()} 
                      onMouseDown={e => e.stopPropagation()}
                      onMouseMove={handleSeekMouseMove}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      {/* Time Code Tooltip (YouTube Style) */}
                      <AnimatePresence>
                        {showTooltip && (
                          <motion.div 
                            initial={{ opacity: 0, y: 0, scale: 0.8 }}
                            animate={{ opacity: 1, y: -35, scale: 1 }}
                            exit={{ opacity: 0, y: 0, scale: 0.8 }}
                            className="absolute z-[70] px-2 py-1 bg-black/90 backdrop-blur-md rounded-md text-[10px] font-mono font-bold text-white border border-white/10 pointer-events-none whitespace-nowrap shadow-xl"
                            style={{ left: `${tooltipX}px`, transform: 'translateX(-50%)' }}
                          >
                            {formatTime(hoverTime)}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* YouTube Style Background Track */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden group-hover/seeker:h-1.5 transition-all duration-200">
                        {/* Red Progress Fill */}
                        <div 
                          className="h-full bg-red-600 relative" 
                          style={{ width: `${(duration ? (currentTime / duration) * 100 : 0)}%` }}
                        >
                          {/* Glow effect for red bar */}
                          <div className="absolute right-0 top-0 bottom-0 w-4 bg-red-400 blur-sm opacity-50" />
                        </div>
                      </div>

                      {/* YouTube Scrubber Knob */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-red-600 rounded-full -translate-x-1/2 scale-0 group-hover/seeker:scale-100 transition-transform duration-200 pointer-events-none z-20 border-2 border-white/20 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
                        style={{ left: `${(duration ? (currentTime / duration) * 100 : 0)}%` }}
                      />

                      {/* Invisible Interaction Layer - Expanded Hitbox */}
                      <input 
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        onPointerDown={(e) => { e.stopPropagation(); setIsSeeking(true); }}
                        onPointerUp={(e) => { e.stopPropagation(); setIsSeeking(false); }}
                        onClick={e => e.stopPropagation()}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer appearance-none"
                      />

                      <div className="flex justify-between text-[10px] font-mono font-bold text-white/50 tracking-tighter mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Button Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-6">
                        <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-all p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><Rewind size={22} /></button>
                        <button onClick={() => togglePlay()} className="text-white hover:scale-125 transition-all p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                        </button>
                        <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-all p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><FastForward size={22} /></button>
                        <div className="w-px h-6 bg-white/10 mx-1 sm:mx-2"></div>
                        <div className="flex items-center gap-1 sm:gap-3">
                          <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-white/80 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            onMouseDown={e => e.stopPropagation()}
                            onClick={e => e.stopPropagation()}
                            className="w-20 h-1 accent-white bg-white/10 rounded-full hidden md:block cursor-pointer appearance-none" 
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Speed Menu */}
                        <div className="relative">
                          <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${showSpeedMenu ? 'bg-primary border-primary text-white' : 'border-white/20 text-white/60'}`}>
                            {playbackRate}x
                          </button>
                          {showSpeedMenu && (
                            <div className="absolute bottom-full mb-4 right-0 bg-surface-container-high/90 backdrop-blur-2xl rounded-2xl p-2 border border-white/10 shadow-2xl flex flex-col min-w-[80px]">
                              {[0.5, 1, 1.5, 2].map(rate => (
                                <button key={rate} onClick={() => { setPlaybackRate(rate); setShowSpeedMenu(false); }} className={`px-4 py-2 text-xs font-bold rounded-lg text-left ${playbackRate === rate ? 'bg-primary text-white' : 'text-on-surface hover:bg-on-surface/10'}`}>
                                  {rate}x
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={toggleFullscreen} className="text-white/60 hover:text-white transition-colors"><Maximize2 size={20} /></button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div 
              className={`relative group transition-all duration-500 overflow-hidden ${isFullscreen ? 'w-screen h-screen rounded-none' : ''}`}
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              onClick={e => e.stopPropagation()}
              onTouchStart={(e) => {
                if (e.touches.length === 2) {
                  const dist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                  );
                  (e.currentTarget as any)._initialDist = dist;
                  (e.currentTarget as any)._initialZoom = zoom;
                } else if (e.touches.length === 1) {
                  (e.currentTarget as any)._swipeStartX = e.touches[0].clientX;
                }
              }}
              onTouchEnd={(e) => {
                if ((e.currentTarget as any)._swipeStartX !== undefined && e.changedTouches.length === 1 && zoom === 1) {
                  const endX = e.changedTouches[0].clientX;
                  const diff = (e.currentTarget as any)._swipeStartX - endX;
                  const threshold = 50; // Minimum swipe distance
                  if (diff > threshold) onNext();
                  else if (diff < -threshold) onPrev();
                  (e.currentTarget as any)._swipeStartX = undefined;
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 2 && (e.currentTarget as any)._initialDist) {
                  e.preventDefault();
                  const dist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                  );
                  const scale = dist / (e.currentTarget as any)._initialDist;
                  const newZoom = Math.max(1, Math.min(3, (e.currentTarget as any)._initialZoom * scale));
                  setZoom(newZoom);
                }
              }}
            >
              <img
                src={directLink}
                alt={media.fileName}
                className={`transition-all duration-500 touch-none ${isFullscreen ? 'w-screen h-screen object-contain rounded-none' : 'max-h-[85vh] w-auto h-auto shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10'}`}
                onError={handleMediaError}
              />
              
              {/* Image Controls Overlay removed from here */}
            </div>
          )}
        </motion.div>

        {/* Image Controls Overlay (Moved Outside for better mobile positioning) */}
        {!isVideo && (
          <AnimatePresence>
            {showControls && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-black/60 backdrop-blur-2xl rounded-[2rem] border border-white/10 text-white z-[60]"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setZoom(prev => Math.max(1, prev - 0.25))} className="p-2 hover:bg-white/10 rounded-full transition-all"><ZoomOut size={20} /></button>
                <span className="text-[10px] font-bold min-w-[30px] text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(prev => Math.min(3, prev + 0.25))} className="p-2 hover:bg-white/10 rounded-full transition-all"><ZoomIn size={20} /></button>
                <div className="w-px h-6 bg-white/20"></div>
                <button onClick={() => setRotation(prev => prev + 90)} className="p-2 hover:bg-white/10 rounded-full transition-all"><RotateIcon size={20} /></button>
                <div className="w-px h-6 bg-white/20"></div>
                <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-all"><Maximize2 size={20} /></button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
      
      {/* Footer Info Prompt */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 text-[9px] tracking-[0.3em] uppercase font-bold hidden md:block">
          Use Arrows to Navigate • Space to Play • Esc to Close
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
