'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Wallet, Moon, Sun, Mail, Phone, MapPin, Save } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { useTheme } from '../providers';
import { getCurrentUser } from '@/lib/mockData';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const currentUser = getCurrentUser();
  
  const [formData, setFormData] = useState({
    fullName: currentUser.full_name,
    email: currentUser.email,
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    nearAccount: currentUser.near_account_id,
    emailNotifications: true,
    transactionAlerts: true,
    marketingEmails: false,
    twoFactorAuth: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Mock save - in production this would call an API
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account preferences and security
        </p>
      </motion.div>

      {/* Profile Settings */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Information
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full rounded-xl bg-white/50 dark:bg-gray-700/50 px-4 py-3 text-gray-900 dark:text-white backdrop-blur-sm outline-none border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full rounded-xl bg-white/50 dark:bg-gray-700/50 px-4 py-3 text-gray-900 dark:text-white backdrop-blur-sm outline-none border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full rounded-xl bg-white/50 dark:bg-gray-700/50 px-4 py-3 text-gray-900 dark:text-white backdrop-blur-sm outline-none border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full rounded-xl bg-white/50 dark:bg-gray-700/50 px-4 py-3 text-gray-900 dark:text-white backdrop-blur-sm outline-none border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>
      </GlassCard>

      {/* Blockchain Settings */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blockchain Account
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              NEAR Account ID
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.nearAccount}
                readOnly
                className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white outline-none cursor-not-allowed"
              />
              <span className="px-3 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold">
                Connected
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Your NEAR account is securely linked to your profile
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> All transactions are recorded on the NEAR blockchain for complete transparency and immutability.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Notification Settings */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
            </div>
            <button
              onClick={() => handleInputChange('emailNotifications', !formData.emailNotifications)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                formData.emailNotifications 
                  ? 'bg-blue-600 dark:bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  formData.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Transaction Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of transaction confirmations</p>
            </div>
            <button
              onClick={() => handleInputChange('transactionAlerts', !formData.transactionAlerts)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                formData.transactionAlerts 
                  ? 'bg-blue-600 dark:bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  formData.transactionAlerts ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Marketing Emails</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive promotional content and updates</p>
            </div>
            <button
              onClick={() => handleInputChange('marketingEmails', !formData.marketingEmails)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                formData.marketingEmails 
                  ? 'bg-blue-600 dark:bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  formData.marketingEmails ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Security Settings */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
            </div>
            <button
              onClick={() => handleInputChange('twoFactorAuth', !formData.twoFactorAuth)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                formData.twoFactorAuth 
                  ? 'bg-blue-600 dark:bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  formData.twoFactorAuth ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button className="w-full text-left px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
          </button>
        </div>
      </GlassCard>

      {/* Appearance Settings */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          {theme === 'dark' ? (
            <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Sun className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Appearance
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              theme === 'dark' 
                ? 'bg-blue-600 dark:bg-blue-500' 
                : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </GlassCard>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-4 text-white font-medium shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:shadow-xl"
      >
        <Save className="h-5 w-5" />
        Save Changes
      </motion.button>
    </div>
  );
}
