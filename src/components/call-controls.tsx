
import { Button } from './ui/button';
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, MessageSquare } from 'lucide-react';

type CallControlsProps = {
  onLeave: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onToggleVideo: () => void;
  isVideoOff: boolean;
  onToggleScreenShare: () => void;
  isScreenSharing: boolean;
  onToggleChat: () => void;
};

export default function CallControls({
  onLeave,
  onToggleMute,
  isMuted,
  onToggleVideo,
  isVideoOff,
  onToggleScreenShare,
  isScreenSharing,
  onToggleChat,
}: CallControlsProps) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 p-2 z-50">
      <div className="flex items-center justify-center gap-4 bg-card/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border">
        <Button onClick={onToggleMute} variant={isMuted ? 'destructive' : 'secondary'} size="icon" className="rounded-full h-14 w-14">
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button onClick={onToggleVideo} variant={isVideoOff ? 'destructive' : 'secondary'} size="icon" className="rounded-full h-14 w-14">
          {isVideoOff ? <VideoOff /> : <Video />}
        </Button>
        <Button onClick={onToggleScreenShare} variant={isScreenSharing ? 'default' : 'secondary'} size="icon" className="rounded-full h-14 w-14">
          <ScreenShare />
        </Button>
        <Button onClick={onToggleChat} variant="secondary" size="icon" className="rounded-full h-14 w-14">
            <MessageSquare />
        </Button>
        <Button onClick={onLeave} variant="destructive" size="icon" className="rounded-full h-14 w-14">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
