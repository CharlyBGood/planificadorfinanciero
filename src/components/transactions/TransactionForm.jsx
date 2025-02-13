import { useState } from "react";
import { useGlobalState } from "../../contexts/GlobalState";

export function TransactionForm() {
  const { addTransaction } = useGlobalState();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);

  const onSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      id: window.crypto.randomUUID(),
      description,
      amount: +amount,
    });

    setDescription("");
    setAmount(0);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Añade una Descripción"
          onChange={(e) => setDescription(e.target.value)}
          className="bg-zinc-600 text-white px-3 py-2 rounded-lg block mb-2 w-full"
          value={description}
        />

        {/* <div className="w-full flex justify-evenly">
          <div>
            <span className="m-2">Ingreso</span>
            <input type="checkbox" name="ingreso" id="Ingreso" />
          </div>
          <div>
            <span className="m-2">Egreso</span>
            <input type="checkbox" name="egreso" id="Egreso" />
          </div>
        </div> */}

        <input
          className="bg-zinc-600 text-white px-3 py-2 rounded-lg block mb-2 w-full"
          type="number"
          step="0.01"
          placeholder="0.00"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
        />
        <button
          className="bg-indigo-700 text-white px-3 py-2 rounded-lg block mb-2 w-full"
          disabled={!description || !amount}
        >
          Agregar
        </button>
      </form>
    </div>
  );
}
