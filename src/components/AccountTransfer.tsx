import React, { useState } from 'react';
import { ArrowRightLeft, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AccountTransferProps {
  onClose: () => void;
}

export default function AccountTransfer({ onClose }: AccountTransferProps) {
  const { state, dispatch } = useApp();
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create withdrawal transaction from source account
    const withdrawalTransaction = {
      id: `transfer-out-${Date.now()}`,
      accountId: fromAccount,
      amount: -parseFloat(amount),
      description: `Virement vers ${state.accounts.find(acc => acc.id === toAccount)?.name} - ${description}`,
      category: 'Virement',
      date: new Date().toISOString().split('T')[0],
      type: 'expense' as const,
    };

    // Create deposit transaction to destination account
    const depositTransaction = {
      id: `transfer-in-${Date.now()}`,
      accountId: toAccount,
      amount: parseFloat(amount),
      description: `Virement depuis ${state.accounts.find(acc => acc.id === fromAccount)?.name} - ${description}`,
      category: 'Virement',
      date: new Date().toISOString().split('T')[0],
      type: 'income' as const,
    };

    // Dispatch both transactions
    dispatch({ type: 'ADD_TRANSACTION', payload: withdrawalTransaction });
    dispatch({ type: 'ADD_TRANSACTION', payload: depositTransaction });

    // Reset form and close
    setFromAccount('');
    setToAccount('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Nouveau Virement</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compte source
          </label>
          <select
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Sélectionner un compte</option>
            {state.accounts.map((account) => (
              <option 
                key={account.id} 
                value={account.id}
                disabled={account.id === toAccount}
              >
                {account.name} ({account.balance.toLocaleString()}€)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compte destinataire
          </label>
          <select
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Sélectionner un compte</option>
            {state.accounts.map((account) => (
              <option 
                key={account.id} 
                value={account.id}
                disabled={account.id === fromAccount}
              >
                {account.name} ({account.balance.toLocaleString()}€)
              </option>
            ))}
          </select>
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
              min="0.01"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optionnel)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Motif du virement"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
          >
            <ArrowRightLeft className="w-5 h-5" />
            Effectuer le virement
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}