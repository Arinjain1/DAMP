import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CollaborationSheet from '../src/Modal and Sheets/CollaborationSheet';

export default function CollabPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const roomId = params.roomId || null;
  const matchId = params.matchId || null;
  const tab = params.tab || null;

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
      initialTab={tab}
    />
  );
}
