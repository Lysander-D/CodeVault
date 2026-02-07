import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, History, RotateCcw, CheckCircle2, Settings2, Pencil, Check, ListFilter } from 'lucide-react';
import { CodeItem, CategoryType } from './types';
import { parseCodesFromText, groupCodesByPrefix } from './utils/codeUtils';
import { InputSection } from './components/InputSection';
import { CodeRow } from './components/CodeRow';
import { Toast } from './components/Toast';

// --- Constants ---
const DEFAULT_CATEGORIES = ['Apple', 'Android', 'General', 'Other'];
const STORAGE_KEY_DATA = 'codevault_v6_final'; // 更改 Key 彻底切断旧数据干扰
const STORAGE_KEY_CATS = 'codevault_cats_v6_final';

const safeLoad = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) { return fallback; }
};

export default function App() {
  const [codes, setCodes] = useState<CodeItem[]>(() => safeLoad(STORAGE_KEY_DATA, []));
  const [categories, setCategories] = useState<CategoryType[]>(() => safeLoad(STORAGE_KEY_CATS, DEFAULT_CATEGORIES));
  const [activeTab, setActiveTab] = useState<CategoryType>(categories[0] || 'Apple');
  const [isEditingList, setIsEditingList] = useState(false);
  const [isEditingTabs, setIsEditingTabs] = useState(false);
  const [editingTabName, setEditingTabName] = useState<string | null>(null);
  const [editInputVal, setEditInputVal] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  // --- 核心同步函数：确保数据必达磁盘并刷新 ---
  const syncAll = (newCodes: CodeItem[], newCats?: CategoryType[]) => {
    // 强制使用新数组引用，确保 React 察觉到变化
    const updatedCodes = [...newCodes];
    setCodes(updatedCodes);
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updatedCodes));

    if (newCats) {
      const updatedCats = [...newCats];
      setCategories(updatedCats);
      localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(updatedCats));
    }
  };

  // --- 排序逻辑：按复制时间先后顺序 ---
  const currentCodes = useMemo(() => {
    return codes
      .filter(c => c.category === activeTab)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }, [codes, activeTab]);

  const groupedCurrentCodes = useMemo(() => groupCodesByPrefix(currentCodes), [currentCodes]);

  const tabStats = useMemo(() => {
    const stats: Record<string, { total: number; unused: number }> = {};
    categories.forEach(cat => {
      const catCodes = codes.filter(c => c.category === cat);
      stats[cat] = {
        total: catCodes.length,
        unused: catCodes.filter(c => !c.isUsed).length
      };
    });
    return stats;
  }, [codes, categories]);

  // --- Actions ---
  const showToast = (message: string) => setToast({ visible: true, message });

  const handleParse = (text: string, category: CategoryType) => {
    const parsed = parseCodesFromText(text, category);
    if (parsed.length === 0) return showToast('No valid codes found');
    const existingValues = new Set(codes.map(c => c.value));
    const newItems = parsed.filter(c => !existingValues.has(c.value));
    if (newItems.length === 0) return showToast('Codes already exist');
    
    syncAll([...codes, ...newItems]);
    setActiveTab(category);
    showToast(`Added ${newItems.length} codes`);
  };

  const handleToggle = (id: string) => {
    const newDb = codes.map(c => c.id === id ? { ...c, isUsed: !c.isUsed } : c);
    syncAll(newDb);
  };

  const handleCopy = async (code: CodeItem) => {
    try {
      await navigator.clipboard.writeText(code.value);
      if (!code.isUsed) {
        const newDb = codes.map(c => c.id === code.id ? { ...c, isUsed: true } : c);
        syncAll(newDb);
      }
      showToast('Copied & Marked');
    } catch (err) { showToast('Copy Failed'); }
  };

  // --- 🔥 彻底修复：一键清空逻辑 🔥 ---
  const handleClearUsedInTab = () => {
    // 找出当前分类下哪些是已经使用的
    const usedInCurrentTab = codes.filter(c => c.category === activeTab && c.isUsed);
    
    if (usedInCurrentTab.length === 0) {
      showToast('No used codes to clear');
      return;
    }

    if (window.confirm(`确定删除 ${activeTab} 下已使用的 ${usedInCurrentTab.length} 个码吗？`)) {
      // 过滤掉当前分类中已使用的，保留其他的
      const remainingCodes = codes.filter(c => {
        const isTarget = c.category === activeTab && c.isUsed;
        return !isTarget;
      });

      // 强力同步
      syncAll(remainingCodes);
      setIsEditingList(false);
      showToast(`Successfully cleared ${usedInCurrentTab.length} items`);
    }
  };

  const handleResetAll = () => {
    if (window.confirm('WARNING: This will delete EVERYTHING. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const startRenaming = (cat: string) => { setEditingTabName(cat); setEditInputVal(cat); };
  const finishRenaming = () => {
    if (!editingTabName) return;
    const oldName = editingTabName;
    const newName = editInputVal.trim();
    if (!newName || newName === oldName) { setEditingTabName(null); return; }
    if (categories.includes(newName)) return showToast('Name already exists');

    const updatedCats = categories.map(c => c === oldName ? newName : c);
    const updatedCodes = codes.map(c => c.category === oldName ? { ...c, category: newName } : c);
    if (activeTab === oldName) setActiveTab(newName);
    syncAll(updatedCodes, updatedCats);
    setEditingTabName(null);
  };

  return (
    <div className="min-h-screen pb-32 bg-[#f2f2f7] font-sans">
      <header className="sticky top-0 z-30 bg-[#f2f2f7]/90 backdrop-blur-md border-b border-slate-200/80 px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] shadow-sm">CV</div>
          CodeVault
        </h1>
        {currentCodes.length > 0 && !isEditingTabs && (
          <button onClick={() => setIsEditingList(!isEditingList)} className="text-blue-600 font-semibold text-sm">
            {isEditingList ? 'Done' : 'Edit'}
          </button>
        )}
      </header>

      <main className="max-w-2xl mx-auto pt-4">
        <InputSection onParse={handleParse} defaultCategory={activeTab} categories={categories} />

        <div className="px-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-x-auto no-scrollbar bg-slate-200/80 p-1 rounded-xl flex gap-1">
              {categories.map(cat => {
                const stats = tabStats[cat] || { total: 0, unused: 0 };
                const isActive = activeTab === cat;
                return (
                  <button key={cat} onClick={() => { if(isEditingTabs) startRenaming(cat); else setActiveTab(cat); }}
                    className={`flex-1 min-w-[100px] py-2 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-white text-black shadow-sm' : 'text-slate-500'}`}>
                    {editingTabName === cat ? (
                      <input autoFocus value={editInputVal} onChange={e => setEditInputVal(e.target.value)} onBlur={finishRenaming} className="w-full text-center outline-none bg-transparent text-blue-600" />
                    ) : (
                      <div className="flex flex-col">
                        <span>{cat}</span>
                        <span className={`text-[9px] ${stats.unused > 0 ? 'text-blue-600' : 'opacity-50'}`}>({stats.unused}/{stats.total})</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setIsEditingTabs(!isEditingTabs)} className={`p-2 rounded-xl bg-white shadow-sm ${isEditingTabs ? 'text-blue-600' : 'text-slate-400'}`}>
              <Settings2 size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {currentCodes.length === 0 ? (
            <div className="text-center py-20 opacity-30 font-bold">EMPTY IN {activeTab}</div>
          ) : (
            groupedCurrentCodes.map(group => (
              <div key={group.prefix} className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 ml-1 uppercase">{group.prefix}</div>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
                  {group.codes.map(code => (
                    <CodeRow key={code.id} code={code} onCopy={handleCopy} onToggle={handleToggle} onDelete={id => syncAll(codes.filter(c => c.id !== id))} isEditing={isEditingList} />
                  ))}
                </div>
              </div>
            ))
          )}

          <div className="grid grid-cols-2 gap-3 pt-6">
            <button onClick={handleClearUsedInTab} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center active:bg-slate-50 transition-colors">
              <CheckCircle2 className="text-blue-600 mb-1" size={24} />
              <span className="text-xs font-bold text-slate-700">Clear Used</span>
              <span className="text-[10px] text-slate-400">{activeTab}</span>
            </button>
            <button onClick={handleResetAll} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center active:bg-red-50 transition-colors">
              <RotateCcw className="text-red-500 mb-1" size={24} />
              <span className="text-xs font-bold text-red-600">Factory Reset</span>
              <span className="text-[10px] text-red-300">All Data</span>
            </button>
          </div>
        </div>
      </main>
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
    </div>
  );
}