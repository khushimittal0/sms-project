import React, { useState } from 'react';
import { Button } from '@grafana/ui';
import { ClassificationPage } from './ClassificationPage';
import { CrewPage } from './CrewPage';


type Tab =  'classification' | 'crew';

export const ConfigurationTabsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>();

  const tabStyle ={
    backgroundColor:  '#000000', 
    color: '#ffffff',
    border: 'none',
   
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      
      
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px',
          background: '#f3f4f6',
          borderBottom: '1px solid #d1d5db',
        }}
      >
      
        <Button
          variant={activeTab === 'classification' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('classification')}
          style={tabStyle}
            onMouseEnter={(e)=>{
            e.currentTarget.style.backgroundColor='#2563eb'
          }}
            onMouseLeave={(e)=>{
              e.currentTarget.style.backgroundColor='#000000'
            }}
        >
          Classification
        </Button>

        <Button
          variant={activeTab === 'crew' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('crew')}
          style={tabStyle}
            onMouseEnter={(e)=>{
            e.currentTarget.style.backgroundColor='#2563eb'
          }}
            onMouseLeave={(e)=>{
              e.currentTarget.style.backgroundColor='#000000'
            }}
        >
          Crew
        </Button>

      </div>

      
      <div style={{ padding: '16px' }}>
        {activeTab === 'classification' && <ClassificationPage />}
         {activeTab === 'crew' && <CrewPage />}
      </div>
    </div>
  );
};
