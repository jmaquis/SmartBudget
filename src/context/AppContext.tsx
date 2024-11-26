import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { Account, Transaction, Goal, BudgetCategory } from '../types';

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  budgetCategories: BudgetCategory[];
  selectedAccount: string | null;
  error: string | null;
  isLoading: boolean;
}

type Action =
  | { type: 'SET_DATA'; payload: Omit<AppState, 'error' | 'isLoading'> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_DATA' }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SELECT_ACCOUNT'; payload: string }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_BUDGET_CATEGORY'; payload: BudgetCategory }
  | { type: 'UPDATE_BUDGET_CATEGORY'; payload: BudgetCategory }
  | { type: 'DELETE_BUDGET_CATEGORY'; payload: string };

const initialState: AppState = {
  accounts: [],
  transactions: [],
  goals: [],
  budgetCategories: [],
  selectedAccount: null,
  error: null,
  isLoading: true
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload, error: null, isLoading: false };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'RESET_DATA':
      return initialState;
    
    case 'ADD_TRANSACTION': {
      const newState = {
        ...state,
        transactions: [...state.transactions, action.payload],
        accounts: state.accounts.map(account => {
          if (account.id === action.payload.accountId) {
            return {
              ...account,
              balance: account.balance + action.payload.amount
            };
          }
          return account;
        })
      };

      if (action.payload.goalId && action.payload.type === 'expense') {
        newState.goals = newState.goals.map(goal => {
          if (goal.id === action.payload.goalId) {
            return {
              ...goal,
              current: goal.current + Math.abs(action.payload.amount)
            };
          }
          return goal;
        });
      }

      return newState;
    }

    case 'UPDATE_TRANSACTION': {
      const oldTransaction = state.transactions.find(tx => tx.id === action.payload.id);
      if (!oldTransaction) return state;

      const newState = {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.id ? action.payload : tx
        ),
        accounts: state.accounts.map(account => {
          if (account.id === action.payload.accountId) {
            const balanceAdjustment = action.payload.amount - oldTransaction.amount;
            return {
              ...account,
              balance: account.balance + balanceAdjustment
            };
          }
          return account;
        })
      };

      if (oldTransaction.goalId) {
        newState.goals = newState.goals.map(goal => {
          if (goal.id === oldTransaction.goalId) {
            return {
              ...goal,
              current: goal.current - Math.abs(oldTransaction.amount)
            };
          }
          return goal;
        });
      }

      if (action.payload.goalId) {
        newState.goals = newState.goals.map(goal => {
          if (goal.id === action.payload.goalId) {
            return {
              ...goal,
              current: goal.current + Math.abs(action.payload.amount)
            };
          }
          return goal;
        });
      }

      return newState;
    }

    case 'DELETE_TRANSACTION': {
      const transactionToDelete = state.transactions.find(tx => tx.id === action.payload);
      if (!transactionToDelete) return state;

      const newState = {
        ...state,
        transactions: state.transactions.filter(tx => tx.id !== action.payload),
        accounts: state.accounts.map(account => {
          if (account.id === transactionToDelete.accountId) {
            return {
              ...account,
              balance: account.balance - transactionToDelete.amount
            };
          }
          return account;
        })
      };

      if (transactionToDelete.goalId) {
        newState.goals = newState.goals.map(goal => {
          if (goal.id === transactionToDelete.goalId) {
            return {
              ...goal,
              current: goal.current - Math.abs(transactionToDelete.amount)
            };
          }
          return goal;
        });
      }

      return newState;
    }

    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        selectedAccount: state.selectedAccount || action.payload.id
      };

    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
        transactions: state.transactions.filter(tx => tx.accountId !== action.payload),
        selectedAccount: state.selectedAccount === action.payload
          ? state.accounts.find(acc => acc.id !== action.payload)?.id || null
          : state.selectedAccount
      };

    case 'SELECT_ACCOUNT':
      return {
        ...state,
        selectedAccount: action.payload
      };

    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload]
      };

    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        )
      };

    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload),
        transactions: state.transactions.map(tx =>
          tx.goalId === action.payload
            ? { ...tx, goalId: undefined, category: 'Autre' }
            : tx
        )
      };

    case 'ADD_BUDGET_CATEGORY':
      return {
        ...state,
        budgetCategories: [...state.budgetCategories, action.payload]
      };

    case 'UPDATE_BUDGET_CATEGORY':
      return {
        ...state,
        budgetCategories: state.budgetCategories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };

    case 'DELETE_BUDGET_CATEGORY':
      return {
        ...state,
        budgetCategories: state.budgetCategories.filter(
          category => category.id !== action.payload
        ),
        transactions: state.transactions.map(tx =>
          tx.category === state.budgetCategories.find(
            cat => cat.id === action.payload
          )?.name
            ? { ...tx, category: 'Autre' }
            : tx
        )
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function validateData(data: DocumentData): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.userId || typeof data.userId !== 'string') return false;
  if (data.amount !== undefined && typeof data.amount !== 'number') return false;
  if (data.balance !== undefined && typeof data.balance !== 'number') return false;
  return true;
}

