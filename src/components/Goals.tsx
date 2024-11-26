import React, { useState } from 'react';
import { Target, Trash2, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Goal } from '../types';

const GOAL_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Goals() {
  const { state, dispatch } = useApp();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goalData: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      name,
      target: parseFloat(target),
      current: editingGoal?.current || 0,
      deadline,
      color: editingGoal?.color || GOAL_COLORS[state.goals.length % GOAL_COLORS.length],
    };

    if (editingGoal) {
      dispatch({ type: 'UPDATE_GOAL', payload: goalData });
    } else {
      dispatch({ type: 'ADD_GOAL', payload: goalData });
    }

    // Reset form
    setName('');
    setTarget('');
    setDeadline('');
    setEditingGoal(null);
  };

  const handleDelete = (goalId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      dispatch({ type: 'DELETE_GOAL', payload: goalId });
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTarget(goal.target.toString());
    setDeadline(goal.deadline);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Objectifs d'épargne</h1>
        <p className="text-gray-500">Suivez vos objectifs et votre progression</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {state.goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const deadline = new Date(goal.deadline);
            const remaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${goal.color}20` }}>
                      <Target className="w-6 h-6" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-500">{remaining} jours restants</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: goal.color,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{goal.current.toLocaleString()}€</span>
                    <span>{goal.target.toLocaleString()}€</span>
                  </div>
                </div>
              </div>
            );
          })}
          {state.goals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun objectif d'épargne défini
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingGoal ? 'Modifier l\'objectif' : 'Nouvel Objectif'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'objectif
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Vacances d'été"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant cible
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
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
                Date limite
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Target className="w-5 h-5" />
              {editingGoal ? 'Mettre à jour' : 'Créer l\'objectif'}
            </button>

            {editingGoal && (
              <button
                type="button"
                onClick={() => {
                  setEditingGoal(null);
                  setName('');
                  setTarget('');
                  setDeadline('');
                }}
                className="w-full py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}