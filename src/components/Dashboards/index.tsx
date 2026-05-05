import React from 'react';
import { DashboardShell } from './DashboardShell';

export function AdminDashboard() {
  return (
    <DashboardShell 
      title="Admin Command Center" 
      subtitle="Complete visibility over all system records and logs."
      canCreate={true}
      canEdit={true}
      showAllRecords={true}
    />
  );
}

export function EditorDashboard() {
  return (
    <DashboardShell 
      title="Editor Dashboard" 
      subtitle="Manage your records with full publishing and editing rights."
      canCreate={true}
      canEdit={true}
      showAllRecords={false}
    />
  );
}

export function ViewerDashboard() {
  return (
    <DashboardShell 
      title="Viewer Dashboard" 
      subtitle="Access your personal records in read-only mode."
      canCreate={false}
      canEdit={false}
      showAllRecords={false}
    />
  );
}
