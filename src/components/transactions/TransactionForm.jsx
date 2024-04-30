import { useState } from "react";
import { useGlobalState } from "../../contexts/GlobalState";

function TransactionForm() {
  const { addTransaction } = useGlobalState();
  const [description, setDescription] = useState();
  const [amount, setAmount] = useState(0);

  const onSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      id: window.crypto.randomUUID(),
      description,
      amount: +amount,
    });
    setAmount(0);
    setDescription("");
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Enter a Description"
          onChange={(e) => setDescription(e.target.value)}
          className="bg-zinc-600 text-white px-3 py-2 rounded-lg block mb-2 w-full"
          value={description}
        />

        <div className="w-full flex justify-evenly">
          <div>
            <span className="m-2">ingreso</span>
            <input type="checkbox" name="ingreso" id="Ingreso" />
          </div>
          <div>
            <span className="m-2">egreso</span>
            <input type="checkbox" name="egreso" id="Egreso" />
          </div>
        </div>

        <input
          type="number"
          step="0.01"
          placeholder="00.00"
          onChange={(e) => setAmount(e.target.value)}
          className="bg-zinc-600 text-white px-3 py-2 rounded-lg block mb-2 w-full"
          value={amount}
        />
        <button className="bg-indigo-700 text-white px-3 py-2 rounded-lg block mb-2 w-full">
          Agregar
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
