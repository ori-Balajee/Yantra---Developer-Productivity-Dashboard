import { useState } from 'react';
import { BookOpen, Plus, Trash2, Calendar, Smile, Meh, Frown, TrendingUp } from 'lucide-react';
import { mongoClient } from '../lib/mongodbClient';

const MOODS = [
  { value: 'great', icon: <Smile className="w-6 h-6" />, label: 'Great', color: 'text-accent-400' },
  { value: 'good', icon: <TrendingUp className="w-6 h-6" />, label: 'Good', color: 'text-primary-400' },
  { value: 'okay', icon: <Meh className="w-6 h-6" />, label: 'Okay', color: 'text-warm-400' },
  { value: 'struggling', icon: <Frown className="w-6 h-6" />, label: 'Struggling', color: 'text-red-400' },
];

export function DailyLogManager({ logs, onDataRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    accomplishments: [''],
    challenges: [''],
    learnings: [''],
    tomorrow: [''],
    mood: 'good',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanArray = (arr) => arr.filter(s => s.trim());
    await mongoClient.createLog({
      date: formData.date,
      accomplishments: cleanArray(formData.accomplishments),
      challenges: cleanArray(formData.challenges),
      learnings: cleanArray(formData.learnings),
      tomorrow: cleanArray(formData.tomorrow),
      mood: formData.mood,
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
      accomplishments: [''],
      challenges: [''],
      learnings: [''],
      tomorrow: [''],
      mood: 'good',
    });
    setShowForm(false);
    onDataRefresh();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this log?')) {
      await mongoClient.deleteLog(id);
      setSelectedLog(null);
      onDataRefresh();
    }
  };

  const addField = (field, index) => {
    const arr = [...formData[field]];
    arr.splice(index + 1, 0, '');
    setFormData({ ...formData, [field]: arr });
  };

  const removeField = (field, index) => {
    const arr = [...formData[field]];
    if (arr.length > 1) {
      arr.splice(index, 1);
      setFormData({ ...formData, [field]: arr });
    }
  };

  const updateField = (field, index, value) => {
    const arr = [...formData[field]];
    arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };

  const InputList = ({ field, placeholder }) => (
    <div className="space-y-2">
      {formData[field].map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(field, index, e.target.value)}
            placeholder={placeholder}
            className="input-field flex-1"
          />
          {formData[field].length > 1 && (
            <button
              type="button"
              onClick={() => removeField(field, index)}
              className="px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
            >
              &times;
            </button>
          )}
          <button
            type="button"
            onClick={() => addField(field, index)}
            className="px-3 py-2 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-400" />
            Daily Logs
          </h2>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Log
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-800/30 rounded-lg p-6 mb-6 space-y-6 animate-slide-up">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mood</label>
                <div className="flex gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood: mood.value })}
                      className={`p-3 rounded-lg transition-all ${formData.mood === mood.value ? `bg-slate-700 ${mood.color}` : 'hover:bg-slate-700/50 text-slate-400'}`}
                    >
                      {mood.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 text-accent-400">Accomplishments</label>
              <InputList field="accomplishments" placeholder="What did you achieve today?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 text-red-400">Challenges</label>
              <InputList field="challenges" placeholder="Any blockers or difficulties?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 text-primary-400">Learnings</label>
              <InputList field="learnings" placeholder="What did you learn today?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 text-warm-400">Tomorrow's Goals</label>
              <InputList field="tomorrow" placeholder="What's on deck for tomorrow?" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Save Log</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No logs yet. Start documenting your dev journey!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => {
              const moodInfo = MOODS.find(m => m.value === log.mood);
              return (
                <div
                  key={log._id}
                  onClick={() => setSelectedLog(selectedLog?._id === log._id ? null : log)}
                  className={`bg-slate-800/30 rounded-lg p-4 cursor-pointer transition-all ${selectedLog?._id === log._id ? 'ring-2 ring-primary-500' : 'hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={moodInfo?.color}>{moodInfo?.icon}</div>
                      <div>
                        <p className="font-medium text-slate-200">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-slate-500">{log.accomplishments.length} items completed</p>
                      </div>
                    </div>
                  </div>
                  {selectedLog?._id === log._id && (
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-4 animate-slide-down">
                      <LogSection title="Accomplishments" items={log.accomplishments} color="accent" />
                      <LogSection title="Challenges" items={log.challenges} color="red" />
                      <LogSection title="Learnings" items={log.learnings} color="primary" />
                      <LogSection title="Tomorrow's Goals" items={log.tomorrow} color="warm" />
                      <button onClick={() => handleDelete(log._id)} className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-900/20 flex items-center gap-2 mt-4">
                        <Trash2 className="w-4 h-4" />
                        Delete Log
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LogSection({ title, items, color }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className={`text-sm font-medium text-${color}-400 mb-2`}>{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
            <span className={`text-${color}-500 mt-1`}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}