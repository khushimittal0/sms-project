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
  violet:     '#8b5cf6',
  red:        '#ef4444',
  redDark:    '#dc2626',
  green:      '#10b981',
  slate50:    '#f8fafc',
  slate100:   '#f1f5f9',
  slate200:   '#e2e8f0',
  slate400:   '#94a3b8',
  slate600:   '#475569',
  slate700:   '#334155',
  slate900:   '#0f172a',
  white:      '#ffffff',
};

const ClassificationPage = () => {
  const styles={
    page: css`
      min-height: 100vh;
      background: ${C.slate100};
      padding: 24px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
       box-sizing: border-box;
    `,
    /* top toolbar */
    toolbar: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      background: ${C.white};
      border: 1px solid ${C.slate200};
      border-radius: 16px;
      padding: 16px 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    `,
    titleBlock: css`
      display: flex;
      align-items: center;
      gap: 14px;
    `,
    title: css`
      font-size: 22px;
      font-weight: 800;
      color: ${C.slate900};
      letter-spacing: -0.4px;
      margin: 0;
    `,
    btnGroup: css`
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    `,
    /* generic buttons */
    btn: css`
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
      line-height: 1.5;
    `,
    btnGhost: css`
      background: ${C.slate100};
      border-color: ${C.slate200};
      color: ${C.slate700};
      &:hover { background: ${C.slate200}; }
    `,
    btnPrimary: css`
      background: linear-gradient(135deg, ${C.indigo}, ${C.violet});
      color: ${C.white};
      box-shadow: 0 2px 8px rgba(99,102,241,0.35);
      &:hover:not(:disabled) {
        box-shadow: 0 4px 14px rgba(99,102,241,0.5);
        transform: translateY(-1px);
      }
      &:disabled { opacity: 0.45; cursor: not-allowed; }
    `,
    btnDanger: css`
      background: rgba(239,68,68,0.08);
      border-color: rgba(239,68,68,0.3);
      color: ${C.red};
      &:hover { background: rgba(239,68,68,0.18); }
    `,
    btnDangerSolid: css`
      background: ${C.red};
      color: ${C.white};
      box-shadow: 0 2px 8px rgba(239,68,68,0.35);
      &:hover { background: ${C.redDark}; transform: translateY(-1px); }
    `,
    btnEdit: css`
      background: rgba(99,102,241,0.1);
      border-color: rgba(99,102,241,0.35);
      color: ${C.indigo};
      &:hover { background: rgba(99,102,241,0.2); }
    `,
    btnEditActive: css`
      background: linear-gradient(135deg, ${C.indigo}, ${C.violet});
      color: ${C.white};
      box-shadow: 0 2px 8px rgba(99,102,241,0.4);
    `,
    /* divider between button groups */
    divider: css`
      width: 1px;
      height: 28px;
      background: ${C.slate200};
      flex-shrink: 0;
    `,
    /* edit mode banner */
    editBanner: css`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 18px;
      background: rgba(99,102,241,0.07);
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 10px;
      font-size: 13px;
      color: ${C.indigoDark};
      font-weight: 500;
      margin-top: 12px;
    `,

    grid: css`
      display: grid;
      grid-template-columns: 1fr 1fr;
       gap: 20px;
      height: calc(100vh - 170px);
    `,
    /* panel cards */
    panel: css`
      background: ${C.white};
      border: 1px solid ${C.slate200};
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `,
    panelHead: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 22px 14px;
      border-bottom: 1px solid ${C.slate200};
        flex-shrink: 0;
    `,
    panelTitle: css`
      font-size: 15px;
      font-weight: 700;
      color: ${C.slate900};
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    `,
    panelBody: css`
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
    `,
    /* workspace tree nodes */
    wsNode: css`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: all 0.18s ease;
      &:hover {
        background: rgba(99,102,241,0.07);
        border-color: rgba(99,102,241,0.2);
      }
      &.active {
        background: rgba(99,102,241,0.12) !important;
        border-color: rgba(99,102,241,0.4) !important;
      }
    `,
     svNode: css`
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      border-radius: 10px;
      transition: background 0.15s ease;
      &:hover { background: rgba(99,102,241,0.07); }
    `,
    /* inline add input area */
    addBox: css`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      margin-top: 8px;
      background: rgba(99,102,241,0.05);
      border: 2px dashed rgba(99,102,241,0.3);
      border-radius: 12px;
    `,
    input: css`
      flex: 1;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1.5px solid ${C.slate200};
      font-size: 14px;
      font-weight: 500;
      color: ${C.slate900};
      outline: none;
      transition: border 0.15s, box-shadow 0.15s;
      &:focus {
        border-color: ${C.indigo};
        box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
      }
     `,
    /* saved classification wrapper */
    savedWrap: css`
      border: 1.5px solid ${C.slate200};
      border-radius: 14px;
      margin-bottom: 14px;
      overflow: hidden;
       transition: border-color 0.2s;
      &.selected { border-color: ${C.indigo}; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    `,
    savedHead: css`
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: ${C.slate50};
      border-bottom: 1px solid ${C.slate200};
    `,
    savedBody: css`
      padding: 10px 14px;
    `,
    /* empty state */
    empty: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: ${C.slate400};
      gap: 12px;
      text-align: center;
    `,
    header: css`
  margin-bottom: 24px;
`,

card: css`
  background: ${C.white};
  border: 1px solid ${C.slate200};
  border-radius: 22px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(15,23,42,0.06);
`,

treeNode: css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 18px;
  transition: all 0.25s ease;
  border: 1.5px solid transparent;
  background: white;

  &:hover {
    border-color: rgba(99,102,241,0.25);
  }

  &.active {
    background: linear-gradient(
      135deg,
      rgba(99,102,241,0.12),
      rgba(139,92,246,0.12)
    );
    border-color: rgba(99,102,241,0.45);
  }
`,

buttonPrimary: css`
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(99,102,241,0.45);
  }
`,

titleGradient: css`
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
`,

badge: css`
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
`,

savedCard: css`
  background: white;
  border: 1.5px solid ${C.slate200};
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 18px;
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(99,102,241,0.35);
    box-shadow: 0 8px 24px rgba(99,102,241,0.08);
  }

  &.selected {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
  }
`,

inputActive: css`
  input {
    border-radius: 14px !important;
    border: 2px solid rgba(99,102,241,0.3) !important;
    padding: 10px 14px !important;
    font-size: 14px !important;
    font-weight: 500 !important;

    &:focus {
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.18) !important;
    }
  }
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

  // --- Edit mode state ---
  const [editMode, setEditMode] = useState(false);
  const [editingNodeKey, setEditingNodeKey] = useState<string | null>(null);
  const [editNodeInput, setEditNodeInput] = useState('');

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
      console.error("Failed to fetch classification tree", error);
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
    return () => {
      cancelled = true;
    };
  }, []);

  const saveTreeToApi = async (nodes: Node[], parentId: number | null = null) => {
    for (const node of nodes) {
      try {
        const res = await fetch('http://localhost:5032/api/classification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: node.name, parentId })
        });
        if (res.ok) {
          const savedNode = await res.json();
          if (node.children && node.children.length > 0) {
            await saveTreeToApi(node.children, savedNode.id);
          }
        }
      } catch (error) {
        console.error("Failed to save node:", node.name, error);
      }
    }
  };

  // Rename a node via API
  const renameNodeApi = async (id: number, newName: string) => {
    try {
      await fetch(`http://localhost:5032/api/classification/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      await fetchSavedTree();
    } catch (error) {
      console.error("Failed to rename node:", error);
    }
  };

  // Delete a single node (and its children) via API
  const deleteNodeApi = async (id: number) => {
    try {
      await fetch(`http://localhost:5032/api/classification/${id}`, {
        method: 'DELETE'
      });
      await fetchSavedTree();
    } catch (error) {
      console.error("Failed to delete node:", error);
    }
  };

  const addNode = (nodes: Node[], path: number[], value: string): Node[] => {
    if (path.length === 0) {
      return [...nodes, { name: value, children: [] }];
    }
    const [index, ...rest] = path;
    return nodes.map((node, i) => {
      if (i !== index) { return node; }
      return {
        ...node,
        children: addNode(node.children, rest, value),
      };
    });
  };

  const toggleNode = (path: number[]) => {
    const key = path.join('-');
    setOpenNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) { newSet.delete(key); } else { newSet.add(key); }
      return newSet;
    });
  };

  const toggleSavedNode = (classificationIndex: number, path: number[]) => {
    const key = `${classificationIndex}:${path.join('-')}`;
    setOpenSavedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) { newSet.delete(key); } else { newSet.add(key); }
      return newSet;
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
        const newSet = new Set(prev);
        for (let i = 1; i <= activePath.length; i++) {
          newSet.add(activePath.slice(0, i).join('-'));
        }
        return newSet;
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
    setTimeout(() => { inputRef.current?.focus(); }, 0);
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

  // Start inline rename
  const startEditNode = (key: string, currentName: string) => {
    setEditingNodeKey(key);
    setEditNodeInput(currentName);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  // Confirm rename
  const confirmRename = async (node: Node) => {
    if (editNodeInput.trim() && node.id && editNodeInput.trim() !== node.name) {
      await renameNodeApi(node.id, editNodeInput.trim());
    }
    setEditingNodeKey(null);
    setEditNodeInput('');
  };

  const renderTree = (nodes: Node[], path: number[] = [], level = 0) => (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {nodes.map((node, index) => {
        const currentPath = [...path, index];
        const key = currentPath.join('-');
        const isOpen = openNodes.has(key);
        const isActive = isSamePath(activePath, currentPath);

        return (
          <li key={index} style={{ marginBottom: '10px' }}>
            <div
              className={`${styles.treeNode} ${isActive ? 'active' : ''}`}
              style={{ marginLeft: `${level * 32}px`, display: 'flex', justifyContent: 'flex-start', gap: '50px' }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => toggleNode(currentPath)}>
                <span style={{ fontSize: '18px', color: isOpen ? '#6366f1' : '#94a3b8', fontWeight: 'bold', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
                  {isOpen ? '▼' : '▶'}
                </span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', flex: 1 }}>
                  {node.name}
                </span>
              </div>

              <Button
                size="sm"
                className={styles.buttonPrimary}
                style={{ fontSize: '13px', padding: '8px 16px', height: '36px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdding(true);
                  setIsRootAdding(false);
                  setActivePath(currentPath);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
              >
                + Add
              </Button>
            </div>

            {isOpen && renderTree(node.children, currentPath, level + 1)}

            {isAdding && !isRootAdding && isSamePath(activePath, currentPath) && (
              <div style={{
                marginTop: '16px', padding: '20px',
                background: 'rgba(99,102,241,0.08)', borderRadius: '20px',
                border: '2px dashed rgba(99,102,241,0.4)', display: 'flex', gap: '16px', alignItems: 'center'
              }}>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Enter child name..."
                  width={38}
                  className={styles.inputActive}
                />
                <Button size="sm" className={styles.buttonPrimary} onClick={handleSave} style={{ minWidth: '85px', height: '44px' }}>
                  Add Node
                </Button>
              </div>
            )}
          </li>
        );
      })}

      {isAdding && isRootAdding && isSamePath(activePath, path) && (
        <li style={{ marginTop: '20px' }}>
          <div style={{
            padding: '20px', background: 'rgba(99,102,241,0.08)', borderRadius: '20px',
            border: '3px dashed rgba(99,102,241,0.5)', display: 'flex', gap: '16px', alignItems: 'center'
          }}>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Enter root item..."
              width={38}
              className={styles.inputActive}
            />
            <Button size="sm" className={styles.buttonPrimary} onClick={handleSave} style={{ minWidth: '85px', height: '44px' }}>
              Add Root
            </Button>
          </div>
        </li>
      )}
    </ul>
  );

  const renderSavedTree = (nodes: Node[], classificationIndex: number, path: number[] = [], level = 0): React.ReactNode => (
    <ul style={{ paddingLeft: `${level * 28}px`, listStyle: 'none', margin: '12px 0 0 0', fontSize: '14px' }}>
      {nodes.map((n, i) => {
        const currentPath = [...path, i];
        const nodeKey = `${classificationIndex}:${currentPath.join('-')}`;
        const isOpen = openSavedNodes.has(nodeKey);
        const isEditing = editingNodeKey === nodeKey;

        return (
          <li key={i} style={{ marginBottom: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', padding: '10px 14px',
              borderRadius: '14px', transition: 'all 0.25s ease', fontWeight: 500,
              background: isEditing ? 'rgba(99,102,241,0.08)' : undefined
            }}
              onMouseEnter={(e) => { if (!isEditing) {e.currentTarget.style.background = 'rgba(99,102,241,0.12)';} }}
              onMouseLeave={(e) => { if (!isEditing) {e.currentTarget.style.background = ''; } }}
            >
              {/* Expand toggle — only when NOT editing */}
              {!isEditing && (
                <span
                  style={{ fontSize: '15px', width: '24px', color: '#6366f1', marginRight: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => toggleSavedNode(classificationIndex, currentPath)}
                >
                  {n.children.length > 0 ? (isOpen ? '▼' : '▶') : '•'}
                </span>
              )}

              {/* Inline edit input OR node name */}
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <input
                    ref={editInputRef}
                    value={editNodeInput}
                    onChange={(e) => setEditNodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {confirmRename(n);}
                      if (e.key === 'Escape') { setEditingNodeKey(null); setEditNodeInput(''); }
                    }}
                    style={{
                      flex: 1, padding: '6px 12px', borderRadius: '10px',
                      border: '2px solid #6366f1', fontSize: '14px', fontWeight: 600, outline: 'none',
                      boxShadow: '0 0 0 3px rgba(99,102,241,0.25)'
                    }}
                  />
                  <button
                    onClick={() => confirmRename(n)}
                    style={{
                      background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px',
                      padding: '6px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '13px'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingNodeKey(null); setEditNodeInput(''); }}
                    style={{
                      background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: '8px',
                      padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '13px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <span
                  style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151', fontWeight: isOpen ? '600' : '500', flex: 1, cursor: 'pointer' }}
                  onClick={() => toggleSavedNode(classificationIndex, currentPath)}
                >
                  {n.name}
                </span>
              )}

              {/* Edit mode action icons */}
              {editMode && !isEditing && (
                <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                  {/* Rename button */}
                  <button
                    title="Rename node"
                    onClick={() => startEditNode(nodeKey, n.name)}
                    style={{
                      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
                      fontSize: '13px', color: '#6366f1', fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.25)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
                  >
                    ✏️ Rename
                  </button>

                  {/* Delete node button */}
                  <button
                    title="Delete node"
                    onClick={async () => {
                      if (n.id && window.confirm(`Delete "${n.name}" and all its children?`)) {
                        await deleteNodeApi(n.id);
                      }
                    }}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
                      fontSize: '13px', color: '#ef4444', fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>

            {isOpen && !isEditing && n.children.length > 0 && renderSavedTree(n.children, classificationIndex, currentPath, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 className={styles.titleGradient} style={{ fontSize: '2.5rem', margin: 0, lineHeight: '1.1' }}>
              Classification
            </h1>
            <div className={styles.badge} style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {savedTrees.length} Saved
            </div>
          </div>

          {/* ── Top action buttons row ── */}
          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Edit toggle button — lives here in the top bar */}
            <Button
              variant={editMode ? 'primary' : 'secondary'}
              size="md"
              onClick={() => {
                setEditMode(!editMode);
                setDeleteMode(false);
                setEditingNodeKey(null);
                setEditNodeInput('');
              }}
              style={{
                borderRadius: '14px', fontWeight: '600',
                backgroundColor: editMode ? '#6366f1' : 'blue',
                outline: editMode ? '2px solid #a5b4fc' : undefined,
              }}
            >
              {editMode ? '✏️ Editing' : 'Edit'}
            </Button>

            <Button
              variant={deleteMode ? 'destructive' : 'secondary'}
              size="md"
              onClick={() => { setDeleteMode(!deleteMode); setEditMode(false); setEditingNodeKey(null); }}
              style={{ borderRadius: '14px', fontWeight: '600', backgroundColor: deleteMode ? '#971212' : 'blue' }}
            >
              {deleteMode ? 'Cancel' : 'Delete'}
            </Button>

            {deleteMode && (
              <Button
                variant="destructive"
                size="md"
                onClick={deleteSelectedSaved}
                style={{ borderRadius: '14px', fontWeight: '700', backgroundColor: 'blue' }}
              >
                Delete {selectedSaved.length}
              </Button>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={handleClearSaved}
              style={{ borderRadius: '14px', fontWeight: '600', backgroundColor: 'blue' }}
            >
              Clear All
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleReset}
              style={{ borderRadius: '14px', fontWeight: '600', backgroundColor: 'blue' }}
            >
              Reset
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleNew}
              className={styles.buttonPrimary}
              style={{ borderRadius: '14px', fontWeight: '700' }}
            >
              New
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleSaveTree}
              disabled={tree.length === 0}
              className={styles.buttonPrimary}
              style={{ borderRadius: '14px', fontWeight: '700' }}
            >
              Save
            </Button>
          </div>
        </div>

      
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 style={{
            margin: '0 0 2rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#1e293b',
            display: 'flex', alignItems: 'center', gap: '12px',
            paddingBottom: '1rem', borderBottom: '2px solid rgba(226,232,240,0.8)'
          }}>
            Saved Classifications
          </h3>

          {savedTrees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 3rem', color: '#64748b' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.6 }}>📂</div>
              <div style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 600 }}>No saved</div>
            </div>
          ) : (
            savedTrees.map((t, index) => (
              <div key={index} className={`${styles.savedCard} ${selectedSaved.includes(index) ? 'selected' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.2rem' }}>
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedSaved.includes(index)}
                      onChange={() => toggleSavedSelect(index)}
                      style={{ width: '20px', height: '20px', accentColor: '#6366f1' }}
                    />
                  )}
                  <div className={styles.badge} style={{ fontSize: '13px', padding: '6px 12px', background: '#10b981' }}>
                    #{index + 1}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '17px', color: '#1e293b', flex: 1 }}>
                    Classification {index + 1}
                  </div>
                </div>

                {renderSavedTree(t, index)}
              </div>
            ))
          )}
        </div>

        <div className={styles.card}>
          <h3 style={{
            margin: '0 0 2rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#1e293b',
            display: 'flex', alignItems: 'center', gap: '12px',
            paddingBottom: '1rem', borderBottom: '2px solid rgba(226,232,240,0.8)'
          }}>
            🛠 Create Classification
          </h3>

          {tree.length === 0 && !isAdding ? (
            <div style={{ textAlign: 'center', padding: '5rem 3rem', color: '#64748b' }}>
              <div style={{ fontSize: '6rem', marginBottom: '2rem', opacity: 0.5 }}>⚡</div>
              <div style={{ fontSize: '1.5rem', marginBottom: '1.2rem', fontWeight: 700, color: '#374151' }}>
                Ready to build
              </div>
              <div style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '320px', margin: '0 auto 2rem auto' }}>
                Click <strong style={{ color: '#6366f1' }}>{"New"}</strong> above to get started
              </div>
            </div>
          ) : (
            renderTree(tree)
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-15px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export { ClassificationPage };
