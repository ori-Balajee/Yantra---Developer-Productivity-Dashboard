import { useState } from 'react';
import { FolderPlus, Trash2, Edit3, Check, X, FolderOpen } from 'lucide-react';
import { mongoClient } from '../lib/mongodbClient';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function ProjectManager({ projects, onDataRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: COLORS[0] });
  const [editData, setEditData] = useState({ name: '', description: '', color: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mongoClient.createProject(formData);
    setFormData({ name: '', description: '', color: COLORS[0] });
    setShowForm(false);
    onDataRefresh();
  };

  const handleEdit = (project) => {
    setEditingId(project._id || null);
    setEditData({ name: project.name, description: project.description, color: project.color });
  };

  const handleSaveEdit = async (id) => {
    await mongoClient.updateProject(id, editData);
    setEditingId(null);
    onDataRefresh();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this project? Existing time sessions will keep their data.')) {
      await mongoClient.deleteProject(id);
      onDataRefresh();
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary-400" />
          Projects
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <FolderPlus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800/30 rounded-lg p-4 mb-4 space-y-4 animate-slide-up">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Project name"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
              <div className="flex gap-1 mt-0.5">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${formData.color === c ? 'scale-110 ring-2 ring-white/30' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description"
              className="input-field"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Create Project</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No projects yet. Create one to start tracking time!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {projects.map(project => (
            <div key={project._id} className="bg-slate-800/30 rounded-lg p-4 hover:bg-slate-800/50 transition-colors">
              {editingId === project._id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="input-field text-sm"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Description"
                    className="input-field text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditData({ ...editData, color: c })}
                          className={`w-5 h-5 rounded-full ${editData.color === c ? 'ring-2 ring-white/30' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveEdit(project._id)} className="p-2 text-accent-400 hover:bg-slate-700 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-700 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <h3 className="font-medium text-slate-200">{project.name}</h3>
                      <p className="text-sm text-slate-500">{project.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}