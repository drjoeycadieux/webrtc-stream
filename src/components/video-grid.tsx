
"use client";

import VideoPlayer from "./video-player";

type VideoGridProps = {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
};

export default function VideoGrid({ localStream, remoteStreams }: VideoGridProps) {
  const allStreams = [localStream, ...Object.values(remoteStreams)].filter(Boolean) as MediaStream[];
  const totalStreams = allStreams.length;

  const gridClasses = () => {
    if (totalStreams <= 2) return "grid-cols-1 md:grid-cols-2";
    if (totalStreams <= 4) return "grid-cols-2";
    if (totalStreams <= 6) return "grid-cols-3";
    return "grid-cols-4";
  };
  
  return (
    <div className={`grid flex-1 gap-4 p-4 ${gridClasses()}`}>
      {localStream && <VideoPlayer stream={localStream} muted name="You" />}
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <VideoPlayer key={peerId} stream={stream} name={`Peer ${peerId.substring(0, 4)}`} />
      ))}
    </div>
  );
}
