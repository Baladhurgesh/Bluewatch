import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  FaFilePdf,
  FaEnvelope,
  FaDownload,
  FaEye,
  FaExclamationTriangle,
  FaClock,
  FaCalendarAlt,
} from 'react-icons/fa';
import { EmailService } from './EmailService';

// Icon type definitions
const IconPdf = FaFilePdf as React.ComponentType<{ className?: string }>;
const IconEnvelope = FaEnvelope as React.ComponentType<{ className?: string }>;
const IconDownload = FaDownload as React.ComponentType<{ className?: string }>;
const IconEye = FaEye as React.ComponentType<{ className?: string }>;
const IconExclaim = FaExclamationTriangle as React.ComponentType<{ className?: string }>;
const IconClock = FaClock as React.ComponentType<{ className?: string }>;
const IconCalendar = FaCalendarAlt as React.ComponentType<{ className?: string }>;

interface LetterTemplate {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  description: string;
  urgency: 'Urgent' | 'High' | 'Medium';
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface GeneratedLetter {
  id: string;
  templateId: string;
  systemId: string;
  systemName: string;
  violationId?: string;
  taskId?: string;
  generatedAt: Date;
  status: 'pending' | 'generated' | 'sent' | 'archived';
  pdfUrl?: string;
  recipientCount: number;
  dueDate: Date;
}

const letterTemplates: LetterTemplate[] = [
  {
    id: 'tier1-urgent',
    name: 'Tier 1 - Urgent Notice (24hrs)',
    tier: 1,
    description: 'Immediate public notification for acute health risks',
    urgency: 'Urgent',
    color: 'bg-red-500',
    icon: IconExclaim,
  },
  {
    id: 'tier2-violation',
    name: 'Tier 2 - Violation Notice (30 days)',
    tier: 2,
    description: 'Standard violation notification to customers',
    urgency: 'High',
    color: 'bg-orange-500',
    icon: IconClock,
  },
  {
    id: 'tier3-ccr',
    name: 'Tier 3 - Annual CCR Summary',
    tier: 3,
    description: 'Annual Consumer Confidence Report',
    urgency: 'Medium',
    color: 'bg-blue-500',
    icon: IconCalendar,
  },
];

interface LetterGeneratorProps {
  system: any;
  violations: any[];
  tasks: any[];
  onLetterGenerated: (letter: GeneratedLetter) => void;
}

export const LetterGenerator: React.FC<LetterGeneratorProps> = ({
  system,
  violations,
  tasks,
  onLetterGenerated,
}) => {
  const [generatedLetters, setGeneratedLetters] = useState<GeneratedLetter[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<GeneratedLetter | null>(null);
  const [emailLetter, setEmailLetter] = useState<GeneratedLetter | null>(null);

  // Auto-detect violations that need letters
  const violationsNeedingLetters = violations.filter(v => 
    v.status === 'Active' && 
    v.requires_action && 
    !generatedLetters.some(letter => letter.violationId === v.violation_id)
  );

  // Auto-detect overdue tasks that need letters
  const overdueTasksNeedingLetters = tasks.filter(t => 
    t.status === 'Overdue' && 
    t.daysLeft < -7 && 
    !generatedLetters.some(letter => letter.taskId === t.id)
  );

  const generatePDF = async (template: LetterTemplate, context: any): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard letter size
    const { height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Header
    page.drawText('WATER SYSTEM NOTIFICATION', {
      x: 50,
      y: height - 50,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // System Information
    page.drawText(`System: ${system.name}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font: font,
    });

    page.drawText(`PWS ID: ${system.pwsid}`, {
      x: 50,
      y: height - 120,
      size: 12,
      font: font,
    });

    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 140,
      size: 12,
      font: font,
    });

    // Template-specific content
    let yPosition = height - 200;
    
    if (template.tier === 1) {
      page.drawText('URGENT NOTICE - IMMEDIATE ACTION REQUIRED', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0.8, 0.2, 0.2),
      });
      yPosition -= 30;
      
      page.drawText('This notice is being sent to inform you of an immediate health risk in your drinking water.', {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
      });
      yPosition -= 40;
      
      if (context.violation) {
        page.drawText(`Violation: ${context.violation.violation_type}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: font,
        });
        yPosition -= 20;
        
        page.drawText(`Contaminant: ${context.violation.contaminant_name}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: font,
        });
        yPosition -= 40;
      }
      
      page.drawText('IMMEDIATE ACTIONS REQUIRED:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
      });
      yPosition -= 25;
      
      page.drawText('• Do not drink the water without boiling it first', {
        x: 70,
        y: yPosition,
        size: 11,
        font: font,
      });
      yPosition -= 20;
      
      page.drawText('• Use bottled water for drinking and cooking', {
        x: 70,
        y: yPosition,
        size: 11,
        font: font,
      });
      yPosition -= 20;
      
      page.drawText('• Contact your water system for updates', {
        x: 70,
        y: yPosition,
        size: 11,
        font: font,
      });
    } else if (template.tier === 2) {
      page.drawText('VIOLATION NOTICE', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0.6, 0.4, 0.2),
      });
      yPosition -= 30;
      
      page.drawText('This notice is being sent to inform you of a drinking water violation that occurred in our system.', {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
      });
      yPosition -= 40;
      
      if (context.violation) {
        page.drawText(`Violation Type: ${context.violation.violation_type}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: font,
        });
        yPosition -= 20;
        
        page.drawText(`Contaminant: ${context.violation.contaminant_name}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: font,
        });
        yPosition -= 20;
        
        page.drawText(`Date: ${context.violation.violation_begin_date}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: font,
        });
        yPosition -= 40;
      }
      
      page.drawText('What does this mean?', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
      });
      yPosition -= 25;
      
