import { useState } from "react";
import { useGlobalState } from "../../contexts/GlobalState";

export function TransactionForm() {
  const { addTransaction } = useGlobalState();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isIncome, setIsIncome] = useState(false);
  const [isExpense, setIsExpense] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();

    let finalAmount = parseFloat(amount);
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
    setAmount(""); 
    setIsIncome(false);
    setIsExpense(false);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="w-full flex justify-evenly">
          <label>Ingreso</label>
          <input
            type="checkbox"
            name="ingreso"
            className="cursor-pointer"
            id="Ingreso"
            checked={isIncome}
            onChange={(e) => {
              setIsIncome(e.target.checked);
              if (e.target.checked) setIsExpense(false);
            }}
          />
          <label>Egreso</label>
          <input
            type="checkbox"
            className="cursor-pointer"
            name="egreso"
            id="Egreso"
            checked={isExpense}
            onChange={(e) => {
              setIsExpense(e.target.checked);
              if (e.target.checked) setIsIncome(false);
            }}
          />
        </div>        
        <input
          id="amount"
          className="bg-zinc-600 text-white px-3 py-2 rounded-lg block mb-2 mt-2 w-full"
          type="number"
          step="0.01"
          placeholder="Monto: ej: 0.00"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
        />
        <input
          id="description"
          type="text"
          placeholder="Descripción"
          onChange={(e) => setDescription(e.target.value)}
          className="bg-zinc-600 text-white px-3 py-2 rounded-lg block mb-2 mt-2 w-full"
          value={description}
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