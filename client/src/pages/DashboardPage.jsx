import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/boardStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import { Logout, DarkMode, LightMode, Search, MoreVert, DriveFileRenameOutline, Delete, OpenInNew, People, ManageAccounts } from '@mui/icons-material';
import { WBWordmark } from '../components/ui/Logo';
import { BlankBoardIcon, FlowchartIcon, WireframeIcon, MindMapIcon } from '../components/ui/TemplateIcons';
import ProfileModal from '../components/ui/ProfileModal';

/* ── helpers ── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const months= Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  if (months< 12)  return `${months}mo ago`;
  return `${years}y ago`;
};

const formatFull = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── templates ── */
const TEMPLATES = [
  { name: 'Blank Board',  icon: <BlankBoardIcon />,  elements: [] },
  { name: 'Flowchart',   icon: <FlowchartIcon />,   elements: [
    { id:'t1', type:'rect',   x:120, y:80,  width:160, height:55, stroke:'#3b82f6', strokeWidth:2, fill:'#dbeafe', opacity:1 },
    { id:'t2', type:'text',   x:155, y:100, text:'Start',     fontSize:16, fill:'#1e40af', stroke:'#1e40af', opacity:1 },
    { id:'t3', type:'arrow',  points:[200,135,200,190], stroke:'#3b82f6', strokeWidth:2, fill:'#3b82f6', opacity:1 },
    { id:'t4', type:'diamond',x:200, y:230, width:160, height:80, stroke:'#f59e0b', strokeWidth:2, fill:'#fef3c7', opacity:1 },
    { id:'t5', type:'text',   x:148, y:258, text:'Decision?',  fontSize:14, fill:'#92400e', stroke:'#92400e', opacity:1 },
    { id:'t6', type:'arrow',  points:[200,310,200,370], stroke:'#10b981', strokeWidth:2, fill:'#10b981', opacity:1 },
    { id:'t7', type:'rect',   x:120, y:370, width:160, height:55, stroke:'#10b981', strokeWidth:2, fill:'#d1fae5', opacity:1 },
    { id:'t8', type:'text',   x:148, y:390, text:'Process',    fontSize:16, fill:'#065f46', stroke:'#065f46', opacity:1 },
  ]},
  { name: 'Wireframe', icon: <WireframeIcon />, elements: [
    { id:'w1', type:'rect', x:40, y:40,  width:420, height:45,  stroke:'#6b7280', strokeWidth:1, fill:'#f3f4f6', opacity:1 },
    { id:'w2', type:'text', x:50, y:55,  text:'Navigation Bar', fontSize:13, fill:'#374151', stroke:'#374151', opacity:1 },
    { id:'w3', type:'rect', x:40, y:100, width:290, height:220, stroke:'#6b7280', strokeWidth:1, fill:'#f9fafb', opacity:1 },
    { id:'w4', type:'text', x:140,y:200, text:'Main Content',   fontSize:14, fill:'#374151', stroke:'#374151', opacity:1 },
    { id:'w5', type:'rect', x:345,y:100, width:115, height:220, stroke:'#6b7280', strokeWidth:1, fill:'#f9fafb', opacity:1 },
    { id:'w6', type:'text', x:360,y:200, text:'Sidebar',        fontSize:12, fill:'#374151', stroke:'#374151', opacity:1 },
    { id:'w7', type:'rect', x:40, y:335, width:420, height:35,  stroke:'#6b7280', strokeWidth:1, fill:'#f3f4f6', opacity:1 },
    { id:'w8', type:'text', x:195,y:346, text:'Footer',         fontSize:12, fill:'#374151', stroke:'#374151', opacity:1 },
  ]},
  { name: 'Mind Map', icon: <MindMapIcon />, elements: [
    { id:'m1', type:'circle', x:250, y:200, radius:55, stroke:'#8b5cf6', strokeWidth:2, fill:'#ede9fe', opacity:1 },
    { id:'m2', type:'text',   x:218, y:192, text:'Main Idea', fontSize:14, fill:'#5b21b6', stroke:'#5b21b6', opacity:1 },
    { id:'m3', type:'line',   points:[250,145,250,80],  stroke:'#8b5cf6', strokeWidth:2, fill:'transparent', opacity:1 },
    { id:'m4', type:'circle', x:250, y:55,  radius:30, stroke:'#ec4899', strokeWidth:2, fill:'#fce7f3', opacity:1 },
    { id:'m5', type:'text',   x:232, y:48,  text:'Topic 1', fontSize:11, fill:'#9d174d', stroke:'#9d174d', opacity:1 },
    { id:'m6', type:'line',   points:[195,200,120,200], stroke:'#8b5cf6', strokeWidth:2, fill:'transparent', opacity:1 },
    { id:'m7', type:'circle', x:90,  y:200, radius:30, stroke:'#3b82f6', strokeWidth:2, fill:'#dbeafe', opacity:1 },
    { id:'m8', type:'text',   x:72,  y:193, text:'Topic 2', fontSize:11, fill:'#1e40af', stroke:'#1e40af', opacity:1 },
    { id:'m9', type:'line',   points:[305,200,380,200], stroke:'#8b5cf6', strokeWidth:2, fill:'transparent', opacity:1 },
    { id:'m10',type:'circle', x:410, y:200, radius:30, stroke:'#10b981', strokeWidth:2, fill:'#d1fae5', opacity:1 },
    { id:'m11',type:'text',   x:392, y:193, text:'Topic 3', fontSize:11, fill:'#065f46', stroke:'#065f46', opacity:1 },
    { id:'m12',type:'line',   points:[250,255,250,320], stroke:'#8b5cf6', strokeWidth:2, fill:'transparent', opacity:1 },
    { id:'m13',type:'circle', x:250, y:345, radius:30, stroke:'#f59e0b', strokeWidth:2, fill:'#fef3c7', opacity:1 },
    { id:'m14',type:'text',   x:232, y:338, text:'Topic 4', fontSize:11, fill:'#92400e', stroke:'#92400e', opacity:1 },
  ]},
];

