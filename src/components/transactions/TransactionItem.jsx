import { useGlobalState } from "../../contexts/GlobalState";
import { BiTrash } from "react-icons/bi"

export function TransactionItem({ transaction: { id, description, amount } }) {
  const { deleteTransaction } = useGlobalState();
  const sign = amount > 0 ? "-" : "+";

  return (
    <li
      key={id}
      className={
        `bg-zinc-600 text-white px-3 py-1 rounded-lg mb-2 w-full flex justify-between items-center` +
        ` ${amount < 0 ? "bg-red-700" : "bg-green-700"}`
      }>
      {description}
      <div className="flex w-full justify-between item-center">
        <span>
          {sign}${Math.abs(amount)}
        </span>
        <button
          className="font-bold text-white rounded-lg ml-2"
          onClick={() => deleteTransaction(id)}
        >
          <BiTrash />
        </button>
      </div>
    </li>
  );
}

