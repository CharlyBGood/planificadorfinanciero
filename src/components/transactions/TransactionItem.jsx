import { useGlobalState } from "../../contexts/GlobalState";
import { BiTrash } from "react-icons/bi";

export function TransactionItem({ transaction: { id, description, amount } }) {
  const { deleteTransaction } = useGlobalState();
  const sign = amount < 0 ? "-" : "+";

  return (
    <li
      key={id}
      className={`text-black px-3 py-1 rounded-lg mb-2 w-full flex justify-between items-center ${amount < 0 ? "bg-red-500" : "bg-green-500"
        }`}
    >
      {description}
      <div className="flex justify-between items-center">
        <span>
          {sign}${Math.abs(amount)}
        </span>
        <button
          className="font-bold text-black rounded-lg ml-2"
          onClick={() => deleteTransaction(id)}
        >
          <BiTrash />
        </button>
      </div>
    </li>
  );
}