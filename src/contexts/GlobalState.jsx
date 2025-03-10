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
          .eq("user_id", currentUser.id)
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

    // Set up real-time subscription
    const channel = supabase
      .channel("public:transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          // Handle different event types
          if (payload.eventType === "INSERT") {
            dispatch({ type: "ADD_TRANSACTION", payload: payload.new })
          } else if (payload.eventType === "DELETE") {
            dispatch({ type: "DELETE_TRANSACTION", payload: payload.old.id })
          } else if (payload.eventType === "UPDATE") {
            dispatch({ type: "UPDATE_TRANSACTION", payload: payload.new })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  // Add transaction to Supabase with optimistic update
  const addTransaction = async (transaction) => {
    if (!currentUser) return

    // Generate a temporary ID
    const tempId = Date.now().toString()

    // Create the transaction object
    const newTransaction = {
      id: tempId,
      description: transaction.description,
      amount: transaction.amount,
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
    }

    // Optimistically update UI
    dispatch({ type: "ADD_TRANSACTION", payload: newTransaction })

    try {
      // Send to Supabase
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            description: transaction.description,
            amount: transaction.amount,
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error

      // If successful, update the temporary transaction with the real one
      if (data && data[0]) {
        dispatch({ type: "REPLACE_TRANSACTION", payload: { tempId, newTransaction: data[0] } })
      }
    } catch (error) {
      console.error("Error adding transaction:", error)

      // If failed, remove the optimistic transaction
      dispatch({ type: "DELETE_TRANSACTION", payload: tempId })

      dispatch({
        type: "SET_ERROR",
        payload: "Error al agregar la transacción",
      })
    }
  }

  // Delete transaction from Supabase with optimistic update
  const deleteTransaction = async (id) => {
    if (!currentUser) return

    // Find the transaction to be deleted
    const transactionToDelete = state.transactions.find((t) => t.id === id)

    if (!transactionToDelete) return

    // Optimistically remove from UI
    dispatch({ type: "DELETE_TRANSACTION", payload: id })

    try {
      // Delete from Supabase
      const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", currentUser.id)

      if (error) throw error

      // Success is handled by the optimistic update
    } catch (error) {
      console.error("Error deleting transaction:", error)

      // If failed, add the transaction back
      dispatch({ type: "ADD_TRANSACTION", payload: transactionToDelete })

      dispatch({
        type: "SET_ERROR",
        payload: "Error al eliminar la transacción",
      })
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

