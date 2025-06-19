'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface DashboardStats {
  totalPatients: number;
  unreadMessages: number;
  pendingComplaints: number;
}

interface RecentActivity {
  id: string;
  type: 'message' | 'complaint' | 'measurement';
  patientName: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface UnreadMessage {
  id: string;
  content: string;
  sender_name: string;
  sender_surname: string;
  created_at: string;
}

export function GeneralDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    unreadMessages: 0,
    pendingComplaints: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentActivities(),
        fetchUnreadMessages()
      ]);
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (!user?.id) return;

      // Get doctor's patients through doctor_patients table
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError) throw doctorError;

      const { data: doctorPatients, error: dpError } = await supabase
        .from('doctor_patients')
        .select(`
          patient_id,
          patients (
            id,
            name,
            surname,
            user_id
          )
        `)
        .eq('doctor_id', doctorData.id)
        .eq('is_deleted', false);

      if (dpError) throw dpError;

      const patientIds = doctorPatients?.map(dp => dp.patient_id) || [];
      const totalPatients = patientIds.length;

      // Get patient user IDs
      const patientUserIds = doctorPatients?.map(dp => dp.patients?.user_id).filter((id): id is string => Boolean(id)) || [];

      // Count unread messages (messages sent by patients to doctor)
      const { count: unreadMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_user_id', user.id)
        .in('sender_user_id', patientUserIds.length > 0 ? patientUserIds : [''])
        .eq('is_read', false);

      // Count pending complaints
      const { count: pendingComplaints } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .in('patient_id', patientIds.length > 0 ? patientIds : [''])
        .eq('is_active', true)
        .eq('is_deleted', false);

      setStats({
        totalPatients,
        unreadMessages: unreadMessages || 0,
        pendingComplaints: pendingComplaints || 0
      });

    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      if (!user?.id) return;

      // Get doctor's patients to map user IDs to names
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError) throw doctorError;

      const { data: doctorPatients, error: dpError } = await supabase
        .from('doctor_patients')
        .select(`
          patients (
            id,
            name,
            surname,
            user_id
          )
        `)
        .eq('doctor_id', doctorData.id)
        .eq('is_deleted', false);

      if (dpError) throw dpError;

      const patientUserIds = doctorPatients?.map(dp => dp.patients?.user_id).filter((id): id is string => Boolean(id)) || [];

      if (patientUserIds.length === 0) return;

      // Get unread messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, sender_user_id, created_at')
        .eq('receiver_user_id', user.id)
        .in('sender_user_id', patientUserIds)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!messagesError && messages) {
        const messagesWithNames = messages.map(message => {
          const patient = doctorPatients?.find(dp => dp.patients?.user_id === message.sender_user_id)?.patients;
          return {
            id: message.id,
            content: message.content || '',
            sender_name: patient?.name || '',
            sender_surname: patient?.surname || '',
            created_at: message.created_at || ''
          };
        });

        setUnreadMessages(messagesWithNames);
      }
    } catch (error) {
      console.error('Okunmamış mesajlar yüklenirken hata:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      if (!user?.id) return;

      // Get doctor's patients
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError) throw doctorError;

      const { data: doctorPatients, error: dpError } = await supabase
        .from('doctor_patients')
        .select(`
          patient_id,
          patients (
            id,
            name,
            surname,
            user_id
          )
        `)
        .eq('doctor_id', doctorData.id)
        .eq('is_deleted', false);

      if (dpError) throw dpError;

      const activities: RecentActivity[] = [];
      const patientIds = doctorPatients?.map(dp => dp.patient_id) || [];
      const patientUserIds = doctorPatients?.map(dp => dp.patients?.user_id).filter((id): id is string => Boolean(id)) || [];

      // Get recent messages
      if (patientUserIds.length > 0) {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .in('sender_user_id', patientUserIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!messagesError && messages) {
          messages.forEach(message => {
            const patient = doctorPatients?.find(dp => dp.patients?.user_id === message.sender_user_id)?.patients;
            if (patient) {
              activities.push({
                id: message.id,
                type: 'message',
                patientName: `${patient.name || ''} ${patient.surname || ''}`,
                description: (message.content || '').substring(0, 50) + ((message.content || '').length > 50 ? '...' : ''),
                timestamp: message.created_at || '',
                status: message.is_read ? 'read' : 'unread'
              });
            }
          });
        }
      }

      // Get recent complaints
      if (patientIds.length > 0) {
        const { data: complaints, error: complaintsError } = await supabase
          .from('complaints')
          .select(`
            *,
            patients (
              name,
              surname
            )
          `)
          .in('patient_id', patientIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!complaintsError && complaints) {
          complaints.forEach(complaint => {
            activities.push({
              id: complaint.id,
              type: 'complaint',
              patientName: `${complaint.patients?.name || ''} ${complaint.patients?.surname || ''}`,
              description: (complaint.description || '').substring(0, 50) + ((complaint.description || '').length > 50 ? '...' : ''),
              timestamp: complaint.created_at || '',
              status: complaint.is_active ? 'active' : 'resolved'
            });
          });
        }

        // Get recent health measurements
        const { data: measurements, error: measurementsError } = await supabase
          .from('health_measurements')
          .select(`
            *,
            patients (
              name,
              surname
            ),
            measurement_types (
              name,
              unit
            )
          `)
          .in('patient_id', patientIds)
          .order('measured_at', { ascending: false })
          .limit(5);

        if (!measurementsError && measurements) {
          measurements.forEach(measurement => {
            activities.push({
              id: measurement.id,
              type: 'measurement',
              patientName: `${measurement.patients?.name || ''} ${measurement.patients?.surname || ''}`,
              description: `${measurement.measurement_types?.name || ''}: ${measurement.value} ${measurement.measurement_types?.unit || ''}`,
              timestamp: measurement.measured_at || ''
            });
          });
        }
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 10));

    } catch (error) {
      console.error('Son aktiviteler yüklenirken hata:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return ChatBubbleLeftRightIcon;
      case 'complaint': return ExclamationTriangleIcon;
      case 'measurement': return ClockIcon;
      default: return ClockIcon;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    switch (type) {
      case 'message':
        return status === 'unread' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50';
      case 'complaint':
        return status === 'active' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
      case 'measurement': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;

    return date.toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
              ))}
            </div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Toplam Hasta</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Okunmamış Mesaj</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Aktif Şikayet</h3>
                <p className="text-3xl font-bold text-red-600">{stats.pendingComplaints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Unread Messages */}
        {unreadMessages.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Okunmamış Mesajlar</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {unreadMessages.map((message) => (
                  <div key={message.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-900">
                        {message.sender_name} {message.sender_surname}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {message.content.length > 100
                        ? message.content.substring(0, 100) + '...'
                        : message.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Son Aktiviteler</h3>
          </div>
          <div className="p-6">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz aktivite bulunmuyor
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type, activity.status)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.patientName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}