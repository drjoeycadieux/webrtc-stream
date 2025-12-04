
"use client";

import { useEffect, useRef } from 'react';
import { Card } from './ui/card';

type VideoPlayerProps = {
  stream: MediaStream;
  muted?: boolean;
  name: string;
};

export default function VideoPlayer({ stream, muted = false, name }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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
