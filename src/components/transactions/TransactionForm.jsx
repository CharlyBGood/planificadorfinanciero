import { useState } from "react";
import { useGlobalState } from "../../contexts/GlobalState";

export function TransactionForm() {
  const { addTransaction } = useGlobalState();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [isIncome, setIsIncome] = useState(false);
  const [isExpense, setIsExpense] = useState(false);


  const onSubmit = (e) => {
    e.preventDefault();

    let finalAmount = +amount;
    if (isExpense) {
      finalAmount = -Math.abs(finalAmount);
    } else if (isIncome) {
      finalAmount = Math.abs(finalAmount);
    }

    addTransaction({
      id: window.crypto.randomUUID(),
      description,
      amount: finalAmount,
    });

    setDescription("");
    setAmount(0);
    setIsIncome(false);
    setIsExpense(false);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          id="description"
          type="text"
          placeholder="Añade una Descripción"
          onChange={(e) => setDescription(e.target.value)}
          className="bg-zinc-600 text-white px-3 py-2 rounded-lg block mb-2 w-full"
          value={description}
        />

        <div className="w-full flex justify-evenly">
          <div>
            <span className="m-2">Ingreso</span>
            <input
              type="checkbox"
              name="ingreso"
              id="Ingreso"
              checked={isIncome}
              onChange={(e) => {
                setIsIncome(e.target.checked);
                if (e.target.checked) setIsExpense(false);
              }}
            />
          </div>
          <div>
            <span className="m-2">Egreso</span>
            <input
              type="checkbox"
              name="egreso"
              id="Egreso"
              checked={isExpense}
              onChange={(e) => {
                setIsExpense(e.target.checked);
                if (e.target.checked) setIsIncome(false);
              }}
            />
          </div>
        </div>

        <input
          id="amount"
          className="bg-zinc-600 text-white px-3 py-2 rounded-lg block mb-2 w-full"
          type="number"
          step="0.01"
          placeholder="0.00"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
        />
        <button
          className="bg-indigo-700 text-white px-3 py-2 rounded-lg block mb-2 w-full"
          disabled={!description || !amount || (!isIncome && !isExpense)}
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
