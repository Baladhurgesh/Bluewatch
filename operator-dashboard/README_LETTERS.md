# Auto-Generated Letters/Reports System

## Overview

The Auto-Generated Letters/Reports system fulfills Public Notification Rule (PNR) requirements automatically by generating PDF letters and reports based on violations and overdue tasks in the water system.

## Features

### 🚨 **Tier 1 - Urgent Notices (24 hours)**
- **Trigger**: High-priority violations that pose immediate health risks
- **Content**: Immediate action required notices with boil water advisories
- **Timeline**: Must be sent within 24 hours of violation detection
- **Recipients**: All customers in the affected area

### ⚠️ **Tier 2 - Violation Notices (30 days)**
- **Trigger**: Standard violations that don't pose immediate health risks
- **Content**: Standard violation notification with compliance information
- **Timeline**: Must be sent within 30 days of violation
- **Recipients**: All customers in the affected area

### 📊 **Tier 3 - Annual CCR Summaries**
- **Trigger**: Overdue tasks and annual reporting requirements
- **Content**: Annual Consumer Confidence Report summaries
- **Timeline**: Annual requirement
- **Recipients**: All customers

## Implementation Details

### PDF Generation
- **Library**: `pdf-lib` for client-side PDF generation
- **Templates**: Pre-defined templates for each tier
- **Content**: Auto-filled with system and violation data
- **Format**: Standard letter size (8.5" x 11")

### Auto-Detection Logic
```javascript
// Tier 1: High-priority violations
const tier1Violations = violations.filter(v => 
  v.status === 'Active' && 
  v.requires_action && 
  v.priority === 'High' && 
  !v.letter_generated
);

// Tier 2: Standard violations
const tier2Violations = violations.filter(v => 
  v.status === 'Active' && 
  v.requires_action && 
  v.priority !== 'High' && 
  !v.letter_generated
);

// Tier 3: Overdue tasks
const tier3Tasks = tasks.filter(t => 
  t.status === 'Overdue' && 
  t.daysLeft < -7 && 
  !t.letter_generated
);
```

### Letter Templates

#### Tier 1 Template
- **Header**: "URGENT NOTICE - IMMEDIATE ACTION REQUIRED"
- **Content**: 
  - Violation details
  - Contaminant information
  - Immediate action steps (boil water, use bottled water)
  - Contact information
- **Color**: Red theme for urgency

#### Tier 2 Template
- **Header**: "VIOLATION NOTICE"
- **Content**:
  - Violation type and details
  - Contaminant information
  - Compliance status
  - What the violation means
- **Color**: Orange theme for attention

#### Tier 3 Template
- **Header**: "ANNUAL WATER QUALITY REPORT"
- **Content**:
  - System information
  - Population served
  - Water source details
  - Annual summary
- **Color**: Blue theme for information

## Usage

### Auto-Generation
1. Click "Auto-Generate Letters" button
2. System detects violations and tasks requiring letters
3. Generates appropriate tier letters automatically
4. Letters appear in "Generated Letters" section

### Manual Generation
1. Select a letter template from the available options
2. Click "Generate Letter" button
3. PDF is created and available for download/preview

### Letter Management
- **Preview**: View generated letters in browser
- **Download**: Save PDF files locally
- **Email**: Send letters via email service (mock implementation)
- **Track**: Monitor letter status and recipient counts

## Technical Architecture

### Components
- `LetterGenerator.tsx`: Main letter generation component
- `EmailService.tsx`: Email sending service (mock)
- PDF generation using `pdf-lib`
- Integration with main dashboard

### Data Flow
1. **Detection**: System scans violations and tasks
2. **Classification**: Categorizes by tier requirements
3. **Generation**: Creates PDF with appropriate template
4. **Storage**: Saves letter metadata and PDF URL
5. **Distribution**: Provides download/email options

### Integration Points
- **Dashboard Data**: Uses violation and task data from main dashboard
- **System Info**: Incorporates water system details
- **Contact Info**: Uses system administrator contact information
- **Population Data**: Estimates recipient counts

## Production Considerations

### Email Integration
Current implementation includes a mock email service. For production, integrate with:
- **SendGrid**: Email delivery service
- **AWS SES**: Amazon Simple Email Service
- **Mailgun**: Transactional email service
- **Customer Database**: For recipient lists

### Compliance Tracking
- **Delivery Confirmation**: Track email delivery status
- **Audit Trail**: Log all letter generations and distributions
- **Regulatory Reporting**: Generate compliance reports
- **Deadline Monitoring**: Alert on approaching deadlines

### Scalability
- **Batch Processing**: Handle large recipient lists
- **Template Management**: Dynamic template updates
- **Multi-language Support**: Internationalization
- **Archive Management**: Long-term letter storage

## Configuration

### Letter Templates
Templates can be customized in `LetterGenerator.tsx`:
```javascript
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
  // ... more templates
];
```

### Trigger Logic
Modify detection logic in the component:
```javascript
const violationsNeedingLetters = violations.filter(v => 
  v.status === 'Active' && 
  v.requires_action && 
  !v.letter_generated
);
```

### PDF Styling
Customize PDF appearance in `generatePDF` function:
- Fonts and sizes
- Colors and themes
- Layout and spacing
- Header/footer content

## Future Enhancements

### Advanced Features
- **Multi-language Support**: Spanish, French, etc.
- **Accessibility**: Screen reader compatible PDFs
- **Digital Signatures**: Electronic signature integration
- **Template Editor**: Visual template builder
- **Bulk Operations**: Mass letter generation

### Integration Opportunities
- **GIS Integration**: Geographic targeting
- **Customer Portal**: Online letter access
- **Mobile Notifications**: SMS alerts
- **Social Media**: Public announcements
- **Press Releases**: Media distribution

### Analytics
- **Delivery Metrics**: Open rates, click rates
- **Compliance Tracking**: Deadline adherence
- **Customer Feedback**: Response monitoring
- **Cost Analysis**: Distribution costs

## Support

For questions or issues with the letter generation system:
1. Check the browser console for errors
2. Verify PDF generation dependencies
3. Ensure proper data formatting
4. Review template configurations

The system is designed to be compliant with EPA Public Notification Rule requirements while providing flexibility for customization and future enhancements. 