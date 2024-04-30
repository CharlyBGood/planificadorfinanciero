import { useGlobalState } from "../../contexts/GlobalState";

export function TransactionItem({ transaction }) {
  const { deleteTransaction } = useGlobalState();
  return (
    <li className="bg-zinc-600 text-white px-3 py-1 rounded-lg mb-2 w-full flex justify-between item-center">
      <p className="text-sm">{transaction.description}</p>
      <div className="flex w-full justify-between item-center">
        <span>${transaction.amount}</span>
        <button
        className="p-2"
          onClick={() => {
            deleteTransaction(transaction.id);
          }}
        >
          X
        </button>
      </div>
    </li>
  );
}

export default TransactionItem;
