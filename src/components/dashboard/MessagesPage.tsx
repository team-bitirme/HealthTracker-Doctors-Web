'use client';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hastalarınızla mesajlaşın
        </p>
      </div>

      <div className="text-center py-12">
        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Mesajlaşma özelliği
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Bu özellik yakında eklenecek.
        </p>
      </div>
    </div>
  );
}