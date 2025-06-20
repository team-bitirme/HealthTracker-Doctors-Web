'use client';

import { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  UserIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Patient } from './Dashboard';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface ChatPanelProps {
  patient: Patient;
}

interface Message {
  id: string;
  content: string;
  sender_user_id: string;
  receiver_user_id: string;
  message_type_id: number;
  created_at: string;
  is_read: boolean;
}

export function ChatPanel({ patient }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [patientUserId, setPatientUserId] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchPatientUserId();
  }, [patient.id]);

  useEffect(() => {
    if (patientUserId) {
      fetchMessages();
      startPolling();

      return () => {
        stopPolling();
      };
    }
  }, [patientUserId, user?.id, patient.id]);

  // Polling sistemi başlatma
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      checkForNewMessages();
    }, 10000); // 10 saniyede bir kontrol
  };

  // Polling sistemi durdurma
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

    // Yeni mesajları kontrol etme
  const checkForNewMessages = async () => {
    if (!patientUserId || !user) return;

    try {
      let query = supabase
        .from('messages')
        .select('*')
        .or(`and(sender_user_id.eq.${user.id},receiver_user_id.eq.${patientUserId}),and(sender_user_id.eq.${patientUserId},receiver_user_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      // Eğer son mesaj zamanı varsa, sadece ondan sonraki mesajları al
      if (lastMessageTime) {
        query = query.gt('created_at', lastMessageTime);
      }

      const { data, error } = await query;

      if (error) throw error;

      const newMessages = data || [];

      // Eğer yeni mesajlar varsa mevcut mesajlara ekle
      if (newMessages.length > 0) {
        setMessages(prev => {
          // Duplicate kontrolü yap
          const existingIds = new Set(prev.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));

          if (uniqueNewMessages.length > 0) {
            // Son mesajın zamanını güncelle
            setLastMessageTime(uniqueNewMessages[uniqueNewMessages.length - 1].created_at);
            return [...prev, ...uniqueNewMessages];
          }

          return prev;
        });
      }
    } catch (error) {
      console.error('Yeni mesajlar kontrol edilirken hata:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Component unmount olduğunda polling'i durdur
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPatientUserId = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('user_id')
        .eq('id', patient.id)
        .single();

      if (error) throw error;
      setPatientUserId(data.user_id);
    } catch (error) {
      console.error('Hasta user_id alınırken hata:', error);
    }
  };

  const fetchMessages = async () => {
    if (!patientUserId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_user_id.eq.${user.id},receiver_user_id.eq.${patientUserId}),and(sender_user_id.eq.${patientUserId},receiver_user_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messages = data || [];
      setMessages(messages);

      // Son mesajın zamanını ayarla
      if (messages.length > 0) {
        setLastMessageTime(messages[messages.length - 1].created_at);
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !patientUserId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_user_id: user.id,
          receiver_user_id: patientUserId,
          message_type_id: 1, // Varsayılan metin mesajı tipi
          is_read: false
        });

      if (error) throw error;
      setNewMessage('');

      // Mesaj gönderildikten sonra hemen yeni mesajları kontrol et
      setTimeout(() => {
        checkForNewMessages();
      }, 500); // 500ms sonra kontrol et (mesajın veritabanına yazılması için kısa bir bekleme)

    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Dün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isMyMessage = (message: Message) => {
    return message.sender_user_id === user?.id;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {patient.name.charAt(0)}{patient.surname.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {patient.name} {patient.surname}
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-500">Çevrimiçi</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Mesajlar yükleniyor...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Henüz mesaj bulunmuyor</p>
            <p className="text-sm text-gray-400">İlk mesajınızı göndererek konuşmayı başlatın</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMyMessage(message)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`text-xs mt-1 ${
                    isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.created_at)}
                    {isMyMessage(message) && (
                      <span className="ml-2">
                        {message.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mesajınızı yazın..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                minHeight: '40px',
                maxHeight: '120px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending || !patientUserId}
            className={`p-2 rounded-lg transition-colors ${
              newMessage.trim() && !sending && patientUserId
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Enter = Gönder, Shift + Enter = Yeni satır</span>
          {sending && <span>Gönderiliyor...</span>}
        </div>
      </div>
    </div>
  );
}