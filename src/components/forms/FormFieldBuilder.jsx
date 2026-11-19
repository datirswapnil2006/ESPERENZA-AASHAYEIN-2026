import React, { useState } from 'react';
import { formService } from '../../services/formService';
import { Plus, Trash2, ArrowUp, ArrowDown, Settings2, CheckCircle, Eye, EyeOff, Tag, ListPlus } from 'lucide-react';

export default function FormFieldBuilder({ form, onFieldsUpdated }) {
  const [fields, setFields] = useState(form?.fields || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newRequired, setNewRequired] = useState(false);
  const [optionsInput, setOptionsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'Single Line Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'dropdown', label: 'Dropdown Select' },
    { value: 'radio', label: 'Radio Button Group' },
    { value: 'checkbox', label: 'Checkbox Options' },
    { value: 'date', label: 'Date Picker' },
    { value: 'textarea', label: 'Multi-line Paragraph' },
  ];

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setSaving(true);
    try {
      let parsedOptions = [];
      if (['dropdown', 'radio', 'checkbox'].includes(newType) && optionsInput.trim()) {
        parsedOptions = optionsInput.split(',').map(s => s.trim()).filter(Boolean);
      }

      const fieldName = newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);

      const fieldPayload = {
        form_id: form.id,
        field_name: fieldName,
        label: newLabel,
        field_type: newType,
        placeholder: newPlaceholder,
        options: parsedOptions,
        is_required: newRequired,
        field_order: fields.length + 1,
      };

      const created = await formService.saveFormField(fieldPayload);
      const updatedList = [...fields, created];
      setFields(updatedList);
      if (onFieldsUpdated) onFieldsUpdated(updatedList);

      // Reset
      setNewLabel('');
      setNewType('text');
      setNewPlaceholder('');
      setNewRequired(false);
      setOptionsInput('');
      setShowAddModal(false);
    } catch (err) {
      alert('Error creating field: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Are you sure you want to delete this custom field?')) return;
    try {
      await formService.deleteFormField(fieldId);
      const updatedList = fields.filter(f => f.id !== fieldId);
      setFields(updatedList);
      if (onFieldsUpdated) onFieldsUpdated(updatedList);
    } catch (err) {
      alert('Error deleting field: ' + err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= fields.length) return;

    const copy = [...fields];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // Update orders
    copy.forEach((f, idx) => {
      f.field_order = idx + 1;
      formService.saveFormField(f);
    });

    setFields(copy);
    if (onFieldsUpdated) onFieldsUpdated(copy);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-light-blue-200">
        <div>
          <h3 className="font-extrabold text-base text-navy-blue flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary-blue" />
            <span>Registration Form Field Customizer</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Core student details (Name, ERP, Email, Mobile, Dept, Year, Sec) are always included automatically. Add event-specific questions below.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            {previewMode ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-primary-blue" />}
            <span>{previewMode ? 'Exit Preview' : 'Preview Live Form'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white shadow-soft flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Field</span>
          </button>
        </div>
      </div>

      {/* Field List or Preview */}
      {previewMode ? (
        <div className="bg-cream-50 p-6 rounded-3xl border border-light-blue-200 max-w-xl mx-auto space-y-4">
          <div className="text-center pb-4 border-b">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-blue bg-light-blue-100 px-2.5 py-1 rounded-full">
              Form Preview Mode
            </span>
            <h4 className="text-lg font-bold text-navy-blue mt-2">{form?.title || 'Participant Registration'}</h4>
            <p className="text-xs text-slate-500 mt-1">{form?.description}</p>
          </div>

          <div className="space-y-3 opacity-90 pointer-events-none">
            <div className="h-9 bg-white border rounded-xl px-3 flex items-center text-xs text-slate-400">
              Student Full Name *
            </div>
            <div className="h-9 bg-white border rounded-xl px-3 flex items-center text-xs text-slate-400">
              ERP Number *
            </div>
            {fields.map((f) => (
              <div key={f.id} className="space-y-1">
                <label className="text-xs font-semibold text-navy-blue">
                  {f.label} {f.is_required && <span className="text-rose-500">*</span>}
                </label>
                <div className="h-9 bg-white border rounded-xl px-3 flex items-center text-xs text-slate-400">
                  {f.placeholder || `Input for ${f.label}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-light-blue-200 text-center">
              <ListPlus className="w-10 h-10 text-primary-blue/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-navy-blue">No Custom Fields Added Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Only the standard college registration fields will be prompted. Click "Add Custom Field" to add specific questions like track duration, booth power sockets, or music genre.
              </p>
            </div>
          ) : (
            fields.map((field, idx) => (
              <div
                key={field.id}
                className="bg-white p-4 rounded-2xl border border-light-blue-200/80 shadow-soft flex items-center justify-between gap-4 hover:border-primary-blue/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-light-blue-50 text-primary-blue text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-navy-blue">{field.label}</h4>
                      {field.is_required ? (
                        <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Optional
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="capitalize font-medium text-primary-blue">{field.field_type}</span>
                      {field.placeholder && <span>Placeholder: "{field.placeholder}"</span>}
                      {field.options && field.options.length > 0 && (
                        <span>Options: {field.options.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === fields.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteField(field.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                    title="Delete Field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Custom Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-blue/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-light-blue-200 shadow-soft-lg space-y-4">
            <h3 className="text-base font-extrabold text-navy-blue border-b pb-3">Add Custom Registration Field</h3>

            <form onSubmit={handleAddField} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-blue mb-1">Field Label / Question *</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Dance Genre / Project Title / Power Socket Needed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-blue mb-1">Field Type *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue text-xs font-semibold"
                  >
                    {fieldTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-navy-blue mb-1">Requirement</label>
                  <div className="flex items-center h-10 gap-2">
                    <input
                      type="checkbox"
                      id="field_req"
                      checked={newRequired}
                      onChange={(e) => setNewRequired(e.target.checked)}
                      className="w-4 h-4 text-primary-blue rounded border-slate-300"
                    />
                    <label htmlFor="field_req" className="font-semibold text-slate-700 cursor-pointer">
                      Mandatory to fill
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-blue mb-1">Placeholder Text (Optional)</label>
                <input
                  type="text"
                  value={newPlaceholder}
                  onChange={(e) => setNewPlaceholder(e.target.value)}
                  placeholder="e.g. Select your preferred style"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {['dropdown', 'radio', 'checkbox'].includes(newType) && (
                <div>
                  <label className="block font-bold text-navy-blue mb-1">
                    Options (Comma separated) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={optionsInput}
                    onChange={(e) => setOptionsInput(e.target.value)}
                    placeholder="Solo, Duet, Group OR Option A, Option B, Option C"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Separate each choice with a comma.</p>
                </div>
              )}

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold shadow-soft"
                >
                  {saving ? 'Adding...' : 'Add Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
