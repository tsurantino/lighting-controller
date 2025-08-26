// src/components/layout/Layout.tsx
import React from 'react';
import { ViewMode } from '../../types';
import Modal from '../ui/Modal';

interface LayoutProps {
  viewMode: ViewMode;
  showSimulator: boolean;
  showConfig: boolean;
  onCloseConfig: () => void;
  children: {
    simulator?: React.ReactNode;
    controls?: React.ReactNode;
    configControls?: React.ReactNode;
  };
}

const Layout: React.FC<LayoutProps> = ({
  viewMode,
  showSimulator,
  showConfig,
  onCloseConfig,
  children,
}) => {
  if (viewMode === 'pane') {
    // PANE LAYOUT - Simple side-by-side
    return (
      <>
        <main className="flex-grow">
          <div className="flex gap-6 h-full">
            {showSimulator && (
              <div className="w-1/3 flex-shrink-0">
                {children.simulator}
              </div>
            )}
            <div className={showSimulator ? "flex-grow" : "w-full"}>
              {children.controls}
            </div>
          </div>
        </main>

        {/* Config Modal */}
        <Modal
          isOpen={showConfig}
          onClose={onCloseConfig}
          title="Configuration"
          size="xl"
        >
          {children.configControls}
        </Modal>
      </>
    );
  }

  // LANDSCAPE LAYOUT - Row-based layout
  return (
    <>
      <main className="flex-grow">
        <div className="flex flex-col gap-6 h-full">
          {/* Row 1: Simulator - Full Width */}
          {showSimulator && (
            <div className="w-full">
              {children.simulator}
            </div>
          )}
          
          {/* Row 2 & 3: Controls */}
          {children.controls}
        </div>
      </main>

      {/* Config Modal */}
      <Modal
        isOpen={showConfig}
        onClose={onCloseConfig}
        title="Configuration"
        size="xl"
      >
        {children.configControls}
      </Modal>
    </>
  );
};

export default Layout;