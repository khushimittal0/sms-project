import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@grafana/ui';
import { css } from '@emotion/css';

type Node = {
  name: string;
  children: Node[];
};

const ClassificationPage = () => {
  
  const styles = {
    page: css`
      min-height: 100vh;
      background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 2rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    `,
    header: css`
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 24px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
      padding: 2.5rem;
      margin-bottom: 2rem;
    `,
    grid: css`
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      height: calc(100vh - 220px);
    `,
    card: css`
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.4);
      box-shadow: 0 15px 35px rgba(0,0,0,0.12);
      padding: 2rem;
      overflow-y: auto;
      transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 25px 50px rgba(0,0,0,0.2);
      }
    `,
    treeNode: css`
      display: flex;
      align-items: center;
      padding: 14px 18px;
      border-radius: 16px;
      margin: 6px 0;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      border: 2px solid transparent;
      position: relative;
      overflow: hidden;
      &:hover {
        border-color: rgba(99,102,241,0.4);
        transform: translateX(6px);
        background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12));
      }
      &.active {
        background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25)) !important;
        border-color: rgba(99,102,241,0.6) !important;
        box-shadow: 0 6px 24px rgba(99,102,241,0.4) !important;
      }
    `,
    inputActive: css`
      box-shadow: 0 0 0 4px rgba(99,102,241,0.4) !important;
      transform: scale(1.03) !important;
      border-color: #6366f1 !important;
      background: #ffffff !important;
    `,
    badge: css`
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 8px 16px;
      border-radius: 25px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 6px 16px rgba(99,102,241,0.4);
      letter-spacing: 0.5px;
    `,
    buttonPrimary: css`
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      border: none !important;
      box-shadow: 0 8px 20px rgba(99,102,241,0.4) !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(99,102,241,0.5) !important;
      }
      &:active {
        transform: translateY(0);
      }
    `,
    titleGradient: css`
      background: linear-gradient(135deg, #1e293b, #334155, #475569);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 900;
      letter-spacing: -0.02em;
    `,
    savedCard: css`
      margin-bottom: 1.8rem;
      padding: 1.8rem 1.5rem;
      border-radius: 20px;
      background: rgba(248,250,252,0.8);
      border: 2px solid rgba(226,232,240,0.8);
      transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
      position: relative;
      overflow: hidden;
      &:hover {
        background: rgba(99,102,241,0.15);
        transform: translateY(-3px);
        border-color: rgba(99,102,241,0.4);
      }
      &.selected {
        background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25)) !important;
        border-color: rgba(99,102,241,0.6) !important;
        box-shadow: 0 12px 32px rgba(99,102,241,0.35) !important;
      }
    `
  };

  
  const [tree, setTree] = useState<Node[]>(() => {
    const saved = localStorage.getItem('classificationTree');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedTrees, setSavedTrees] = useState<Node[][]>(() => {
    const data = localStorage.getItem('allClassifications');
    return data ? JSON.parse(data) : [];
  });
  const [activePath, setActivePath] = useState<number[] | null>(null);
  const [input, setInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRootAdding, setIsRootAdding] = useState(false);
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());
  const [openSavedNodes, setOpenSavedNodes] = useState<Set<string>>(new Set());
  const [selectedSaved, setSelectedSaved] = useState<number[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  
  useEffect(() => {
    localStorage.setItem('classificationTree', JSON.stringify(tree));
  }, [tree]);

  useEffect(() => {
    localStorage.setItem('allClassifications', JSON.stringify(savedTrees));
  }, [savedTrees]);

  
  const addNode = (nodes: Node[], path: number[], value: string): Node[] => {
    if (path.length === 0) {
      return [...nodes, { name: value, children: [] }];
    }
    const [index, ...rest] = path;
    return nodes.map((node, i) => {
      if (i !== index) {return node};
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
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleSavedNode = (classificationIndex: number, path: number[]) => {
    const key = `${classificationIndex}:${path.join('-')}`;
    setOpenSavedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleSavedSelect = (index: number) => {
    setSelectedSaved(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const deleteSelectedSaved = () => {
    setSavedTrees(prev =>
      prev.filter((_, index) => !selectedSaved.includes(index))
    );
    setSelectedSaved([]);
    setDeleteMode(false);
  };

  const handleSave = () => {
    if (!input.trim()) {return};
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
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleReset = () => {
    setTree([]);
    setInput('');
    setActivePath([]);
    setIsAdding(false);
    localStorage.removeItem('classificationTree');
  };

  const handleSaveTree = () => {
        if (tree.length === 0) {return};
    const copy = JSON.parse(JSON.stringify(tree));
    setSavedTrees((prev) => [...prev, copy]);
    setTree([]);
    setInput('');
    setActivePath(null);
    setIsAdding(false);
    setIsRootAdding(false);
    setOpenNodes(new Set());
    localStorage.removeItem('classificationTree');
  };

  const handleClearSaved = () => {
    setSavedTrees([]);
    localStorage.removeItem('allClassifications');
  };

  const isSamePath = (a: number[] | null, b: number[]) => {
    if (!a || a.length !== b.length) {return false};
    return a.every((val, i) => val === b[i]);
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
              style={{ marginLeft: `${level * 32}px`,
                       display: 'flex',
                       justifyContent: 'flex-start',   
                       gap: '50px' }}
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px', 
                  cursor: 'pointer'
                }}
                onClick={() => toggleNode(currentPath)}
              >
                <span style={{ 
                  fontSize: '18px', 
                  color: isOpen ? '#6366f1' : '#94a3b8',
                  fontWeight: 'bold',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
                }}>
                  {isOpen ? '▼' : '▶'}
                </span>
                <span style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  flex: 1
                }}>
                  {node.name}
                </span>
              </div>

              <Button
                size="sm"
                className={styles.buttonPrimary}
                style={{
                  fontSize: '13px',
                  padding: '8px 16px',
                  height: '36px',
                }}
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
                marginTop: '16px',
                padding: '20px',
                background: 'rgba(99,102,241,0.08)',
                borderRadius: '20px',
                border: '2px dashed rgba(99,102,241,0.4)',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
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
                <Button 
                  size="sm" 
                  className={styles.buttonPrimary}
                  onClick={handleSave}
                  style={{ minWidth: '85px', height: '44px',  }}
                >
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
            padding: '20px',
            background: 'rgba(99,102,241,0.08)',
            borderRadius: '20px',
            border: '3px dashed rgba(99,102,241,0.5)',
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
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
            <Button 
              size="sm" 
              className={styles.buttonPrimary}
              onClick={handleSave}
              style={{ minWidth: '85px', height: '44px', }}
            >
              Add Root
            </Button>
          </div>
        </li>
      )}
    </ul>
  );

  const renderSavedTree = (nodes: Node[], classificationIndex: number, path: number[] = [], level = 0) => (
    <ul style={{ 
      paddingLeft: `${level * 28}px`,
      listStyle: 'none',
      margin: '12px 0 0 0',
      fontSize: '14px'
    }}>
      {nodes.map((n, i) => {
        const currentPath = [...path, i];
        const key = `${classificationIndex}:${currentPath.join('-')}`;
        const isOpen = openSavedNodes.has(key);

        return (
          <li key={i} style={{ marginBottom: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '10px 14px',
                borderRadius: '14px',
                transition: 'all 0.25s ease',
                fontWeight: 500
              }}
              onClick={() => toggleSavedNode(classificationIndex, currentPath)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '';
              }}
            >
              <span style={{ 
                fontSize: '15px', 
                width: '24px',
                color: '#6366f1',
                marginRight: '10px',
                fontWeight: 'bold'
              }}>
                {n.children.length > 0 ? (isOpen ? '▼' : '▶') : '•'}
              </span>
              <span style={{
                maxWidth: '260px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#374151',
                fontWeight: isOpen ? '600' : '500'
              }}>
                {n.name}
              </span>
            </div>
            {isOpen && n.children.length > 0 && renderSavedTree(n.children, classificationIndex, currentPath, level + 1)}
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
            <h1 className={styles.titleGradient} style={{ 
              fontSize: '2.5rem', 
              margin: 0, 
              lineHeight: '1.1'
            }}>
              Classification
            </h1>
            <div className={styles.badge} style={{ 
              marginTop: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {savedTrees.length} Saved 
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
            <Button 
              variant={deleteMode ? 'destructive' : 'secondary'} 
              size="md"
              onClick={() => setDeleteMode(!deleteMode)}
              style={{ borderRadius: '14px', fontWeight: '600' , 
              backgroundColor: deleteMode ? '#971212' : 'blue',}}
            >
              {deleteMode ? 'Cancel' : 'Delete'}
            </Button>

            {deleteMode && (
              <Button 
                variant="destructive" 
                size="md"
                onClick={deleteSelectedSaved}
                style={{ borderRadius: '14px', fontWeight: '700', backgroundColor:'blue' }}
              >
                Delete {selectedSaved.length}
              </Button>
            )}

            <Button 
              variant="secondary" 
              size="md"
              onClick={handleClearSaved}
              style={{ borderRadius: '14px', fontWeight: '600', backgroundColor:'blue' }}  
            >
              Clear All
            </Button>

            <Button 
              variant="secondary" 
              size="md"
              onClick={handleReset}
              style={{ borderRadius: '14px', fontWeight: '600', backgroundColor:'blue' }}
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
            margin: '0 0 2rem 0', 
            fontSize: '1.4rem', 
            fontWeight: 800,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(226,232,240,0.8)'
          }}>
              Saved Classifications
          </h3>

          {savedTrees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 3rem', color: '#64748b' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.6 }}>📂</div>
              <div style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 600 }}>No saved </div>
            </div>
          ) : (
            savedTrees.map((t, index) => (
              <div
                key={index}
                className={`${styles.savedCard} ${selectedSaved.includes(index) ? 'selected' : ''}`}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px',
                  marginBottom: '1.2rem'
                }}>
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedSaved.includes(index)}
                      onChange={() => toggleSavedSelect(index)}
                      style={{ width: '20px', height: '20px', accentColor: '#6366f1' }}
                    />
                  )}
                  <div className={styles.badge} style={{ 
                    fontSize: '13px',
                    padding: '6px 12px',
                    background: '#10b981'
                  }}>
                    #{index + 1}
                  </div>
                  <div style={{ 
                    fontWeight: 800, 
                    fontSize: '17px', 
                    color: '#1e293b',
                    flex: 1
                  }}>
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
            margin: '0 0 2rem 0', 
            fontSize: '1.4rem', 
            fontWeight: 800,
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '1rem',
            borderBottom: '2px solid rgba(226,232,240,0.8)'
          }}>
            🛠 Create Classification
          </h3>

          {tree.length === 0 && !isAdding ? (
            <div style={{ textAlign: 'center', padding: '5rem 3rem', color: '#64748b' }}>
              <div style={{ fontSize: '6rem', marginBottom: '2rem', opacity: 0.5 }}>⚡</div>
              <div style={{ fontSize: '1.5rem', marginBottom: '1.2rem', fontWeight: 700, color: '#374151' }}>
                Ready to build 
              </div>
              <div style={{ 
                fontSize: '1.1rem', 
                opacity: 0.8,
                maxWidth: '320px',
                margin: '0 auto 2rem auto'
              }}>
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
         `}
        </style>
      </div>
  );
};

export { ClassificationPage };
