import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children, isOpen }) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  const modalRootRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Look for existing modal root or create one
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      root.style.position = 'fixed';
      root.style.top = '0';
      root.style.left = '0';
      root.style.width = '100%';
      root.style.height = '100%';
      root.style.zIndex = '99999'; // Very high z-index
      root.style.pointerEvents = 'none'; // Allow clicks to pass through by default
      document.body.appendChild(root);
    }
    
    setModalRoot(root);
    modalRootRef.current = root;
    
    // Cleanup function - safer implementation
    return () => {
      // We don't try to remove the modal root on component unmount
      // This prevents errors when navigating between pages
      // The modal root will be reused by other components
    };
  }, []);
  
  useEffect(() => {
    const root = modalRootRef.current;
    if (root) {
      // When modal is open, prevent body scrolling
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        root.style.pointerEvents = 'auto';
      } else {
        document.body.style.overflow = '';
        root.style.pointerEvents = 'none';
      }
    }
    
    return () => {
      // Only reset overflow if the component is truly unmounting
      if (document.body) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, modalRoot]);
  
  if (!modalRoot || !isOpen) return null;
  
  return createPortal(children, modalRoot);
};

export default ModalPortal;
