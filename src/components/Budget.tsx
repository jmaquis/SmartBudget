import React, { useState } from 'react';
import { PieChart as PieChartIcon, DollarSign, Plus, Pencil, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { BudgetCategory } from '../types';

export default function Budget() {
  const { state, dispatch } = useApp();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryLimit, setCategoryLimit] = useState('');
  const [categoryColor, setCategoryColor] = useState('#4F46E5');

  const colors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ];

  // Calculate spending by category
  const categoryData = Object.entries(
    state.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value], index) => ({
    name,
    value,
    color: state.budgetCategories.find(cat => cat.name === name)?.color || colors[index % colors.length],
  }));

  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.value, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData: BudgetCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: categoryName,
      limit: parseFloat(categoryLimit),
      color: categoryColor,
    };

    if (editingCategory) {
      dispatch({ type: 'UPDATE_BUDGET_CATEGORY', payload: categoryData });
    } else {
      dispatch({ type: 'ADD_BUDGET_CATEGORY', payload: categoryData });
    }

    // Reset form
    setCategoryName('');
    setCategoryLimit('');
    setCategoryColor('#4F46E5');
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: BudgetCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryLimit(category.limit.toString());
    setCategoryColor(category.color);
    setIsAddingCategory(true);
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      dispatch({ type: 'DELETE_BUDGET_CATEGORY', payload: categoryId });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-500">Gérez vos catégories et limites de dépenses</p>
        </div>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Catégorie
        </button>
      </div>

      {isAddingCategory && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la catégorie
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limite mensuelle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  value={categoryLimit}
                  onChange={(e) => setCategoryLimit(e.target.value)}
                  className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCategoryColor(color)}
                    className={`w-8 h-8 rounded-full ${
                      categoryColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
              >
                {editingCategory ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setEditingCategory(null);
                  setCategoryName('');
                  setCategoryLimit('');
                  setCategoryColor('#4F46E5');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Répartition des Dépenses</h2>
            <PieChartIcon className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()}€`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Catégories</h2>
            <DollarSign className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {state.budgetCategories.map((category) => {
              const spent = categoryData.find(c => c.name === category.name)?.value || 0;
              const progress = (spent / category.limit) * 100;
              
              return (
                <div key={category.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: progress > 100 ? '#EF4444' : category.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">
                      {spent.toLocaleString()}€ / {category.limit.toLocaleString()}€
                    </span>
                    <span className={progress > 100 ? 'text-red-600' : 'text-gray-500'}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
            {state.budgetCategories.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune catégorie définie
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}