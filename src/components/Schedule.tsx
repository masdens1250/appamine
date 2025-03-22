import React, { useState } from 'react';
import { CalendarRange, Plus, X, Edit2, Save, AlertTriangle } from 'lucide-react';

const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const timeSlots = ['08:00', '09:30', '11:00', '13:30', '15:00'];

interface Session {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string;
  group: string;
  sessionType: 'individual' | 'group'; // Added session type
}

export default function Schedule() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: string; time: string } | null>(null);
  const [newSession, setNewSession] = useState<Omit<Session, 'id'>>({
    day: '',
    time: '',
    title: '',
    description: '',
    group: '',
    sessionType: 'group' // Default to group session
  });

  const handleAddSession = () => {
    if (selectedTimeSlot) {
      setNewSession({
        day: selectedTimeSlot.day,
        time: selectedTimeSlot.time,
        title: '',
        description: '',
        group: '',
        sessionType: 'group'
      });
      setShowAddModal(true);
    }
  };

  const handleSaveSession = () => {
    if (selectedSession) {
      // Edit existing session
      setSessions(sessions.map(session =>
        session.id === selectedSession.id
          ? { ...selectedSession, ...newSession }
          : session
      ));
    } else {
      // Add new session
      setSessions([...sessions, {
        id: Math.random().toString(36).substr(2, 9),
        ...newSession
      }]);
    }
    setShowAddModal(false);
    setSelectedSession(null);
    setNewSession({
      day: '',
      time: '',
      title: '',
      description: '',
      group: '',
      sessionType: 'group'
    });
  };

  const handleDeleteSession = () => {
    if (selectedSession) {
      setSessions(sessions.filter(session => session.id !== selectedSession.id));
      setShowDeleteModal(false);
      setSelectedSession(null);
    }
  };

  const getSessionForSlot = (day: string, time: string) => {
    return sessions.find(session => session.day === day && session.time === time);
  };

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">الجدول الزمني</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">جدول الجلسات</h2>
          <div className="flex items-center gap-2 text-blue-500">
            <CalendarRange className="w-5 h-5" />
            <span>الأسبوع الحالي</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-right">الوقت</th>
                {weekDays.map((day) => (
                  <th key={day} className="px-4 py-2 text-right">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-t">
                  <td className="px-4 py-2 font-semibold">{time}</td>
                  {weekDays.map((day) => {
                    const session = getSessionForSlot(day, time);
                    return (
                      <td key={`${time}-${day}`} className="px-4 py-2">
                        <div
                          onClick={() => {
                            setSelectedTimeSlot({ day, time });
                            if (session) {
                              setSelectedSession(session);
                              setNewSession(session);
                              setShowAddModal(true);
                            } else {
                              handleAddSession();
                            }
                          }}
                          className={`h-16 border rounded-lg p-2 cursor-pointer transition-colors ${
                            session ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          {session ? (
                            <div className="h-full flex flex-col">
                              <div className="font-semibold text-sm truncate">{session.title}</div>
                              <div className="text-xs text-gray-500 truncate">{session.group}</div>
                              <div className="text-xs text-blue-500">
                                {session.sessionType === 'individual' ? 'جلسة فردية' : 'جلسة جماعية'}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                              <Plus className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedSession ? 'تعديل جلسة' : 'إضافة جلسة جديدة'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedSession(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان الجلسة
                </label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع الجلسة
                </label>
                <select
                  value={newSession.sessionType}
                  onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value as 'individual' | 'group' })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="group">جلسة جماعية</option>
                  <option value="individual">جلسة فردية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفوج
                </label>
                <input
                  type="text"
                  value={newSession.group}
                  onChange={(e) => setNewSession({ ...newSession, group: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {selectedSession && (
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 text-red-500 hover:text-red-600"
                >
                  حذف
                </button>
              )}
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedSession(null);
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveSession}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>حفظ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">تأكيد حذف الجلسة</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذه الجلسة؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteSession}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}