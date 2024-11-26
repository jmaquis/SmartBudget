import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Plus, X, ArrowRightLeft, Trash2 } from 'lucide-react';
import { Account } from '../types';
import AccountTransfer from './AccountTransfer';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AccountSelector() {
  const { state, dispatch } = useApp();
  const { accounts, selectedAccount } = state;
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<Account['type']>('checking');
  const [initialBalance, setInitialBalance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const account: Account = {
      id: Date.now().toString(),
      name: accountName,
      balance: parseFloat(initialBalance),
      type: accountType,
      currency: 'EUR',
    };

    dispatch({ type: 'ADD_ACCOUNT', payload: account });
    
    // Reset form
    setAccountName('');
    setAccountType('checking');
    setInitialBalance('');
    setIsAddingAccount(false);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible et supprimera toutes les transactions associées.')) {
      return;
    }

    try {
      // Delete account from Firestore
      await deleteDoc(doc(db, 'accounts', accountId));

      // Delete all transactions associated with this account
      const accountTransactions = state.transactions.filter(tx => tx.accountId === accountId);
      for (const transaction of accountTransactions) {
        await deleteDoc(doc(db, 'transactions', transaction.id));
      }

      // Update local state
      dispatch({ type: 'DELETE_ACCOUNT', payload: accountId });

      // If the deleted account was selected, select another account
      if (selectedAccount === accountId) {
        const remainingAccount = accounts.find(acc => acc.id !== accountId);
        if (remainingAccount) {
          dispatch({ type: 'SELECT_ACCOUNT', payload: remainingAccount.id });
        } else {
          dispatch({ type: 'SELECT_ACCOUNT', payload: null });
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Une erreur est survenue lors de la suppression du compte.');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mes Comptes</h2>
        <div className="flex items-center gap-2">
          {accounts.length >= 2 && (
            <button
              onClick={() => setIsTransferring(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Virement
            </button>
          )}
          <button
            onClick={() => setIsAddingAccount(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Nouveau compte
          </button>
        </div>
      </div>

      {isAddingAccount && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Nouveau Compte</h3>
            <button
              onClick={() => setIsAddingAccount(false)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du compte
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Compte Courant"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de compte
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as Account['type'])}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="checking">Compte Courant</option>
                <option value="savings">Compte Épargne</option>
                <option value="credit">Carte de Crédit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solde initial
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
              >
                Créer le compte
              </button>
              <button
                type="button"
                onClick={() => setIsAddingAccount(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {isTransferring && (
        <AccountTransfer onClose={() => setIsTransferring(false)} />
      )}

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {accounts.map((account) => (
          <div key={account.id} className="relative group">
            <button
              onClick={() => dispatch({ type: 'SELECT_ACCOUNT', payload: account.id })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedAccount === account.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <div className="text-left">
                <p className="text-sm font-medium">{account.name}</p>
                <p className="text-xs">{account.balance.toLocaleString('fr-FR')} €</p>
              </div>
            </button>
            <button
              onClick={() => handleDeleteAccount(account.id)}
              className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
              title="Supprimer le compte"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}