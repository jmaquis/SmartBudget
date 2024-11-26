import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  Settings,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Transactions', icon: Receipt, path: '/transactions' },
  { name: 'Budget', icon: PieChart, path: '/budget' },
  { name: 'Objectifs', icon: Target, path: '/goals' },
  { name: 'Paramètres', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
        <PieChart className="w-8 h-8 text-indigo-600" />
        <span className="text-xl font-bold text-gray-900">SmartBudget</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg
              ${isActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={() => {
            // Handle logout logic here
            console.log('Logout clicked');
          }}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 w-full"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}