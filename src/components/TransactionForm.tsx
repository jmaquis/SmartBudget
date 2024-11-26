import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Plus, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, BudgetCategory } from '../types';

interface TransactionFormProps {
  editingTransaction: Transaction | null;
  onCancel: () => void;
}

export default function TransactionForm({ editingTransaction, onCancel }: TransactionFormProps) {
  const { state, dispatch } = useApp();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [goalId, setGoalId] = useState<string>('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4F46E5');

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

  // Get the selected account
  const selectedAccount = state.accounts.find(acc => acc.id === state.selectedAccount);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(Math.abs(editingTransaction.amount).toString());
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setGoalId(editingTransaction.goalId || '');
    }
  }, [editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction: Transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      accountId: state.selectedAccount!,
      description,
      amount: parseFloat(amount) * (type === 'expense' ? -1 : 1),
      date,
      category,
      type,
      goalId: goalId || undefined,
    };

    if (editingTransaction) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    }

    // Reset form
    setType('expense');
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setGoalId('');
    onCancel();
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData: BudgetCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      limit: parseFloat(newCategoryLimit),
      color: newCategoryColor,
    };

    dispatch({ type: 'ADD_BUDGET_CATEGORY', payload: categoryData });
    setCategory(newCategoryName);
    
    // Reset form
    setNewCategoryName('');
    setNewCategoryLimit('');
    setNewCategoryColor('#4F46E5');
    setIsAddingCategory(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {editingTransaction ? 'Modifier la Transaction' : 'Nouvelle Transaction'}
        </h2>
        {editingTransaction && (
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Account Indicator */}
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Compte sélectionné</p>
            <p className="text-sm text-indigo-600">{selectedAccount?.name}</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              type === 'expense'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Dépense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              type === 'income'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Revenu
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Description de la transaction"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Nouvelle catégorie
            </button>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {state.budgetCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
            <option value="Objectif">Objectif</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {isAddingCategory && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-900">Nouvelle Catégorie</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nom de la catégorie"
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
                  value={newCategoryLimit}
                  onChange={(e) => setNewCategoryLimit(e.target.value)}
                  className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
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
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-8 h-8 rounded-full ${
                      newCategoryColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                  setNewCategoryLimit('');
                  setNewCategoryColor('#4F46E5');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {category === 'Objectif' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectif associé
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Sélectionner un objectif</option>
              {state.goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name} ({goal.current.toLocaleString()}€ / {goal.target.toLocaleString()}€)
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          {editingTransaction ? 'Mettre à jour' : 'Ajouter la transaction'}
        </button>
      </form>
    </div>
  );
}