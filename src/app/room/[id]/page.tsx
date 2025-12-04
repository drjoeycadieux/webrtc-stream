
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  setDoc,
  getDocs,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { db, iceServers } from "@/lib/firebase";
import VideoGrid from "@/components/video-grid";
import CallControls from "@/components/call-controls";
import ChatPanel from "@/components/chat-panel";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type Participant = {
  id: string;
};

type SignalingData = {
  from: string;
  to: string;
  type: 'offer' | 'answer' | 'candidate';
  data: any;
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params.id as string;
  
  const [peerId, setPeerId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareStream = useRef<MediaStream | null>(null);

  const setupPeerConnection = useCallback((targetPeerId: string) => {
    if (peerConnections.current[targetPeerId]) return peerConnections.current[targetPeerId];

    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(collection(db, "rooms", roomId, "signaling"), {
          from: peerId,
          to: targetPeerId,
          type: 'candidate',
          data: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({ ...prev, [targetPeerId]: event.streams[0] }));
    };

    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
    
    peerConnections.current[targetPeerId] = pc;
    return pc;
  }, [localStream, peerId, roomId]);

  const cleanupConnection = useCallback((targetPeerId: string) => {
    peerConnections.current[targetPeerId]?.close();
    delete peerConnections.current[targetPeerId];
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[targetPeerId];
      return newStreams;
    });
  }, []);

  useEffect(() => {
    setPeerId(`peer_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setIsLoading(false);
      } catch (error) {
        console.error("Error accessing media devices.", error);
        toast({
            title: "Media Error",
            description: "Could not access your camera and microphone. Please check permissions.",
            variant: "destructive"
        });
        router.push('/');
      }
    };
    if (peerId) init();
  }, [peerId, router, toast]);

  useEffect(() => {
    if (!peerId || !localStream || !roomId) return;

    const roomRef = doc(db, "rooms", roomId);
    const participantsRef = collection(db, "rooms", roomId, "participants");
    const signalingRef = collection(db, "rooms", roomId, "signaling");

    // Add self to participants
    const participantRef = doc(participantsRef, peerId);
    setDoc(participantRef, { id: peerId, joinedAt: new Date() });

    // Listen for other participants
    const unsubscribeParticipants = onSnapshot(participantsRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const otherPeerId = change.doc.id;
        if (otherPeerId === peerId) return;

        if (change.type === 'added') {
          const pc = setupPeerConnection(otherPeerId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await addDoc(signalingRef, {
            from: peerId,
            to: otherPeerId,
            type: 'offer',
            data: { sdp: offer.sdp, type: offer.type },
          });
        } else if (change.type === 'removed') {
          cleanupConnection(otherPeerId);
        }
      });
    });

    // Listen for signaling messages
    const q = query(signalingRef, where("to", "==", peerId));
    const unsubscribeSignaling = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const signal = change.doc.data() as SignalingData;
          const pc = setupPeerConnection(signal.from);

          if (signal.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await addDoc(signalingRef, {
              from: peerId,
              to: signal.from,
              type: 'answer',
              data: { sdp: answer.sdp, type: answer.type },
            });
          } else if (signal.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          } else if (signal.type === 'candidate') {
            await pc.addIceCandidate(new RTCIceCandidate(signal.data));
          }
          await deleteDoc(change.doc.ref);
        }
      });
    });

    const handleBeforeUnload = async () => {
      await deleteDoc(participantRef);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Cleanup on component unmount
      unsubscribeParticipants();
      unsubscribeSignaling();
      localStream?.getTracks().forEach(track => track.stop());
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, [peerId, localStream, roomId, setupPeerConnection, cleanupConnection]);

  const handleLeave = async () => {
    router.push("/");
  };
  
  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    setIsVideoOff(!isVideoOff);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
        // Stop screen sharing
        screenShareStream.current?.getTracks().forEach(track => track.stop());
        const cameraTrack = localStream?.getVideoTracks()[0];
        if (cameraTrack) {
            Object.values(peerConnections.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                sender?.replaceTrack(cameraTrack);
            });
        }
        setIsScreenSharing(false);
        screenShareStream.current = null;
    } else {
        // Start screen sharing
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenShareStream.current = stream;
            const screenTrack = stream.getVideoTracks()[0];
            
            Object.values(peerConnections.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                sender?.replaceTrack(screenTrack);
            });

            screenTrack.onended = () => {
                toggleScreenShare(); // Revert to camera when user stops sharing from browser UI
            };
            setIsScreenSharing(true);
        } catch (error) {
            console.error("Error sharing screen", error);
        }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Setting up your stream...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground relative">
      <main className="flex-1 flex flex-col">
        <VideoGrid localStream={localStream} remoteStreams={remoteStreams} />
        <CallControls
          onLeave={handleLeave}
          onToggleMute={toggleMute}
          isMuted={isMuted}
          onToggleVideo={toggleVideo}
          isVideoOff={isVideoOff}
          onToggleScreenShare={toggleScreenShare}
          isScreenSharing={isScreenSharing}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
        />
      </main>
      <ChatPanel
        roomId={roomId}
        peerId={peerId || ''}
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </div>
  );
}
