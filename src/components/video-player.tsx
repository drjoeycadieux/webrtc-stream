
"use client";

import { useEffect, useRef, forwardRef } from 'react';
import { Card } from './ui/card';

type VideoPlayerProps = {
  stream: MediaStream;
  muted?: boolean;
  name: string;
};

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ stream, muted = false, name }, ref) => {
    const internalRef = useRef<HTMLVideoElement>(null);
    const videoRef = ref || internalRef;

    useEffect(() => {
      if (videoRef && 'current' in videoRef && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, [stream, videoRef]);

    return (
      <Card className="relative overflow-hidden aspect-video bg-muted flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {name}
        </div>
      </Card>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
