import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [contaminantInfo, setContaminantInfo] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/water_systems_data.json").then(res => {
        if (!res.ok) throw new Error("Failed to load water systems data");
        return res.json();
      }),
      fetch("/contaminant_info.json").then(res => {
        if (!res.ok) throw new Error("Failed to load contaminant info");
        return res.json();
      })
    ])
      .then(([systems, contaminants]) => {
        setData(systems);
        setContaminantInfo(contaminants);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getContaminantDetails = (codeOrName: string) => {
    if (!contaminantInfo) return null;
    return (
      contaminantInfo[codeOrName] ||
      Object.values(contaminantInfo).find((c: any) => c.code === String(codeOrName))
    );
  };

  const generateTasksFromViolations = (violations: any[]): any[] => {
    if (!violations || violations.length === 0) return [];
    const uniqueViolations = new Map();
    violations.forEach((violation, index) => {
      const uniqueKey = `${violation.violation_id || 'unknown'}-${violation.violation_type || 'unknown'}-${violation.contaminant_code || 'unknown'}`;
      if (!uniqueViolations.has(uniqueKey)) {
        const dueDate = violation.violation_begin_date || violation.first_reported || '2024-12-31';
        const daysLeft = calculateDaysLeft(dueDate);
        let taskStatus = 'Upcoming';
        if (violation.status === 'Resolved' || violation.status === 'Closed') {
          taskStatus = 'Completed';
        } else if (daysLeft < 0) {
          taskStatus = 'Overdue';
        } else if (daysLeft <= 7) {
          taskStatus = 'Due Soon';
        }
        const contaminantDetails = getContaminantDetails(violation.contaminant_name || violation.contaminant_code);
        const task = {
          id: `violation-${violation.violation_id || index}`,
          name: `${violation.violation_type_desc || violation.violation_type || ''} - ${contaminantDetails?.name || violation.contaminant_name || violation.contaminant_code}`,
          type: 'Violation',
          due: dueDate,
          status: taskStatus,
          daysLeft: daysLeft,
          locations: violation.requires_action ? '1' : '0',
          priority: violation.priority || 'Medium',
          description: `Violation ID: ${violation.violation_id}, Code: ${violation.violation_code}`,
          violation: violation,
          contaminantDetails: contaminantDetails || null
        };
        uniqueViolations.set(uniqueKey, task);
      }
    });
    return Array.from(uniqueViolations.values());
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default App; 