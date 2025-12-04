
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RoomHandler from '@/components/room-handler';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center gap-2">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">CollabZoom</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Seamless Video Meetings.
            </h2>
            <p className="text-lg text-muted-foreground">
              Create a new, private video room with a single click. A unique room ID will be generated for you to share with your colleagues. They can join your room using this ID. Enjoy high-quality video, screen sharing, and real-time messaging.
            </p>
          </div>
          <Card className="shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Create a new room or join an existing one using a room code.</CardDescription>
            </CardHeader>
            <CardContent>
              <RoomHandler />
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Powered by WebRTC & Firebase
      </footer>
    </div>
  );
}
