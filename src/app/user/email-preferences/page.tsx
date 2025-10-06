/**
 * Email preferences page for users
 * /user/email-preferences
 */

'use client';

import { useState, useEffect } from 'react';

interface EmailPreferences {
  marketing: boolean;
  notifications: boolean;
  appointments: boolean;
  messages: boolean;
  passUpdates: boolean;
  blogUpdates: boolean;
}

export default function EmailPreferencesPage() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    marketing: true,
    notifications: true,
    appointments: true,
    messages: true,
    passUpdates: true,
    blogUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/account/email-preferences');
      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/email-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Vos préférences ont été enregistrées avec succès');
      } else {
        setMessage('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Préférences email</h1>
          <p className="mt-2 text-gray-600">
            Gérez les notifications que vous souhaitez recevoir par email
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Types de notifications
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Activez ou désactivez les types d'emails que vous souhaitez recevoir
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            <PreferenceItem
              title="Emails marketing"
              description="Promotions, nouveautés et offres spéciales"
              checked={preferences.marketing}
              onChange={() => handleToggle('marketing')}
            />

            <PreferenceItem
              title="Notifications générales"
              description="Notifications importantes sur votre compte"
              checked={preferences.notifications}
              onChange={() => handleToggle('notifications')}
            />

            <PreferenceItem
              title="Rendez-vous"
              description="Confirmations et rappels de rendez-vous"
              checked={preferences.appointments}
              onChange={() => handleToggle('appointments')}
            />

            <PreferenceItem
              title="Messages"
              description="Notifications de nouveaux messages"
              checked={preferences.messages}
              onChange={() => handleToggle('messages')}
            />

            <PreferenceItem
              title="PASS"
              description="Informations sur votre abonnement PASS"
              checked={preferences.passUpdates}
              onChange={() => handleToggle('passUpdates')}
            />

            <PreferenceItem
              title="Blog"
              description="Nouveaux articles et publications"
              checked={preferences.blogUpdates}
              onChange={() => handleToggle('blogUpdates')}
            />
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div>
                {message && (
                  <p
                    className={`text-sm ${
                      message.includes('succès')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                À propos des emails système
              </h3>
              <p className="mt-1 text-sm text-blue-800">
                Certains emails importants (confirmation de compte, réinitialisation de
                mot de passe, etc.) ne peuvent pas être désactivés pour des raisons de
                sécurité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PreferenceItemProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function PreferenceItem({ title, description, checked, onChange }: PreferenceItemProps) {
  return (
    <div className="p-6 flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
          checked ? 'bg-violet-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