      page.drawText('This violation does not pose an immediate health risk, but we are working to resolve it promptly.', {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
      });
    } else if (template.tier === 3) {
      page.drawText('ANNUAL WATER QUALITY REPORT', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.8),
      });
      yPosition -= 30;
      
      page.drawText('This report provides information about your drinking water quality for the past year.', {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
      });
      yPosition -= 40;
      
      page.drawText('System Information:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
      });
      yPosition -= 25;
      
      page.drawText(`• Population Served: ${system.population_served}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: font,
      });
      yPosition -= 20;
      
      page.drawText(`• Water Source: ${system.primary_source}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: font,
      });
      yPosition -= 20;
      
      page.drawText(`• System Type: ${system.type}`, {
        x: 70,
        y: yPosition,
        size: 11,
        font: font,
      });
    }

    // Footer
    page.drawText('For questions, contact:', {
      x: 50,
      y: 100,
      size: 11,
      font: font,
    });
    
    page.drawText(`${system.contact?.admin_name || 'System Administrator'}`, {
      x: 50,
      y: 85,
      size: 11,
      font: font,
    });
    
    page.drawText(`${system.contact?.phone || 'Phone: Contact system'}`, {
      x: 50,
      y: 70,
      size: 11,
      font: font,
    });

    return await pdfDoc.save();
  };

  const generateLetter = async (templateId: string, context: any) => {
    setIsGenerating(true);
    try {
      const template = letterTemplates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      // Check if letter already exists for this violation/task
      const existingLetter = generatedLetters.find(letter => {
        if (context.violation && letter.violationId === context.violation.violation_id) {
          return true;
        }
        if (context.task && letter.taskId === context.task.id) {
          return true;
        }
        return false;
      });

      if (existingLetter) {
        alert(`A letter has already been generated for this ${context.violation ? 'violation' : 'task'}.`);
        return existingLetter;
      }

      const pdfBytes = await generatePDF(template, context);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      const letter: GeneratedLetter = {
        id: `letter-${Date.now()}`,
        templateId,
        systemId: system.pwsid,
        systemName: system.name,
        violationId: context.violation?.violation_id,
        taskId: context.task?.id,
        generatedAt: new Date(),
        status: 'generated',
        pdfUrl,
        recipientCount: context.recipientCount || 0,
        dueDate: new Date(Date.now() + (template.tier === 1 ? 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
      };

      setGeneratedLetters(prev => [...prev, letter]);
      onLetterGenerated(letter);
      
      // Mark violation/task as having letter generated
      if (context.violation) {
        context.violation.letter_generated = true;
      }
      if (context.task) {
        context.task.letter_generated = true;
      }

      return letter;
    } catch (error) {
      console.error('Error generating letter:', error);
      alert('Error generating letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLetter = (letter: GeneratedLetter) => {
    if (letter.pdfUrl) {
      const link = document.createElement('a');
      link.href = letter.pdfUrl;
      link.download = `letter-${letter.systemId}-${letter.templateId}.pdf`;
      link.click();
    }
  };

  const autoGenerateLetters = async () => {
    const lettersToGenerate = [];

    // Generate Tier 1 letters for urgent violations
    for (const violation of violationsNeedingLetters.filter(v => v.priority === 'High')) {
      lettersToGenerate.push({
        templateId: 'tier1-urgent',
        context: { violation, recipientCount: system.population_served || 1000 }
      });
    }

    // Generate Tier 2 letters for other violations
    for (const violation of violationsNeedingLetters.filter(v => v.priority !== 'High')) {
      lettersToGenerate.push({
        templateId: 'tier2-violation',
        context: { violation, recipientCount: system.population_served || 1000 }
      });
    }

    // Generate Tier 3 letters for overdue tasks
    for (const task of overdueTasksNeedingLetters) {
      lettersToGenerate.push({
        templateId: 'tier3-ccr',
        context: { task, recipientCount: system.population_served || 1000 }
      });
    }

    for (const letter of lettersToGenerate) {
      await generateLetter(letter.templateId, letter.context);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-Generation Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Auto-Generated Letters</h3>
          <button
            onClick={autoGenerateLetters}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <IconPdf className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Auto-Generate Letters'}
          </button>
        </div>

        {/* Detection Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconExclaim className="text-red-500" />
              <span className="font-semibold text-red-700">Tier 1 Required</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {violationsNeedingLetters.filter(v => v.priority === 'High').length}
            </div>
            <div className="text-sm text-red-600">Urgent violations</div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconClock className="text-orange-500" />
              <span className="font-semibold text-orange-700">Tier 2 Required</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {violationsNeedingLetters.filter(v => v.priority !== 'High').length}
            </div>
            <div className="text-sm text-orange-600">Standard violations</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconCalendar className="text-blue-500" />
              <span className="font-semibold text-blue-700">Tier 3 Required</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {overdueTasksNeedingLetters.length}
            </div>
            <div className="text-sm text-blue-600">Overdue tasks</div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">Letter Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {letterTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`p-2 rounded-full ${template.color} text-white`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.urgency}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Generation */}
        {selectedTemplate && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-700 mb-3">Generate Letter</h4>
            <div className="flex gap-4">
              <button
                onClick={() => generateLetter(selectedTemplate, { recipientCount: system.population_served || 1000 })}
                disabled={isGenerating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <IconPdf className="w-4 h-4" />
                Generate {letterTemplates.find(t => t.id === selectedTemplate)?.name}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generated Letters */}
      {generatedLetters.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Letters</h3>
          <div className="space-y-3">
            {generatedLetters.map((letter) => {
              const template = letterTemplates.find(t => t.id === letter.templateId);
              const Icon = template?.icon || IconPdf;
              return (
                <div key={letter.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-full ${template?.color || 'bg-gray-500'} text-white`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">{template?.name}</div>
                      <div className="text-sm text-gray-500">
                        Generated: {letter.generatedAt.toLocaleDateString()} • 
                        Recipients: {letter.recipientCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewLetter(letter)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Preview"
                    >
                      <IconEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadLetter(letter)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Download"
                    >
                      <IconDownload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEmailLetter(letter)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                      title="Send Email"
                    >
                      <IconEnvelope className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Letter Preview</h2>
              <button
                onClick={() => setPreviewLetter(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            {previewLetter.pdfUrl && (
              <iframe
                src={previewLetter.pdfUrl}
                className="w-full h-96 border rounded"
                title="Letter Preview"
              />
            )}
          </div>
        </div>
      )}

      {/* Email Service Modal */}
      {emailLetter && (
        <EmailService
          letter={emailLetter}
          system={system}
          onClose={() => setEmailLetter(null)}
        />
      )}
    </div>
  );
}; 