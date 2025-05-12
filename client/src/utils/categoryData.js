import React from 'react';
import { BsTools, BsLightningFill, BsGear, BsTree, BsShield } from 'react-icons/bs';

// Import custom SVG icons
import { ReactComponent as HammerIcon } from '../assets/icons/handtools/alitools-icon-handtools-hammer-24-default.svg';
import { ReactComponent as WrenchIcon } from '../assets/icons/handtools/alitools-icon-handtools-wrench-24-default.svg';

/**
 * Store categories data with icon names and descriptions
 */
export const categories = [
  { 
    id: 'ferramentas-manuais', 
    name: 'Ferramentas Manuais', 
    icon: 'tools', 
    customIcon: <HammerIcon />,
    description: 'Chaves, martelos, alicates e mais'
  },
  { 
    id: 'ferramentas-electricas', 
    name: 'Ferramentas Elétricas', 
    icon: 'lightning', 
    description: 'Furadeiras, serras, lixadeiras e mais' 
  },
  { 
    id: 'abrasivos', 
    name: 'Abrasivos', 
    icon: 'gear', 
    description: 'Lixas, discos de corte, rebolos e mais' 
  },
  { 
    id: 'jardim', 
    name: 'Jardim', 
    icon: 'tree', 
    description: 'Ferramentas e equipamentos para jardim' 
  },
  { 
    id: 'protecao', 
    name: 'Proteção', 
    icon: 'shield', 
    description: 'Equipamentos de proteção individual' 
  }
]; 