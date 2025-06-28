import React, { useState } from 'react';
import { FaEnvelope, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

// Icon type definitions
const IconEnvelope = FaEnvelope as React.ComponentType<{ className?: string }>;
const IconSpinner = FaSpinner as React.ComponentType<{ className?: string }>;
const IconCheck = FaCheck as React.ComponentType<{ className?: string }>;
const IconTimes = FaTimes as React.ComponentType<{ className?: string }>;

interface EmailServiceProps {
  letter: any;
  system: any;
  onClose: () => void;
}

export const EmailService: React.FC<EmailServiceProps> = ({
  letter,
  system,
  onClose,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [recipientCount, setRecipientCount] = useState(system.population_served || 1000);
  const [emailSubject, setEmailSubject] = useState(`Water System Notification - ${system.name}`);
  const [emailMessage, setEmailMessage] = useState(
    `Dear Customer,\n\nPlease find attached the latest water system notification for ${system.name}.\n\nBest regards,\n${system.contact?.admin_name || 'System Administrator'}`
  );

  const sendEmail = async () => {
    setIsSending(true);
    setEmailStatus('sending');

    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success - in real implementation, this would call an email service
      setEmailStatus('success');
      
      // Update letter status
      letter.status = 'sent';
      
    } catch (error) {
      setEmailStatus('error');
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Send Letter via Email</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Letter Info */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-800 mb-2">Letter Details</h3>
            <div className="text-sm text-gray-600">
              <div>Template: {letter.templateId}</div>
              <div>System: {letter.systemName}</div>
              <div>Generated: {letter.generatedAt.toLocaleDateString()}</div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Count
              </label>
              <input
                type="number"
                value={recipientCount}
                onChange={(e) => setRecipientCount(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                placeholder="Number of recipients"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                placeholder="Email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Message
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                placeholder="Email message"
              />
            </div>
          </div>

          {/* Status Display */}
          {emailStatus !== 'idle' && (
            <div className={`p-4 rounded-lg ${
              emailStatus === 'sending' ? 'bg-blue-50 border border-blue-200' :
              emailStatus === 'success' ? 'bg-green-50 border border-green-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {emailStatus === 'sending' && <IconSpinner className="animate-spin text-blue-500" />}
                {emailStatus === 'success' && <IconCheck className="text-green-500" />}
                {emailStatus === 'error' && <IconTimes className="text-red-500" />}
                <span className={`font-medium ${
                  emailStatus === 'sending' ? 'text-blue-700' :
                  emailStatus === 'success' ? 'text-green-700' :
                  'text-red-700'
                }`}>
                  {emailStatus === 'sending' && 'Sending emails...'}
                  {emailStatus === 'success' && 'Emails sent successfully!'}
                  {emailStatus === 'error' && 'Error sending emails'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={sendEmail}
              disabled={isSending || emailStatus === 'success'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <IconEnvelope className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send Email'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>

          {/* Email Service Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Note:</strong> This is a mock implementation. In production, this would integrate with:
            <ul className="list-disc list-inside mt-1 ml-4">
              <li>Email service providers (SendGrid, AWS SES, etc.)</li>
              <li>Customer database for recipient lists</li>
              <li>Email templates and personalization</li>
              <li>Delivery tracking and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 