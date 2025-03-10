export default (state, action) => {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return {
        ...state,
        transactions: action.payload,
      }
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
      }
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction,
        ),
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      }
    default:
      return state
  }
}