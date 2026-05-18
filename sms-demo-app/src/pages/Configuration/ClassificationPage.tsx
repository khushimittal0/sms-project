import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@grafana/ui';
import { css } from '@emotion/css';

type Node = {
  id?: number;
  name: string;
  children: Node[];
  parentId?: number | null;
  level?: number;
};

const C = {
  indigo:     '#6366f1',
  indigoDark: '#4f46e5',
  indigoLight:'#e0e7ff',
  violet:     '#8b5cf6',
  red:        '#ef4444',
  redDark:    '#dc2626',
  redLight:   '#fee2e2',
  green:      '#10b981',
  slate50:    '#f8fafc',
  slate100:   '#f1f5f9',
  slate200:   '#e2e8f0',
  slate300:   '#cbd5e1',
  slate400:   '#94a3b8',
  slate500:   '#64748b',
  slate600:   '#475569',
  slate700:   '#334155',
  slate800:   '#1e293b',
  slate900:   '#0f172a',
  white:      '#ffffff',
};

const ClassificationPage = () => {
  const styles = {
    page: css`
      min-height: 100vh;
      background: ${C.slate100};
      padding: 24px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      box-sizing: border-box;
    `,
    header: css`
      margin-bottom: 20px;
    `,
    topRow: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: ${C.white};
      border: 1px solid ${C.slate200};
      border-radius: 16px;
      padding: 16px 22px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    `,
    titleBlock: css`
      display: flex;
      align-items: center;
      gap: 12px;
    `,
    titleGradient: css`
      font-size: 22px;
      font-weight: 800;
      background: linear-gradient(135deg, ${C.indigo}, ${C.violet});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      letter-spacing: -0.3px;
    `,
    badge: css`
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: ${C.indigoLight};
      color: ${C.indigoDark};
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
    `,
    btnRow: css`
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    `,
    divider: css`
      width: 1px;
      height: 22px;
      background: ${C.slate200};
      flex-shrink: 0;
    `,
    /* base button */
    btn: css`
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid ${C.slate200};
      background: ${C.white};
      color: ${C.slate700};
      transition: all 0.15s ease;
      white-space: nowrap;
      line-height: 1.5;
      &:hover { background: ${C.slate100}; border-color: ${C.slate300}; }
    `,
    btnPrimary: css`
      background: linear-gradient(135deg, ${C.indigo}, ${C.violet});
      color: ${C.white};
      border-color: transparent;
      box-shadow: 0 2px 8px rgba(99,102,241,0.3);
      &:hover:not(:disabled) {
        box-shadow: 0 4px 14px rgba(99,102,241,0.45);
        transform: translateY(-1px);
      }
      &:disabled { opacity: 0.45; cursor: not-allowed; }
    `,
    btnEditOff: css`
      background: ${C.white};
      border-color: ${C.slate200};
      color: ${C.slate700};
      &:hover { background: ${C.slate100}; }
    `,
    btnEditOn: css`
      background: ${C.indigoLight};
      border-color: ${C.indigo};
      color: ${C.indigoDark};
      &:hover { background: #c7d2fe; }
    `,
    btnDanger: css`
      background: ${C.white};
      border-color: ${C.slate200};
      color: ${C.red};
      &:hover { background: ${C.redLight}; border-color: rgba(239,68,68,0.4); }
    `,
    btnDangerActive: css`
      background: ${C.redLight};
      border-color: rgba(239,68,68,0.45);
      color: ${C.redDark};
      &:hover { background: #fecaca; }
    `,
    /* edit mode banner */
    editBanner: css`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      margin-top: 12px;
      background: ${C.indigoLight};
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 10px;
      font-size: 13px;
      color: ${C.indigoDark};
      font-weight: 500;
    `,
    editBannerDot: css`
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: ${C.indigo};
      flex-shrink: 0;
      animation: pulse 1.8s ease-in-out infinite;
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.5; transform: scale(0.75); }
      }
    `,
    editBannerDoneBtn: css`
      margin-left: auto;
      padding: 4px 12px;
      border-radius: 8px;
      border: 1px solid rgba(99,102,241,0.4);
      background: ${C.white};
      color: ${C.indigoDark};
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      &:hover { background: ${C.indigoLight}; }
    `,
    grid: css`
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      height: calc(100vh - 170px);
    `,
    card: css`
      background: ${C.white};
      border: 1px solid ${C.slate200};
      border-radius: 16px;
      padding: 20px;
      overflow-y: auto;
      box-shadow: 0 2px 10px rgba(15,23,42,0.05);
    `,
    cardTitle: css`
      margin: 0 0 18px 0;
      font-size: 14px;
      font-weight: 700;
      color: ${C.slate500};
      text-transform: uppercase;
      letter-spacing: 0.6px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 14px;
      border-bottom: 1px solid ${C.slate200};
    `,
    savedCard: css`
      background: ${C.white};
      border: 1px solid ${C.slate200};
      border-radius: 14px;
      margin-bottom: 14px;
      overflow: hidden;
      transition: border-color 0.2s;
      &.selected { border-color: ${C.indigo}; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
    `,
    savedCardHead: css`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: ${C.slate50};
      border-bottom: 1px solid ${C.slate200};
    `,
    /* workspace tree */
    treeNode: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1.5px solid transparent;
      transition: all 0.18s ease;
      &:hover {
        background: rgba(99,102,241,0.06);
        border-color: rgba(99,102,241,0.18);
      }
      &.active {
        background: rgba(99,102,241,0.1);
        border-color: rgba(99,102,241,0.35);
      }
    `,
    /* saved tree node row */
    svNodeRow: css`
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 10px;
      transition: background 0.15s;
      &:hover { background: rgba(99,102,241,0.06); }
    `,
    /* edit action buttons on saved nodes */
    nodeActionGroup: css`
      display: flex;
      align-items: center;
      gap: 5px;
      margin-left: 10px;
      opacity: 0;
      transition: opacity 0.15s;
    `,
    nodeActionGroupVisible: css`
      opacity: 1;
    `,
    actionRename: css`
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid rgba(99,102,241,0.35);
      background: ${C.indigoLight};
      color: ${C.indigoDark};
      transition: all 0.15s;
      &:hover { background: #c7d2fe; border-color: ${C.indigo}; }
    `,
    actionDelete: css`
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid rgba(239,68,68,0.3);
      background: ${C.redLight};
      color: ${C.redDark};
      transition: all 0.15s;
      &:hover { background: #fecaca; border-color: ${C.red}; }
    `,
    /* inline rename field */
    renameRow: css`
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      padding: 4px 0;
    `,
    renameInput: css`
      flex: 1;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1.5px solid ${C.indigo};
      font-size: 13px;
      font-weight: 600;
      color: ${C.slate900};
      outline: none;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
      transition: box-shadow 0.15s;
      &:focus { box-shadow: 0 0 0 4px rgba(99,102,241,0.25); }
    `,
    renameSave: css`
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 12px;
      border-radius: 7px;
      border: 1px solid ${C.indigo};
      background: ${C.indigo};
      color: ${C.white};
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.15s;
      &:hover { opacity: 0.85; }
    `,
    renameCancel: css`
      display: inline-flex;
      align-items: center;
      padding: 5px 10px;
      border-radius: 7px;
      border: 1px solid ${C.slate200};
      background: ${C.slate100};
      color: ${C.slate600};
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
      &:hover { background: ${C.slate200}; }
    `,
    /* workspace add input */
    addBox: css`
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      margin-top: 10px;
      background: rgba(99,102,241,0.06);
      border: 2px dashed rgba(99,102,241,0.35);
      border-radius: 14px;
    `,
    inputActive: css`
      input {
        border-radius: 10px !important;
        border: 1.5px solid rgba(99,102,241,0.4) !important;
        padding: 9px 14px !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        &:focus {
          border-color: ${C.indigo} !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.18) !important;
        }
      }
    `,
    buttonPrimary: css`
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      border: none !important;
      color: white !important;
    `,
    empty: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: ${C.slate400};
      gap: 10px;
      text-align: center;
      padding: 4rem 2rem;
    `,
  };

  const [tree, setTree] = useState<Node[]>([]);
  const [savedTrees, setSavedTrees] = useState<Node[][]>([]);
  const [activePath, setActivePath] = useState<number[] | null>(null);
  const [input, setInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRootAdding, setIsRootAdding] = useState(false);
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());
  const [openSavedNodes, setOpenSavedNodes] = useState<Set<string>>(new Set());
  const [selectedSaved, setSelectedSaved] = useState<number[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingNodeKey, setEditingNodeKey] = useState<string | null>(null);
  const [editNodeInput, setEditNodeInput] = useState('');
  const [hoveredNodeKey, setHoveredNodeKey] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSavedTree = async () => {
    try {
      const response = await fetch('http://localhost:5032/api/classification/tree');
      if (response.ok) {
        const data = await response.json();
        setSavedTrees(data.length > 0 ? [data] : []);
      }
    } catch (error) {
      console.error('Failed to fetch classification tree', error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch('http://localhost:5032/api/classification/tree')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (!cancelled) {
          setSavedTrees(data.length > 0 ? [data] : []);
        }
      })
      .catch(err => console.error('Failed to fetch classification tree', err));
    return () => { cancelled = true; };
  }, []);

  const saveTreeToApi = async (nodes: Node[], parentId: number | null = null) => {
    for (const node of nodes) {
      try {
        const res = await fetch('http://localhost:5032/api/classification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: node.name, parentId }),
        });
        if (res.ok) {
          const savedNode = await res.json();
          if (node.children && node.children.length > 0) {
            await saveTreeToApi(node.children, savedNode.id);
          }
        }
      } catch (error) {
        console.error('Failed to save node:', node.name, error);
      }
    }
  };

 // 2. FIX: renameNodeApi — await properly karo aur fetchSavedTree ka order sahi karo
const renameNodeApi = async (id: number, newName: string) => {
  try {
    const res = await fetch(`http://localhost:5032/api/classification/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    if (!res.ok) {
      console.error('Rename API failed:', res.status, await res.text());
      return;
    }
    await fetchSavedTree(); // sirf success pe fetch karo
  } catch (error) {
    console.error('Failed to rename node:', error);
  }
};

  const deleteNodeApi = async (id: number) => {
    try {
      await fetch(`http://localhost:5032/api/classification/${id}`, { method: 'DELETE' });
      await fetchSavedTree();
    } catch (error) {
      console.error('Failed to delete node:', error);
    }
  };

  const addNode = (nodes: Node[], path: number[], value: string): Node[] => {
    if (path.length === 0) {
      return [...nodes, { name: value, children: [] }];
    }
    const [index, ...rest] = path;
    return nodes.map((node, i) => {
      if (i !== index) { return node; }
      return { ...node, children: addNode(node.children, rest, value) };
    });
  };

  const toggleNode = (path: number[]) => {
    const key = path.join('-');
    setOpenNodes(prev => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
  };

  const toggleSavedNode = (classificationIndex: number, path: number[]) => {
    const key = `${classificationIndex}:${path.join('-')}`;
    setOpenSavedNodes(prev => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
  };

  const toggleSavedSelect = (index: number) => {
    setSelectedSaved(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const deleteSelectedSaved = async () => {
    if (savedTrees.length > 0 && savedTrees[0].length > 0) {
      for (const rootNode of savedTrees[0]) {
        if (rootNode.id) {
          await fetch(`http://localhost:5032/api/classification/${rootNode.id}`, { method: 'DELETE' });
        }
      }
    }
    await fetchSavedTree();
    setSelectedSaved([]);
    setDeleteMode(false);
  };

  const handleSave = () => {
    if (!input.trim()) { return; }
    const newTree = addNode(tree, activePath || [], input);
    setTree(newTree);
    if (activePath) {
      setOpenNodes(prev => {
        const s = new Set(prev);
        for (let i = 1; i <= activePath.length; i++) {
          s.add(activePath.slice(0, i).join('-'));
        }
        return s;
      });
    }
    setInput('');
    setActivePath(null);
    setIsAdding(false);
  };

  const handleNew = () => {
    setTree([]);
    setInput('');
    setIsAdding(true);
    setIsRootAdding(true);
    setActivePath([]);
    setOpenNodes(new Set());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleReset = () => {
    setTree([]);
    setInput('');
    setActivePath([]);
    setIsAdding(false);
  };

  const handleSaveTree = async () => {
    if (tree.length === 0) { return; }
    await saveTreeToApi(tree);
    await fetchSavedTree();
    setTree([]);
    setInput('');
    setActivePath(null);
    setIsAdding(false);
    setIsRootAdding(false);
    setOpenNodes(new Set());
  };

  const handleClearSaved = async () => {
    if (savedTrees.length > 0 && savedTrees[0].length > 0) {
      for (const rootNode of savedTrees[0]) {
        if (rootNode.id) {
          await fetch(`http://localhost:5032/api/classification/${rootNode.id}`, { method: 'DELETE' });
        }
      }
    }
    await fetchSavedTree();
  };

  const isSamePath = (a: number[] | null, b: number[]) => {
    if (!a || a.length !== b.length) { return false; }
    return a.every((val, i) => val === b[i]);
  };

  const startEditNode = (key: string, currentName: string) => {
    setEditingNodeKey(key);
    setEditNodeInput(currentName);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

 // 1. FIX: confirmRename — unnecessary name-equality guard hatao
const confirmRename = async (node: Node) => {
  if (!editNodeInput.trim()) {
    setEditingNodeKey(null);
    setEditNodeInput('');
    return;
  }
  if (node.id) {
    await renameNodeApi(node.id, editNodeInput.trim());
  } else {
    console.warn('Node has no id:', node); // debug ke liye
  }
  setEditingNodeKey(null);
  setEditNodeInput('');
};

  const cancelRename = () => {
    setEditingNodeKey(null);
    setEditNodeInput('');
  };

  /* ── Workspace tree ── */
  const renderTree = (nodes: Node[], path: number[] = [], level = 0) => (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {nodes.map((node, index) => {
        const currentPath = [...path, index];
        const key = currentPath.join('-');
        const isOpen = openNodes.has(key);
        const isActive = isSamePath(activePath, currentPath);

        return (
          <li key={index} style={{ marginBottom: '8px' }}>
            <div
              className={`${styles.treeNode} ${isActive ? 'active' : ''}`}
              style={{ marginLeft: `${level * 28}px`, display: 'flex', justifyContent: 'flex-start', gap: '40px' }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                onClick={() => toggleNode(currentPath)}
              >
                <span style={{ 
                              fontSize: '11px', 
                              color: isOpen ? C.indigo : C.slate400, 
                              fontWeight: 'bold', 
                              width: '12px', 
                              transition: 'color 0.2s' }}>
                  {isOpen ? '▼' : '▶'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: C.slate800 }}>
                  {node.name}
                </span>
              </div>
              <Button
                size="sm"
                className={styles.buttonPrimary}
                style={{ fontSize: '12px', padding: '6px 14px', height: '32px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdding(true);
                  setIsRootAdding(false);
                  setActivePath(currentPath);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
              >
                + Add child
              </Button>
            </div>

            {isOpen && renderTree(node.children, currentPath, level + 1)}

            {isAdding && !isRootAdding && isSamePath(activePath, currentPath) && (
              <div className={styles.addBox} style={{ marginLeft: `${(level + 1) * 28}px` }}>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Enter child name..."
                  width={36}
                  className={styles.inputActive}
                />
                <Button size="sm" className={styles.buttonPrimary} onClick={handleSave} 
                        style={{ height: '40px', minWidth: '80px' }}>
                  Add
                </Button>
              </div>
            )}
          </li>
        );
      })}

      {isAdding && isRootAdding && isSamePath(activePath, path) && (
        <li style={{ marginTop: '16px' }}>
          <div className={styles.addBox}>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Enter root item..."
              width={36}
              className={styles.inputActive}
            />
            <Button size="sm" className={styles.buttonPrimary} onClick={handleSave} 
                    style={{ height: '40px', minWidth: '80px' }}>
              Add Root
            </Button>
          </div>
        </li>
      )}
    </ul>
  );

  /* ── Saved tree ── */
  const renderSavedTree = (nodes: Node[], classificationIndex: number, path: number[] = [], level = 0): React.ReactNode => (
    <ul style={{ paddingLeft: `${level * 22}px`, listStyle: 'none', margin: '8px 0 0 0' }}>
      {nodes.map((n, i) => {
        const currentPath = [...path, i];
        const nodeKey = `${classificationIndex}:${currentPath.join('-')}`;
        const isOpen = openSavedNodes.has(nodeKey);
        const isEditing = editingNodeKey === nodeKey;
        const isHovered = hoveredNodeKey === nodeKey;

        return (
          <li key={i} style={{ marginBottom: '4px' }}>
            <div
              className={styles.svNodeRow}
              onMouseEnter={() => setHoveredNodeKey(nodeKey)}
              onMouseLeave={() => setHoveredNodeKey(null)}
              style={{ background: isEditing ? 'rgba(99,102,241,0.07)' : undefined, borderRadius: '10px' }}
            >
              {/* Expand toggle */}
              {!isEditing && (
                <span
                  style={{ 
                         fontSize: '11px', 
                         width: '18px', 
                         color: n.children.length > 0 ? C.indigo : C.slate300, 
                         marginRight: '8px', 
                         cursor: 'pointer', 
                         fontWeight: 'bold', 
                         flexShrink: 0 }}
                  onClick={() => toggleSavedNode(classificationIndex, currentPath)}
                >
                  {n.children.length > 0 ? (isOpen ? '▼' : '▶') : '·'}
                </span>
              )}

              {/* Name or rename input */}
              {isEditing ? (
                <div className={styles.renameRow}>
                  <input
                    ref={editInputRef}
                    value={editNodeInput}
                    onChange={(e) => setEditNodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { confirmRename(n); }
                      if (e.key === 'Escape') { cancelRename(); }
                    }}
                    className={styles.renameInput}
                  />
                  <button className={styles.renameSave} onClick={() => confirmRename(n)}>
                    ✓ Save
                  </button>
                  <button className={styles.renameCancel} onClick={cancelRename}>
                    Cancel
                  </button>
                </div>
              ) : (
                <span
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: isOpen ? '600' : '500',
                    color: C.slate700,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px',
                  }}
                  onClick={() => toggleSavedNode(classificationIndex, currentPath)}
                  title={n.name}
                >
                  {n.name}
                </span>
              )}

              {/* Edit action buttons — show only in edit mode, on hover or always visible */}
              {editMode && !isEditing && (
                <div
                  className={`${styles.nodeActionGroup} ${isHovered ? styles.nodeActionGroupVisible : ''}`}
                  style={{ opacity: isHovered ? 1 : 0 }}
                >
                  <button
                    className={styles.actionRename}
                    title="Rename"
                    onClick={() => startEditNode(nodeKey, n.name)}
                  >
                    ✏ Rename
                  </button>
                  <button
                    className={styles.actionDelete}
                    title="Delete node and its children"
                    onClick={async () => {
                      if (n.id && window.confirm(`Delete "${n.name}" and all its children?`)) {
                        await deleteNodeApi(n.id);
                      }
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>

            {isOpen && !isEditing && n.children.length > 0 &&
              renderSavedTree(n.children, classificationIndex, currentPath, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>

        {/* ── Top bar ── */}
        <div className={styles.topRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.titleGradient}>Classification</h1>
            <span className={styles.badge}>{savedTrees.length} saved</span>
          </div>

          <div className={styles.btnRow}>
            {/* Edit toggle */}
            <button
              className={`${styles.btn} ${editMode ? styles.btnEditOn : styles.btnEditOff}`}
              onClick={() => {
                setEditMode(!editMode);
                setDeleteMode(false);
                setEditingNodeKey(null);
                setEditNodeInput('');
              }}
            >
              ✏ {editMode ? 'Editing' : 'Edit'}
            </button>

            <div className={styles.divider} />

            {/* Delete mode */}
            <button
              className={`${styles.btn} ${deleteMode ? styles.btnDangerActive : styles.btnDanger}`}
              onClick={() => { setDeleteMode(!deleteMode); setEditMode(false); setEditingNodeKey(null); }}
            >
              {deleteMode ? '✕ Cancel' : '🗑 Delete'}
            </button>

            {deleteMode && selectedSaved.length > 0 && (
              <button className={`${styles.btn} ${styles.btnDangerActive}`} onClick={deleteSelectedSaved}>
                Delete {selectedSaved.length} selected
              </button>
            )}

            <button className={styles.btn} onClick={handleClearSaved}>Clear all</button>
            <button className={styles.btn} onClick={handleReset}>Reset</button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNew}>+ New</button>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSaveTree}
              disabled={tree.length === 0}
              style={{ opacity: tree.length === 0 ? 0.45 : 1, cursor: tree.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Save
            </button>
          </div>
        </div>

        {/* ── Edit mode banner ── */}
        {editMode && (
          <div className={styles.editBanner}>
            <span className={styles.editBannerDot} />
            Edit mode is on — hover any node to rename or delete it.
            <button
              className={styles.editBannerDoneBtn}
              onClick={() => { setEditMode(false); setEditingNodeKey(null); setEditNodeInput(''); }}
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className={styles.grid}>

        {/* Saved classifications */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            📂 Saved classifications
          </div>

          {savedTrees.length === 0 ? (
            <div className={styles.empty}>
              <div style={{ fontSize: '42px', opacity: 0.4 }}>📂</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: C.slate600 }}>No saved classifications</div>
              <div style={{ fontSize: '13px', color: C.slate400 }}>Save a tree from the right panel to see it here.</div>
            </div>
          ) : (
            savedTrees.map((t, index) => (
              <div key={index} className={`${styles.savedCard} ${selectedSaved.includes(index) ? 'selected' : ''}`}>
                <div className={styles.savedCardHead}>
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedSaved.includes(index)}
                      onChange={() => toggleSavedSelect(index)}
                      style={{ width: '16px', height: '16px', accentColor: C.indigo }}
                    />
                  )}
                  <span style={{ 
                                background: C.indigoLight, 
                                color: C.indigoDark, 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                padding: '3px 9px', 
                                borderRadius: '999px' }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: C.slate800, flex: 1 }}>
                    Classification {index + 1}
                  </span>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  {renderSavedTree(t, index)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create classification */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            🛠 Create classification
          </div>

          {tree.length === 0 && !isAdding ? (
            <div className={styles.empty}>
              <div style={{ fontSize: '48px', opacity: 0.35 }}>⚡</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: C.slate700 }}>Ready to build</div>
              <div style={{ fontSize: '13px', color: C.slate400, maxWidth: '260px' }}>
                Click <strong style={{ color: C.indigo }}>+ New</strong> above to start creating a classification tree.
              </div>
            </div>
          ) : (
            renderTree(tree)
          )}
        </div>
      </div>
    </div>
  );
};

export { ClassificationPage };
