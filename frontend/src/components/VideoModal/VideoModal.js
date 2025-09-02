import React, { useState, useEffect } from "react";
import "./VideoModal.css";

const VideoModal = ({ isOpen, onClose }) => {
  const [hasSeenVideo, setHasSeenVideo] = useState(false);

  useEffect(() => {
    // Check if user has already seen the video in this session
    const seenVideo = sessionStorage.getItem("hasSeenIntroVideo");
    if (seenVideo === "true") {
      setHasSeenVideo(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !hasSeenVideo) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, hasSeenVideo]);

  const handleClose = () => {
    // Mark video as seen in session storage
    sessionStorage.setItem("hasSeenIntroVideo", "true");
    setHasSeenVideo(true);
    onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen || hasSeenVideo) {
    return null;
  }

  // Extract video ID from YouTube URL
  const videoId = "CbHRUmVvJ9A";
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="video-modal-overlay" onClick={handleClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-header">
          <h3>Welcome to GiftyGen!</h3>
          <button className="video-modal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="video-container">
          <iframe
            src={embedUrl}
            title="GiftyGen Introduction Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-iframe"
          ></iframe>
        </div>

        <div className="video-modal-footer">
          <button className="skip-btn" onClick={handleSkip}>
            Skip Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
