import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  User, Award, BookOpen, GraduationCap, FileText, Upload, ExternalLink, 
  Briefcase, Code, FolderGit2, Trophy, Plus, Trash2, Edit3, X, Check, 
  Globe, Layers, Database, Cpu, Languages 
} from 'lucide-react';

const StudentProfile = () => {
  const { updateLocalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('academic'); // academic, experience, skills, projects, accomplishments

  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    cgpa: '',
    backlogs: '',
    graduationYear: '',
    skills: ''
  });

  const [uploadingResume, setUploadingResume] = useState(false);

  // Module States parsed from JSON
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skillCategories, setSkillCategories] = useState({
    technicalSkills: [],
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    coreSubjects: [],
    spokenLanguages: []
  });
  const [accomplishments, setAccomplishments] = useState([]);

  // Modal Control States
  const [modalType, setModalType] = useState(null); // 'experience', 'project', 'accomplishment', 'skills'
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  // Experience Form State
  const [expForm, setExpForm] = useState({
    companyName: '',
    role: '',
    employmentType: 'Internship',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
    skillsUsed: ''
  });

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    projectTitle: '',
    description: '',
    technologiesUsed: '',
    teamSize: '1',
    role: '',
    githubLink: '',
    liveDemoLink: '',
    startDate: '',
    endDate: ''
  });

  // Accomplishment Form State
  const [accomplishmentForm, setAccomplishmentForm] = useState({
    type: 'Certification', // Certification, Award, Hackathon, Contest Rank, Publication
    title: '',
    issuer: '',
    issueDate: '',
    rank: '',
    link: '',
    description: ''
  });

  // Skills Tag Input States
  const [newTagInput, setNewTagInput] = useState({
    technicalSkills: '',
    programmingLanguages: '',
    frameworks: '',
    databases: '',
    coreSubjects: '',
    spokenLanguage: '',
    spokenProficiency: 'Professional'
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/students/me');
      const data = res.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        branch: data.branch || '',
        cgpa: data.cgpa || '',
        backlogs: data.backlogs !== undefined ? data.backlogs : '0',
        graduationYear: data.graduationYear || '2026',
        skills: data.skills ? data.skills.join(', ') : ''
      });

      // Parse Module JSONs
      if (data.experiencesJson) {
        try { setExperiences(JSON.parse(data.experiencesJson)); } catch (e) {}
      }
      if (data.projectsJson) {
        try { setProjects(JSON.parse(data.projectsJson)); } catch (e) {}
      }
      if (data.skillCategoriesJson) {
        try { setSkillCategories(JSON.parse(data.skillCategoriesJson)); } catch (e) {}
      }
      if (data.accomplishmentsJson) {
        try { setAccomplishments(JSON.parse(data.accomplishmentsJson)); } catch (e) {}
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error loading profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveFullProfile = async (updatedData) => {
    try {
      const payload = {
        name: updatedData.name ?? formData.name,
        email: updatedData.email ?? formData.email,
        branch: updatedData.branch ?? formData.branch,
        cgpa: parseFloat(updatedData.cgpa ?? formData.cgpa),
        backlogs: parseInt(updatedData.backlogs ?? formData.backlogs),
        graduationYear: parseInt(updatedData.graduationYear ?? formData.graduationYear),
        skills: updatedData.skills !== undefined ? updatedData.skills : (formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []),
        experiencesJson: JSON.stringify(updatedData.experiences ?? experiences),
        projectsJson: JSON.stringify(updatedData.projects ?? projects),
        skillCategoriesJson: JSON.stringify(updatedData.skillCategories ?? skillCategories),
        accomplishmentsJson: JSON.stringify(updatedData.accomplishments ?? accomplishments)
      };

      const res = await API.put('/api/students/me', payload);
      setProfile(res.data);
      updateLocalUser(res.data);
      toast.success('Profile saved successfully!');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
      throw err;
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a PDF document file.');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    setUploadingResume(true);
    try {
      const res = await API.post('/api/students/me/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data);
      toast.success('PDF Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  // --- Experience Handlers ---
  const handleOpenExpModal = (index = null) => {
    if (index !== null) {
      setEditingItemIndex(index);
      setExpForm({ ...experiences[index] });
    } else {
      setEditingItemIndex(null);
      setExpForm({
        companyName: '',
        role: '',
        employmentType: 'Internship',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        description: '',
        skillsUsed: ''
      });
    }
    setModalType('experience');
  };

  const handleSaveExp = async (e) => {
    e.preventDefault();
    let newExpList = [...experiences];
    if (editingItemIndex !== null) {
      newExpList[editingItemIndex] = expForm;
    } else {
      newExpList.unshift({ ...expForm, id: Date.now() });
    }
    setExperiences(newExpList);
    setModalType(null);
    await saveFullProfile({ experiences: newExpList });
  };

  const handleDeleteExp = async (index) => {
    if (!window.confirm('Delete this work experience entry?')) return;
    const newExpList = experiences.filter((_, i) => i !== index);
    setExperiences(newExpList);
    await saveFullProfile({ experiences: newExpList });
  };

  // --- Project Handlers ---
  const handleOpenProjectModal = (index = null) => {
    if (index !== null) {
      setEditingItemIndex(index);
      setProjectForm({ ...projects[index] });
    } else {
      setEditingItemIndex(null);
      setProjectForm({
        projectTitle: '',
        description: '',
        technologiesUsed: '',
        teamSize: '1',
        role: '',
        githubLink: '',
        liveDemoLink: '',
        startDate: '',
        endDate: ''
      });
    }
    setModalType('project');
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    let newProjList = [...projects];
    if (editingItemIndex !== null) {
      newProjList[editingItemIndex] = projectForm;
    } else {
      newProjList.unshift({ ...projectForm, id: Date.now() });
    }
    setProjects(newProjList);
    setModalType(null);
    await saveFullProfile({ projects: newProjList });
  };

  const handleDeleteProject = async (index) => {
    if (!window.confirm('Delete this project entry?')) return;
    const newProjList = projects.filter((_, i) => i !== index);
    setProjects(newProjList);
    await saveFullProfile({ projects: newProjList });
  };

  // --- Accomplishment Handlers ---
  const handleOpenAccomplishmentModal = (index = null) => {
    if (index !== null) {
      setEditingItemIndex(index);
      setAccomplishmentForm({ ...accomplishments[index] });
    } else {
      setEditingItemIndex(null);
      setAccomplishmentForm({
        type: 'Certification',
        title: '',
        issuer: '',
        issueDate: '',
        rank: '',
        link: '',
        description: ''
      });
    }
    setModalType('accomplishment');
  };

  const handleSaveAccomplishment = async (e) => {
    e.preventDefault();
    let newAccList = [...accomplishments];
    if (editingItemIndex !== null) {
      newAccList[editingItemIndex] = accomplishmentForm;
    } else {
      newAccList.unshift({ ...accomplishmentForm, id: Date.now() });
    }
    setAccomplishments(newAccList);
    setModalType(null);
    await saveFullProfile({ accomplishments: newAccList });
  };

  const handleDeleteAccomplishment = async (index) => {
    if (!window.confirm('Delete this accomplishment record?')) return;
    const newAccList = accomplishments.filter((_, i) => i !== index);
    setAccomplishments(newAccList);
    await saveFullProfile({ accomplishments: newAccList });
  };

  // --- Skills Category Tag Handlers ---
  const handleAddSkillTag = async (category) => {
    const val = newTagInput[category]?.trim();
    if (!val) return;
    const currentList = skillCategories[category] || [];
    if (currentList.includes(val)) {
      toast.error('Skill tag already added.');
      return;
    }
    const updatedCats = {
      ...skillCategories,
      [category]: [...currentList, val]
    };
    setSkillCategories(updatedCats);
    setNewTagInput(prev => ({ ...prev, [category]: '' }));
    await saveFullProfile({ skillCategories: updatedCats });
  };

  const handleRemoveSkillTag = async (category, tag) => {
    const updatedCats = {
      ...skillCategories,
      [category]: (skillCategories[category] || []).filter(t => t !== tag)
    };
    setSkillCategories(updatedCats);
    await saveFullProfile({ skillCategories: updatedCats });
  };

  const handleAddSpokenLanguage = async () => {
    const lang = newTagInput.spokenLanguage?.trim();
    const prof = newTagInput.spokenProficiency;
    if (!lang) return;
    const currentList = skillCategories.spokenLanguages || [];
    const updatedCats = {
      ...skillCategories,
      spokenLanguages: [...currentList.filter(l => l.language.toLowerCase() !== lang.toLowerCase()), { language: lang, proficiency: prof }]
    };
    setSkillCategories(updatedCats);
    setNewTagInput(prev => ({ ...prev, spokenLanguage: '' }));
    await saveFullProfile({ skillCategories: updatedCats });
  };

  const handleRemoveSpokenLanguage = async (langName) => {
    const updatedCats = {
      ...skillCategories,
      spokenLanguages: (skillCategories.spokenLanguages || []).filter(l => l.language !== langName)
    };
    setSkillCategories(updatedCats);
    await saveFullProfile({ skillCategories: updatedCats });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 40, width: 250 }}></div>
        <div className="skeleton" style={{ height: 400 }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="workspace-header">
        <div className="header-title-group">
          <h1>Placement Student Profile</h1>
          <span className="header-subtitle">Comprehensive career dossier for campus recruitment portals (CoCubes & Superset format).</span>
        </div>
      </div>

      {/* Top PDF Resume Management Card */}
      <div className="content-card" style={{ marginBottom: 20, borderTop: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', margin: 0 }}>
              <FileText size={18} className="text-primary" />
              <span>Official Student PDF Resume</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Attached document is visible to recruiters during placement drives.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {profile?.resumeUrl && (
              <a 
                href={`https://campus-placement-management-system-v6j0.onrender.com${profile.resumeUrl}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ExternalLink size={14} />
                <span>View PDF Resume</span>
              </a>
            )}
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Upload size={14} />
              <span>{uploadingResume ? 'Uploading...' : profile?.resumeUrl ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}</span>
              <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} disabled={uploadingResume} />
            </label>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'academic', label: 'Academic Details', icon: BookOpen },
          { id: 'experience', label: `Work Experience (${experiences.length})`, icon: Briefcase },
          { id: 'skills', label: 'Skills & Languages', icon: Code },
          { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
          { id: 'accomplishments', label: `Accomplishments (${accomplishments.length})`, icon: Trophy }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '8px 8px 0 0',
                fontSize: '0.85rem',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Academic & Basic Details */}
      {activeTab === 'academic' && (
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="card-title" style={{ margin: 0 }}>Academic Credentials</h2>
            {!isEditingBasic ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingBasic(true)}>
                <Edit3 size={14} /> Edit Credentials
              </button>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingBasic(false)}>
                Cancel
              </button>
            )}
          </div>

          {isEditingBasic ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              await saveFullProfile({
                name: formData.name,
                email: formData.email,
                branch: formData.branch,
                cgpa: formData.cgpa,
                backlogs: formData.backlogs,
                graduationYear: formData.graduationYear,
                skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
              });
              setIsEditingBasic(false);
            }}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input id="name" type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="branch">Academic Branch</label>
                  <select id="branch" className="form-control" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })} required>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics Engineering">Electronics Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cgpa">Cumulative CGPA</label>
                  <input id="cgpa" type="number" step="0.01" min="0" max="10" className="form-control" value={formData.cgpa} onChange={e => setFormData({ ...formData, cgpa: e.target.value })} required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="backlogs">Active Backlogs</label>
                  <input id="backlogs" type="number" min="0" className="form-control" value={formData.backlogs} onChange={e => setFormData({ ...formData, backlogs: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label htmlFor="graduationYear">Graduation Cohort</label>
                  <input id="graduationYear" type="number" className="form-control" value={formData.graduationYear} onChange={e => setFormData({ ...formData, graduationYear: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="profile-grid">
              <div className="profile-field">
                <span className="profile-label">Student Name</span>
                <span className="profile-value">{profile.name}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">Email Address</span>
                <span className="profile-value">{profile.email}</span>
              </div>
              <div className="profile-field" style={{ marginTop: 12 }}>
                <span className="profile-label">Roll Number</span>
                <span className="profile-value">{profile.rollNumber}</span>
              </div>
              <div className="profile-field" style={{ marginTop: 12 }}>
                <span className="profile-label">Academic Branch</span>
                <span className="profile-value">{profile.branch}</span>
              </div>
              <div className="profile-field" style={{ marginTop: 12 }}>
                <span className="profile-label">Cumulative CGPA</span>
                <span className="profile-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {profile.cgpa ? Number(profile.cgpa).toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="profile-field" style={{ marginTop: 12 }}>
                <span className="profile-label">Active Backlogs</span>
                <span className="profile-value" style={{ color: profile.backlogs > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                  {profile.backlogs}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Internships & Work Experience */}
      {activeTab === 'experience' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Internships & Professional Work Experience</h3>
            <button className="btn btn-primary btn-sm" onClick={() => handleOpenExpModal()}>
              <Plus size={16} /> Add Experience
            </button>
          </div>

          {experiences.length === 0 ? (
            <div className="content-card" style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No internships or work experience added yet. Click Add Experience above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {experiences.map((exp, idx) => (
                <div key={idx} className="content-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{exp.role}</h4>
                      <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.95rem' }}>{exp.companyName}</span>
                      <span className="badge badge-primary" style={{ marginLeft: 10, fontSize: '0.7rem' }}>{exp.employmentType}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleOpenExpModal(idx)}>
                        <Edit3 size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleDeleteExp(idx)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '8px 0' }}>
                    📅 {exp.startDate || 'N/A'} &mdash; {exp.currentlyWorking ? 'Present' : (exp.endDate || 'N/A')}
                  </div>

                  {exp.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'pre-line', margin: '8px 0' }}>
                      {exp.description}
                    </p>
                  )}

                  {exp.skillsUsed && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {exp.skillsUsed.split(',').map((s, i) => (
                        <span key={i} className="skill-tag" style={{ fontSize: '0.75rem' }}>{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Skills, Core Subjects & Spoken Languages */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Technical Skills & Languages Grid */}
          {[
            { key: 'technicalSkills', title: 'Technical Skills', placeholder: 'e.g. Data Structures, React, Node.js', icon: Code },
            { key: 'programmingLanguages', title: 'Programming Languages', placeholder: 'e.g. Java, Python, C++', icon: Cpu },
            { key: 'frameworks', title: 'Frameworks & Libraries', placeholder: 'e.g. Spring Boot, React Native, Django', icon: Layers },
            { key: 'databases', title: 'Databases & Cloud', placeholder: 'e.g. MySQL, PostgreSQL, MongoDB, AWS', icon: Database },
            { key: 'coreSubjects', title: 'Core Computer Science Subjects', placeholder: 'e.g. DBMS, Operating Systems, Computer Networks', icon: BookOpen }
          ].map(cat => {
            const CatIcon = cat.icon;
            const tags = skillCategories[cat.key] || [];
            return (
              <div key={cat.key} className="content-card" style={{ margin: 0 }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', marginBottom: 12 }}>
                  <CatIcon size={18} className="text-primary" />
                  <span>{cat.title}</span>
                </h4>

                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={cat.placeholder}
                    value={newTagInput[cat.key] || ''}
                    onChange={e => setNewTagInput({ ...newTagInput, [cat.key]: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillTag(cat.key); } }}
                    style={{ maxWidth: 400 }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => handleAddSkillTag(cat.key)}>
                    <Plus size={14} /> Add Tag
                  </button>
                </div>

                <div className="skills-tags">
                  {tags.map((tag, i) => (
                    <span key={i} className="skill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span>{tag}</span>
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkillTag(cat.key, tag)} />
                    </span>
                  ))}
                  {tags.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tags added yet.</span>}
                </div>
              </div>
            );
          })}

          {/* Spoken Languages */}
          <div className="content-card" style={{ margin: 0 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', marginBottom: 12 }}>
              <Languages size={18} className="text-primary" />
              <span>Spoken Languages & Proficiency</span>
            </h4>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. English, Hindi, German"
                value={newTagInput.spokenLanguage || ''}
                onChange={e => setNewTagInput({ ...newTagInput, spokenLanguage: e.target.value })}
                style={{ maxWidth: 220 }}
              />
              <select
                className="form-control"
                value={newTagInput.spokenProficiency || 'Professional'}
                onChange={e => setNewTagInput({ ...newTagInput, spokenProficiency: e.target.value })}
                style={{ maxWidth: 200 }}
              >
                <option value="Native / Full Professional">Native / Full Professional</option>
                <option value="Professional Working">Professional Working</option>
                <option value="Elementary">Elementary</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={handleAddSpokenLanguage}>
                <Plus size={14} /> Add Language
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(skillCategories.spokenLanguages || []).map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-body)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.language}</span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{item.proficiency}</span>
                  <X size={14} style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => handleRemoveSpokenLanguage(item.language)} />
                </div>
              ))}
              {(skillCategories.spokenLanguages || []).length === 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No spoken languages added.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Projects Portfolio */}
      {activeTab === 'projects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Projects Portfolio</h3>
            <button className="btn btn-primary btn-sm" onClick={() => handleOpenProjectModal()}>
              <Plus size={16} /> Add Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="content-card" style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No software/hardware projects listed. Showcase your top projects to employers!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {projects.map((proj, idx) => (
                <div key={idx} className="content-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{proj.projectTitle}</h4>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '4px' }} onClick={() => handleOpenProjectModal(idx)}>
                          <Edit3 size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" style={{ padding: '4px' }} onClick={() => handleDeleteProject(idx)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0', whiteSpace: 'pre-line' }}>
                      {proj.description}
                    </p>

                    {proj.technologiesUsed && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '8px 0' }}>
                        {proj.technologiesUsed.split(',').map((tech, i) => (
                          <span key={i} className="skill-tag" style={{ fontSize: '0.7rem' }}>{tech.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Team Size: {proj.teamSize || '1'}</span>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {proj.githubLink && (
                        <a href={proj.githubLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                          GitHub
                        </a>
                      )}
                      {proj.liveDemoLink && (
                        <a href={proj.liveDemoLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Accomplishments & Certifications */}
      {activeTab === 'accomplishments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Certifications, Awards & Hackathon Accomplishments</h3>
            <button className="btn btn-primary btn-sm" onClick={() => handleOpenAccomplishmentModal()}>
              <Plus size={16} /> Add Accomplishment
            </button>
          </div>

          {accomplishments.length === 0 ? (
            <div className="content-card" style={{ padding: '50px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No certifications, hackathon wins, or contest ranks listed.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {accomplishments.map((acc, idx) => (
                <div key={idx} className="content-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginBottom: 4 }}>{acc.type}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{acc.title}</h4>
                      {acc.issuer && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{acc.issuer}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleOpenAccomplishmentModal(idx)}>
                        <Edit3 size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleDeleteAccomplishment(idx)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {acc.rank && (
                    <div style={{ margin: '6px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                      🏆 Rank / Position: {acc.rank}
                    </div>
                  )}

                  {acc.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '6px 0' }}>{acc.description}</p>
                  )}

                  {acc.link && (
                    <a href={acc.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <ExternalLink size={12} /> View Certificate / Credential Link
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Experience Modal */}
      {modalType === 'experience' && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItemIndex !== null ? 'Modify Work Experience' : 'Add Work Experience / Internship'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveExp}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label>Company / Organization Name</label>
                  <input type="text" className="form-control" value={expForm.companyName} onChange={e => setExpForm({ ...expForm, companyName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Role / Position</label>
                  <input type="text" className="form-control" value={expForm.role} onChange={e => setExpForm({ ...expForm, role: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select className="form-control" value={expForm.employmentType} onChange={e => setExpForm({ ...expForm, employmentType: e.target.value })}>
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" className="form-control" value={expForm.startDate} onChange={e => setExpForm({ ...expForm, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" className="form-control" value={expForm.endDate} disabled={expForm.currentlyWorking} onChange={e => setExpForm({ ...expForm, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="currWork" checked={expForm.currentlyWorking} onChange={e => setExpForm({ ...expForm, currentlyWorking: e.target.checked })} />
                  <label htmlFor="currWork" style={{ margin: 0, cursor: 'pointer' }}>I am currently working here</label>
                </div>
                <div className="form-group">
                  <label>Description & Responsibilities</label>
                  <textarea className="form-control" rows={3} value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })}></textarea>
                </div>
                <div className="form-group">
                  <label>Skills Used (comma-separated)</label>
                  <input type="text" className="form-control" value={expForm.skillsUsed} onChange={e => setExpForm({ ...expForm, skillsUsed: e.target.value })} placeholder="e.g. Java, React, SQL" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {modalType === 'project' && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItemIndex !== null ? 'Modify Project' : 'Add Project Details'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProject}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label>Project Title</label>
                  <input type="text" className="form-control" value={projectForm.projectTitle} onChange={e => setProjectForm({ ...projectForm, projectTitle: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Technologies Used (comma-separated)</label>
                  <input type="text" className="form-control" value={projectForm.technologiesUsed} onChange={e => setProjectForm({ ...projectForm, technologiesUsed: e.target.value })} placeholder="e.g. React, Spring Boot, MySQL" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Team Size</label>
                    <input type="number" min="1" className="form-control" value={projectForm.teamSize} onChange={e => setProjectForm({ ...projectForm, teamSize: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Your Role</label>
                    <input type="text" className="form-control" value={projectForm.role} onChange={e => setProjectForm({ ...projectForm, role: e.target.value })} placeholder="e.g. Lead Developer" />
                  </div>
                </div>
                <div className="form-group">
                  <label>GitHub Repository Link</label>
                  <input type="url" className="form-control" value={projectForm.githubLink} onChange={e => setProjectForm({ ...projectForm, githubLink: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div className="form-group">
                  <label>Live Demo Link</label>
                  <input type="url" className="form-control" value={projectForm.liveDemoLink} onChange={e => setProjectForm({ ...projectForm, liveDemoLink: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Project Description</label>
                  <textarea className="form-control" rows={3} value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accomplishment Modal */}
      {modalType === 'accomplishment' && (
        <div className="modal-backdrop" onClick={() => setModalType(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItemIndex !== null ? 'Modify Accomplishment' : 'Add Certification / Award'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAccomplishment}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label>Category Type</label>
                  <select className="form-control" value={accomplishmentForm.type} onChange={e => setAccomplishmentForm({ ...accomplishmentForm, type: e.target.value })}>
                    <option value="Certification">Certification</option>
                    <option value="Award">Award / Recognition</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Contest Rank">Coding Contest Rank (LeetCode/CodeChef)</option>
                    <option value="Publication">Research Publication</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Title / Title of Achievement</label>
                  <input type="text" className="form-control" value={accomplishmentForm.title} onChange={e => setAccomplishmentForm({ ...accomplishmentForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Issuing Organization / Platform</label>
                  <input type="text" className="form-control" value={accomplishmentForm.issuer} onChange={e => setAccomplishmentForm({ ...accomplishmentForm, issuer: e.target.value })} placeholder="e.g. AWS, Coursera, LeetCode" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Rank / Score (if applicable)</label>
                    <input type="text" className="form-control" value={accomplishmentForm.rank} onChange={e => setAccomplishmentForm({ ...accomplishmentForm, rank: e.target.value })} placeholder="e.g. Top 1%, Rank 15" />
                  </div>
                  <div className="form-group">
                    <label>Issue Date</label>
                    <input type="date" className="form-control" value={accomplishmentForm.issueDate} onChange={e => setAccomplishmentForm({ ...accomplishmentForm, issueDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Certificate / Credential Link</label>
                  <input type="url" className="form-control" value={accomplishmentForm.link} onChange={e => setAccomplishmentForm({ ...accomplishmentForm, link: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Description / Additional Details</label>
                  <textarea className="form-control" rows={2} value={accomplishmentForm.description} onChange={e => setAccomplishmentForm({ ...accomplishmentForm, description: e.target.value })}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">Save Accomplishment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
