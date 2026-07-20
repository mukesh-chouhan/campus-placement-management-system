import React, { useState, useEffect } from 'react';
import API from '../api/api';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, X, Megaphone, Bell, Calendar } from 'lucide-react';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    active: true
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/admin/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAnnouncement(null);
    setFormData({ title: '', content: '', category: 'GENERAL', active: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingAnnouncement(item);
    setFormData({
      title: item.title || '',
      content: item.content || '',
      category: item.category || 'GENERAL',
      active: item.active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingAnnouncement) {
        await API.put(`/api/admin/announcements/${editingAnnouncement.id}`, formData);
        toast.success('Announcement updated successfully!');
      } else {
        await API.post('/api/admin/announcements', formData);
        toast.success('Announcement published successfully!');
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving announcement.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await API.delete(`/api/admin/announcements/${id}`);
      toast.success('Announcement deleted successfully!');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Error deleting announcement.');
    }
  };

  const filteredAnnouncements = announcements.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 40, width: 250 }}></div>
        <div className="skeleton" style={{ height: 350 }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="workspace-header">
        <div className="header-title-group">
          <h1>Placement Announcements</h1>
          <span className="header-subtitle">Broadcast campus notices, interview schedules, and drive updates to candidate dashboards.</span>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>New Notice</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search announcements by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Card */}
      <div className="content-card">
        {filteredAnnouncements.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No placement announcements configured. Click "New Notice" above to post an update.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Title & Notice Details</th>
                  <th>Category</th>
                  <th>Published Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Megaphone size={16} className="text-primary" />
                          <span>{item.title}</span>
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                          {item.content}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{item.category}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <span className={`badge badge-${item.active ? 'success' : 'danger'}`}>
                        {item.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px' }}
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit Announcement"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px' }}
                          onClick={() => handleDelete(item.id)}
                          title="Delete Announcement"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAnnouncement ? 'Modify Placement Announcement' : 'Create Campus Announcement'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="title">Notice Title</label>
                  <input
                    id="title"
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Amazon Technical Interview Schedule Released"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category Tag</label>
                  <select
                    id="category"
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="DRIVE_UPDATE">DRIVE UPDATE</option>
                    <option value="INTERVIEW">INTERVIEW SCHEDULE</option>
                    <option value="IMPORTANT">IMPORTANT NOTICE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="content">Announcement Message Body</label>
                  <textarea
                    id="content"
                    className="form-control"
                    rows="4"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Provide clear details, instructions, links, or dates for candidate guidance..."
                    required
                  ></textarea>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <input
                    id="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="active" style={{ margin: 0, cursor: 'pointer' }}>Publish Active on Student Dashboard</label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Publishing...' : editingAnnouncement ? 'Save Updates' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
