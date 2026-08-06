import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CollaborationSheet from '../src/Modal and Sheets/CollaborationSheet';

export default function CollabPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const roomId = params.roomId ? parseInt(params.roomId, 10) : null;
  const matchId = params.matchId ? parseInt(params.matchId, 10) : null;

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <CollaborationSheet
      isOpen={true}
      onClose={handleClose}
      initialRoomId={roomId}
      initialMatchId={matchId}
    />
  );
}
