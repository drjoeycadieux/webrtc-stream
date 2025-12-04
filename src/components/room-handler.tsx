
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { generateRoomId } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sparkles } from 'lucide-react';

export default function RoomHandler() {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // While the app is public, we can just navigate. In a real app,
      // you'd check if the room exists and is joinable.
      // const roomDoc = await getDoc(doc(db, 'rooms', roomCode));
      // if (!roomDoc.exists()) {
      //   toast({
      //     title: 'Room not found',
      //     description: 'The room code you entered does not exist.',
      //     variant: 'destructive',
      //   });
      //   return;
      // }
      router.push(`/room/${roomCode.trim()}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not verify room. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleCreateRoom} className="w-full font-semibold" size="lg">
        <Sparkles className="mr-2 h-5 w-5" />
        Create a New Room
      </Button>
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>
      <form onSubmit={handleJoinRoom} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" variant="secondary" disabled={isLoading}>
          {isLoading ? 'Joining...' : 'Join'}
        </Button>
      </form>
    </div>
  );
}
