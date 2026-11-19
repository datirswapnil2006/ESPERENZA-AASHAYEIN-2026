// Centralized reactive state store supporting both Supabase Live and Local Synchronized fallback
import {
  initialFestivals,
  initialEvents,
  initialProfiles,
  initialAssignments,
  initialForms,
  initialFormFields,
  initialParticipants,
  initialAnnouncements,
  initialAuditLogs
} from '../utils/mockData';

class AppStateStore {
  constructor() {
    // Check if state is in memory
    this.festivals = [...initialFestivals];
    this.events = [...initialEvents];
    this.profiles = [...initialProfiles];
    this.assignments = [...initialAssignments];
    this.forms = [...initialForms];
    this.formFields = [...initialFormFields];
    this.participants = [...initialParticipants];
    this.announcements = [...initialAnnouncements];
    this.auditLogs = [...initialAuditLogs];

    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event, payload) {
    this.subscribers.forEach((cb) => {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('Subscription notify error:', err);
      }
    });
  }

  // Event methods
  addEvent(eventData) {
    const newEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      status: 'upcoming',
      is_featured: false,
      min_team_size: 1,
      max_team_size: 1,
      created_at: new Date().toISOString(),
      ...eventData,
    };
    this.events.unshift(newEvent);
    this.addAuditLog({
      action: 'CREATE_EVENT',
      table_name: 'events',
      record_id: newEvent.name,
      details: `Created new event "${newEvent.name}" under festival.`,
    });
    this.notify('events', { type: 'INSERT', new: newEvent });
    return newEvent;
  }

  updateEvent(eventId, updates) {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updates, updated_at: new Date().toISOString() };
      this.addAuditLog({
        action: 'UPDATE_EVENT',
        table_name: 'events',
        record_id: this.events[index].name,
        details: `Updated event parameters.`,
      });
      this.notify('events', { type: 'UPDATE', new: this.events[index] });
      return this.events[index];
    }
    return null;
  }

  archiveEvent(eventId) {
    return this.updateEvent(eventId, { status: 'archived' });
  }

  // Assignments
  assignCoordinator({ eventId, userId, role, assignedBy, previousAssignmentId }) {
    if (previousAssignmentId) {
      const prevIdx = this.assignments.findIndex(a => a.id === previousAssignmentId);
      if (prevIdx !== -1) {
        this.assignments[prevIdx] = {
          ...this.assignments[prevIdx],
          status: 'replaced',
          replaced_at: new Date().toISOString()
        };
      }
    }

    const newAssignment = {
      id: `assign-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      event_id: eventId,
      user_id: userId,
      role,
      status: 'active',
      assigned_by: assignedBy || 'system',
      created_at: new Date().toISOString()
    };

    this.assignments.unshift(newAssignment);
    const assignedUser = this.profiles.find(p => p.id === userId);
    const event = this.events.find(e => e.id === eventId);
    this.addAuditLog({
      action: 'ASSIGN_COORDINATOR',
      table_name: 'event_assignments',
      record_id: `${assignedUser?.full_name || 'User'} -> ${event?.name || 'Event'}`,
      details: `Assigned as ${role.replace('_', ' ')}.`,
      event_id: eventId,
    });
    this.notify('assignments', { type: 'INSERT', new: newAssignment });
    return newAssignment;
  }

  removeAssignment(assignmentId) {
    const idx = this.assignments.findIndex(a => a.id === assignmentId);
    if (idx !== -1) {
      this.assignments[idx] = { ...this.assignments[idx], status: 'inactive' };
      this.notify('assignments', { type: 'UPDATE', new: this.assignments[idx] });
    }
  }

  // Profile methods
  verifyFaculty(userId, isVerified) {
    const idx = this.profiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      this.profiles[idx] = { ...this.profiles[idx], is_verified: isVerified };
      this.addAuditLog({
        action: 'VERIFY_FACULTY',
        table_name: 'profiles',
        record_id: this.profiles[idx].full_name,
        details: `Faculty verification status changed to ${isVerified ? 'VERIFIED' : 'UNVERIFIED'}.`,
      });
      this.notify('profiles', { type: 'UPDATE', new: this.profiles[idx] });
      return this.profiles[idx];
    }
    return null;
  }

  addProfile(profile) {
    this.profiles.push(profile);
    this.notify('profiles', { type: 'INSERT', new: profile });
    return profile;
  }

  // Form methods
  saveForm(formData) {
    let form;
    const existingIdx = this.forms.findIndex(f => f.event_id === formData.event_id || (formData.id && f.id === formData.id));
    if (existingIdx !== -1) {
      this.forms[existingIdx] = { ...this.forms[existingIdx], ...formData, updated_at: new Date().toISOString() };
      form = this.forms[existingIdx];
      this.notify('forms', { type: 'UPDATE', new: form });
    } else {
      form = {
        id: `form-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        status: 'draft',
        created_at: new Date().toISOString(),
        ...formData,
      };
      this.forms.push(form);
      this.notify('forms', { type: 'INSERT', new: form });
    }
    return form;
  }

  saveFormField(fieldData) {
    if (fieldData.id) {
      const idx = this.formFields.findIndex(f => f.id === fieldData.id);
      if (idx !== -1) {
        this.formFields[idx] = { ...this.formFields[idx], ...fieldData };
        this.notify('formFields', { type: 'UPDATE', new: this.formFields[idx] });
        return this.formFields[idx];
      }
    }
    const newField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      options: fieldData.options || [],
      is_required: fieldData.is_required || false,
      field_order: this.formFields.filter(f => f.form_id === fieldData.form_id).length + 1,
      ...fieldData
    };
    this.formFields.push(newField);
    this.notify('formFields', { type: 'INSERT', new: newField });
    return newField;
  }

  deleteFormField(fieldId) {
    this.formFields = this.formFields.filter(f => f.id !== fieldId);
    this.notify('formFields', { type: 'DELETE', id: fieldId });
  }

  // Participants
  addParticipant(participantData) {
    const newParticipant = {
      id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      status: 'registered',
      created_at: new Date().toISOString(),
      ...participantData
    };
    this.participants.unshift(newParticipant);
    this.notify('participants', { type: 'INSERT', new: newParticipant });
    return newParticipant;
  }

  updateParticipantStatus(participantId, status) {
    const idx = this.participants.findIndex(p => p.id === participantId);
    if (idx !== -1) {
      this.participants[idx] = { ...this.participants[idx], status };
      this.notify('participants', { type: 'UPDATE', new: this.participants[idx] });
      return this.participants[idx];
    }
    return null;
  }

  // Audit Log
  addAuditLog(entry) {
    const log = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      user_name: entry.user_name || 'System / Admin',
      ...entry,
    };
    this.auditLogs.unshift(log);
    this.notify('auditLogs', { type: 'INSERT', new: log });
    return log;
  }

  // Announcements
  addAnnouncement(data) {
    const ann = {
      id: `ann-${Date.now()}`,
      is_active: true,
      created_at: new Date().toISOString(),
      ...data,
    };
    this.announcements.unshift(ann);
    this.notify('announcements', { type: 'INSERT', new: ann });
    return ann;
  }
}

export const appStore = new AppStateStore();