/* ── RenameInput ── */
const RenameInput = ({ value, onSave, onCancel, darkMode }) => {
  const [val, setVal] = useState(value);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <input ref={ref} value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onSave(val)}
      onKeyDown={(e) => { if (e.key === 'Enter') onSave(val); if (e.key === 'Escape') onCancel(); }}
      onClick={(e) => e.stopPropagation()}
      className={`w-full text-sm font-semibold px-1.5 py-0.5 rounded-lg border border-indigo-400 outline-none ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
    />
  );
};

/* ── Card dropdown (rendered inside card, not MUI Menu) ── */
const CardMenu = ({ board, owned, darkMode, onOpen, onRename, onDelete, onClose }) => {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const menuBg  = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const itemCls = `flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-left transition-colors rounded-lg`;
  const itemColor = darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50';

  return (
    <div ref={ref}
      className={`absolute top-8 right-0 z-50 w-44 rounded-xl shadow-xl border overflow-hidden ${menuBg}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-1 flex flex-col gap-0.5">
        <button className={`${itemCls} ${itemColor}`} onClick={onOpen}>
          <OpenInNew sx={{ fontSize: 14 }} /> Open in New Tab
        </button>
        {owned && (
          <button className={`${itemCls} ${itemColor}`} onClick={onRename}>
            <DriveFileRenameOutline sx={{ fontSize: 14 }} /> Rename
          </button>
        )}
        {owned && (
          <>
            <div className={`my-0.5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`} />
            <button className={`${itemCls} text-red-500 hover:bg-red-50`} onClick={onDelete}>
              <Delete sx={{ fontSize: 14 }} /> Delete Board
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Main component ── */
const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const [boards, setBoards]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear]   = useState('');
  const [openMenuId, setOpenMenuId]   = useState(null);
  const [renamingId, setRenamingId]   = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => { loadBoards(); }, []);

  // Close menu on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setOpenMenuId(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const loadBoards = async () => {
    try {
      const { data } = await api.get('/boards');
      setBoards(data);
    } catch { toast.error('Failed to load boards'); }
    finally  { setLoading(false); }
  };

  const createBoard = async (tpl) => {
    try {
      const { data } = await api.post('/boards', {
        title: tpl.name === 'Blank Board' ? 'Untitled Board' : tpl.name,
        elements: tpl.elements,
      });
      window.open(`/board/${data._id}`, '_blank');
    } catch { toast.error('Failed to create board'); }
  };

  const deleteBoard = async (id) => {
    if (!confirm('Delete this board? This cannot be undone.')) return;
    try {
      await api.delete(`/boards/${id}`);
      setBoards((p) => p.filter((b) => b._id !== id));
      toast.success('Board deleted');
    } catch { toast.error('Failed to delete'); }
    setOpenMenuId(null);
  };

  const renameBoard = async (id, newTitle) => {
    const t = newTitle.trim();
    setRenamingId(null);
    if (!t) return;
    try {
      await api.put(`/boards/${id}`, { title: t });
      setBoards((p) => p.map((b) => b._id === id ? { ...b, title: t } : b));
    } catch { toast.error('Failed to rename'); }
  };

  const isOwner = useCallback((board) =>
    board.owner._id === user?.id || board.owner._id === user?._id, [user]);

  const availableYears = useMemo(() =>
    [...new Set(boards.map((b) => new Date(b.updatedAt).getFullYear()))].sort((a,b) => b-a),
  [boards]);

  const { myBoards, sharedBoards } = useMemo(() => {
    const f = boards.filter((b) => {
      const d = new Date(b.updatedAt);
      return b.title.toLowerCase().includes(search.toLowerCase()) &&
        (filterMonth === '' || d.getMonth() === +filterMonth) &&
        (filterYear  === '' || d.getFullYear() === +filterYear);
    });
    return { myBoards: f.filter(isOwner), sharedBoards: f.filter((b) => !isOwner(b)) };
  }, [boards, search, filterMonth, filterYear, isOwner]);

  /* ── styles ── */
  const bg       = darkMode ? 'bg-gray-950 text-white'        : 'bg-gray-50 text-gray-900';
  const hdrBg    = darkMode ? 'bg-gray-900 border-gray-800'   : 'bg-white border-gray-200';
  const cardBg   = darkMode ? 'bg-gray-900 border-gray-800'   : 'bg-white border-gray-200';
  const inputBg  = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const selectBg = darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-700';
  const sub      = darkMode ? 'text-gray-500' : 'text-gray-400';

  /* ── BoardCard ── */
  const BoardCard = ({ board }) => {
    const owned = isOwner(board);
    const menuOpen = openMenuId === board._id;

    return (
      <div
        onClick={() => { if (renamingId !== board._id && !menuOpen) window.open(`/board/${board._id}`, '_blank'); }}
        className={`group relative border rounded-2xl overflow-visible cursor-pointer hover:shadow-lg transition-all ${cardBg} ${darkMode ? 'hover:border-indigo-700' : 'hover:border-indigo-300'}`}
      >
        {/* Preview */}
        <div className={`h-28 flex items-center justify-center relative rounded-t-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
          <span className="text-4xl opacity-20">🎨</span>
          {board.elements?.length > 0 && (
            <span className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white/80 text-gray-500'}`}>
              {board.elements.length} elements
            </span>
          )}
          {!owned && (
            <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
              <People sx={{ fontSize: 11 }} /> Shared
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {renamingId === board._id ? (
            <RenameInput darkMode={darkMode} value={board.title}
              onSave={(v) => renameBoard(board._id, v)}
              onCancel={() => setRenamingId(null)} />
          ) : (
            <h3 className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {board.title}
            </h3>
          )}

          {/* Time ago + full date */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
              {timeAgo(board.updatedAt)}
            </span>
            <span className={`text-xs ${sub}`}>· {formatFull(board.updatedAt)}</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {owned ? (
              <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">Owner</span>
            ) : (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                by {board.owner.name}
              </span>
            )}
            {owned && board.collaborators?.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                <People sx={{ fontSize: 11 }} />{board.collaborators.length}
              </span>
            )}
          </div>
        </div>

        {/* ⋮ button + inline dropdown */}
        <div className="absolute top-2 right-2 z-10">
          <IconButton size="small"
            sx={{ bgcolor: darkMode ? '#1e293b' : 'white', '&:hover': { bgcolor: darkMode ? '#334155' : '#f0f0f0' }, width: 28, height: 28, opacity: menuOpen ? 1 : undefined }}
            className={`${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
            onClick={(e) => { e.stopPropagation(); setOpenMenuId(menuOpen ? null : board._id); }}
          >
            <MoreVert sx={{ fontSize: 16, color: darkMode ? '#94a3b8' : '#64748b' }} />
          </IconButton>

          {menuOpen && (
            <CardMenu
              board={board} owned={owned} darkMode={darkMode}
              onClose={() => setOpenMenuId(null)}
              onOpen={() => { window.open(`/board/${board._id}`, '_blank'); setOpenMenuId(null); }}
              onRename={() => { setRenamingId(board._id); setOpenMenuId(null); }}
              onDelete={() => deleteBoard(board._id)}
            />
          )}
        </div>
      </div>
    );
  };

  const SectionGrid = ({ title, items, emptyMsg }) => (
    <div className="mb-10">
      <h2 className={`text-base font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {title} <span className={`text-xs font-normal ${sub}`}>({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <div className={`text-center py-10 rounded-2xl border-2 border-dashed ${darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
          <p className="text-sm">{emptyMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((b) => <BoardCard key={b._id} board={b} />)}
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Header */}
      <header className={`border-b px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 ${hdrBg}`}>
        <div className="flex items-center gap-3">
          <WBWordmark size={34} textClass={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} />
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton size="small" onClick={toggleDarkMode} sx={{ color: darkMode ? '#fbbf24' : '#475569' }}>
              {darkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Profile">
            <button onClick={() => setProfileOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <Avatar src={user?.avatar} sx={{ width: 26, height: 26, bgcolor: '#6366f1', fontSize: 12 }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user?.name}</span>
              <ManageAccounts sx={{ fontSize: 15, color: darkMode ? '#6366f1' : '#6366f1' }} />
            </button>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={logout} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Templates */}
        <div className="mb-10">
          <h2 className={`text-base font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Start from template</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEMPLATES.map((tpl) => (
              <button key={tpl.name} onClick={() => createBoard(tpl)}
                className={`group flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed rounded-2xl transition-all ${darkMode ? 'border-gray-700 hover:border-indigo-500 hover:bg-indigo-950' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}`}>
                <div className="opacity-80 group-hover:opacity-100 transition-opacity">{tpl.icon}</div>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-400 group-hover:text-indigo-400' : 'text-gray-600 group-hover:text-indigo-600'}`}>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="relative">
            <Search sx={{ fontSize: 15, position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input placeholder="Search boards..." value={search} onChange={(e) => setSearch(e.target.value)}
              className={`pl-7 pr-3 py-1.5 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-indigo-400 w-44 ${inputBg}`} />
          </div>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            className={`px-2 py-1.5 text-xs rounded-xl border outline-none ${selectBg}`}>
            <option value="">All Months</option>
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className={`px-2 py-1.5 text-xs rounded-xl border outline-none ${selectBg}`}>
            <option value="">All Years</option>
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {(search || filterMonth !== '' || filterYear !== '') && (
            <button onClick={() => { setSearch(''); setFilterMonth(''); setFilterYear(''); }}
              className="px-2 py-1.5 text-xs rounded-xl border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* Boards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-44 rounded-2xl animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
            ))}
          </div>
        ) : (
          <>
            <SectionGrid title="My Boards" items={myBoards} emptyMsg="No boards yet — create one from a template above" />
            {sharedBoards.length > 0 && (
              <SectionGrid title="Shared with Me" items={sharedBoards} emptyMsg="No shared boards" />
            )}
          </>
        )}
      </main>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default DashboardPage;
