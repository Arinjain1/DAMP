import React from 'react';
import { useRouter } from 'expo-router';
import CollaborationSheet from '../src/Modal and Sheets/CollaborationSheet';

export default function CollabPage() {
  const router = useRouter();

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
    />
  );
}
