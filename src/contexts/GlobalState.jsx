"use client"

import { createContext, useContext, useReducer, useEffect, useState } from "react"
import { supabase } from "../supabase/config"
import { useAuth } from "./AuthContext"
import AppReducer from "./AppReducer"

const initialState = {
  transactions: [],
  loading: false,
  error: null,
}

export const Context = createContext(initialState)

export const useGlobalState = () => {
  const context = useContext(Context)
  if (!context) throw new Error("useGlobal state must be used within a GlobalState")
  return context
}

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState)
  const { currentUser } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  // Load transactions from Supabase when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: "SET_TRANSACTIONS", payload: [] })
      setIsInitialized(true)
      return
    }

    dispatch({ type: "SET_LOADING", payload: true })

    // Initial fetch of transactions
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error

        dispatch({ type: "SET_TRANSACTIONS", payload: data || [] })
      } catch (error) {
        console.error("Error fetching transactions:", error)
        dispatch({
          type: "SET_ERROR",
          payload: "Error al cargar las transacciones",
        })
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
        setIsInitialized(true)
      }
    }

    fetchTransactions()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          // Refetch transactions when changes occur
          fetchTransactions()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [currentUser])

  // Add transaction to Supabase
  const addTransaction = async (transaction) => {
    if (!currentUser) return

    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const { error } = await supabase.from("transactions").insert([
        {
          description: transaction.description,
          amount: transaction.amount,
          user_id: currentUser.id,
          created_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      // The transaction will be added via the subscription
    } catch (error) {
      console.error("Error adding transaction:", error)
      dispatch({
        type: "SET_ERROR",
        payload: "Error al agregar la transacción",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Delete transaction from Supabase
  const deleteTransaction = async (id) => {
    if (!currentUser) return

    dispatch({ type: "SET_LOADING", payload: true })

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", currentUser.id)

      if (error) throw error

      // The transaction will be removed via the subscription
    } catch (error) {
      console.error("Error deleting transaction:", error)
      dispatch({
        type: "SET_ERROR",
        payload: "Error al eliminar la transacción",
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  return (
    <Context.Provider
      value={{
        transactions: state.transactions,
        loading: state.loading,
        error: state.error,
        isInitialized,
        deleteTransaction,
        addTransaction,
      }}
    >
      {children}
    </Context.Provider>
  )
}