function sanitizeData<T extends Record<string, any>>(data: T): T {
  const cleaned = { ...data };
  
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
      return;
    }
    
    if (!isNaN(Number(cleaned[key])) && typeof cleaned[key] !== 'boolean') {
      cleaned[key] = Number(cleaned[key]);
    }
    
    if (cleaned[key] instanceof Date) {
      cleaned[key] = cleaned[key].toISOString();
    }
  });

  return cleaned;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  const saveDocument = async (
    collectionName: string,
    docId: string,
    data: DocumentData
  ): Promise<void> => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    const sanitizedData = sanitizeData({
      ...data,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    });

    if (!validateData(sanitizedData)) {
      throw new Error('Invalid data structure');
    }

    try {
      await setDoc(doc(db, collectionName, docId), sanitizedData, { merge: true });
    } catch (error) {
      console.error(`Error saving document to ${collectionName}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user) {
        dispatch({ type: 'RESET_DATA' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const collections = ['accounts', 'transactions', 'goals', 'budgetCategories'] as const;
        const data: Partial<AppState> = {};

        for (const collectionName of collections) {
          const q = query(collection(db, collectionName), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          
          data[collectionName] = querySnapshot.docs
            .map(doc => {
              const docData = doc.data();
              return validateData(docData) ? { id: doc.id, ...docData } : null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null) as any[];
        }

        if (isMounted) {
          dispatch({
            type: 'SET_DATA',
            payload: {
              accounts: data.accounts || [],
              transactions: data.transactions || [],
              goals: data.goals || [],
              budgetCategories: data.budgetCategories || [],
              selectedAccount: data.accounts?.length ? data.accounts[0].id : null,
            },
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          dispatch({
            type: 'SET_ERROR',
            payload: 'Erreur lors du chargement des données. Veuillez réessayer.'
          });
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const saveTimeout = setTimeout(async () => {
      if (!user || state.error || state.isLoading) return;

      try {
        const savePromises = [
          ...state.accounts.map(account =>
            saveDocument('accounts', account.id, account)
          ),
          ...state.transactions.map(transaction =>
            saveDocument('transactions', transaction.id, transaction)
          ),
          ...state.goals.map(goal =>
            saveDocument('goals', goal.id, goal)
          ),
          ...state.budgetCategories.map(category =>
            saveDocument('budgetCategories', category.id, category)
          )
        ];

        await Promise.all(savePromises);
      } catch (error) {
        console.error('Error saving data:', error);
        if (isMounted) {
          dispatch({
            type: 'SET_ERROR',
            payload: 'Erreur lors de la sauvegarde des données. Veuillez réessayer.'
          });
        }
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(saveTimeout);
    };
  }, [state.accounts, state.transactions, state.goals, state.budgetCategories, user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}