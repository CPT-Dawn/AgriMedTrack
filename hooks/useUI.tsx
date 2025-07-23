import React, { createContext, useContext, useState, ReactNode } from "react";
import ContextMenu, { ContextMenuItem } from "../components/ContextMenu";
import ActionSheet, { ActionSheetItem } from "../components/ActionSheet";
import ConfirmDialog, { ConfirmDialogType } from "../components/ConfirmDialog";
import CustomModal, {
  ModalSize,
  ModalPosition,
} from "../components/CustomModal";

interface ContextMenuConfig {
  items: ContextMenuItem[];
  anchor: { x: number; y: number };
  title?: string;
}

interface ActionSheetConfig {
  items: ActionSheetItem[];
  title?: string;
  subtitle?: string;
  showCancel?: boolean;
  cancelText?: string;
}

interface ConfirmDialogConfig {
  title: string;
  message?: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  onConfirm: () => void;
}

interface CustomModalConfig {
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  position?: ModalPosition;
  showCloseButton?: boolean;
  children: ReactNode;
  actions?: Array<{
    label: string;
    onPress: () => void;
    type?: "primary" | "secondary" | "danger";
    icon?: string;
  }>;
  closeOnBackdrop?: boolean;
}

interface UIContextType {
  showContextMenu: (config: ContextMenuConfig) => void;
  showActionSheet: (config: ActionSheetConfig) => void;
  showConfirmDialog: (config: ConfirmDialogConfig) => void;
  showModal: (config: CustomModalConfig) => void;
  hideAll: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    config?: ContextMenuConfig;
  }>({ visible: false });

  const [actionSheet, setActionSheet] = useState<{
    visible: boolean;
    config?: ActionSheetConfig;
  }>({ visible: false });

  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    config?: ConfirmDialogConfig;
  }>({ visible: false });

  const [modal, setModal] = useState<{
    visible: boolean;
    config?: CustomModalConfig;
  }>({ visible: false });

  const showContextMenu = (config: ContextMenuConfig) => {
    setContextMenu({ visible: true, config });
  };

  const hideContextMenu = () => {
    setContextMenu({ visible: false });
    setTimeout(() => {
      setContextMenu({ visible: false, config: undefined });
    }, 300);
  };

  const showActionSheet = (config: ActionSheetConfig) => {
    setActionSheet({ visible: true, config });
  };

  const hideActionSheet = () => {
    setActionSheet({ visible: false });
    setTimeout(() => {
      setActionSheet({ visible: false, config: undefined });
    }, 300);
  };

  const showConfirmDialog = (config: ConfirmDialogConfig) => {
    setConfirmDialog({ visible: true, config });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({ visible: false });
    setTimeout(() => {
      setConfirmDialog({ visible: false, config: undefined });
    }, 300);
  };

  const showModal = (config: CustomModalConfig) => {
    setModal({ visible: true, config });
  };

  const hideModal = () => {
    setModal({ visible: false });
    setTimeout(() => {
      setModal({ visible: false, config: undefined });
    }, 300);
  };

  const hideAll = () => {
    hideContextMenu();
    hideActionSheet();
    hideConfirmDialog();
    hideModal();
  };

  return (
    <UIContext.Provider
      value={{
        showContextMenu,
        showActionSheet,
        showConfirmDialog,
        showModal,
        hideAll,
      }}
    >
      {children}

      {/* Context Menu */}
      {contextMenu.config && (
        <ContextMenu
          visible={contextMenu.visible}
          onClose={hideContextMenu}
          items={contextMenu.config.items}
          anchor={contextMenu.config.anchor}
          title={contextMenu.config.title}
        />
      )}

      {/* Action Sheet */}
      {actionSheet.config && (
        <ActionSheet
          visible={actionSheet.visible}
          onClose={hideActionSheet}
          items={actionSheet.config.items}
          title={actionSheet.config.title}
          subtitle={actionSheet.config.subtitle}
          showCancel={actionSheet.config.showCancel}
          cancelText={actionSheet.config.cancelText}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog.config && (
        <ConfirmDialog
          visible={confirmDialog.visible}
          onClose={hideConfirmDialog}
          onConfirm={confirmDialog.config.onConfirm}
          title={confirmDialog.config.title}
          message={confirmDialog.config.message}
          type={confirmDialog.config.type}
          confirmText={confirmDialog.config.confirmText}
          cancelText={confirmDialog.config.cancelText}
          icon={confirmDialog.config.icon}
        />
      )}

      {/* Custom Modal */}
      {modal.config && (
        <CustomModal
          visible={modal.visible}
          onClose={hideModal}
          title={modal.config.title}
          subtitle={modal.config.subtitle}
          size={modal.config.size}
          position={modal.config.position}
          showCloseButton={modal.config.showCloseButton}
          actions={modal.config.actions}
          closeOnBackdrop={modal.config.closeOnBackdrop}
        >
          {modal.config.children}
        </CustomModal>
      )}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
