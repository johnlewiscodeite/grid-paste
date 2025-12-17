import { useEffect, useState } from 'react'
import './App.css'

const rows = 10;

const columnNames = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf"
]

function App() {
  const { data, setData, setCells } = useGridState({ rows, columns: columnNames.length });
  const [changes, setChanges] = useState<SetCellAction[]>([]);
  const { handlePaste } = usePasteController((changes) => {
    setChanges(changes);
    setCells(changes);
  });

  const { selectedCell, setSelectedCell, handleKeyDown } = useGridKeyboardNavController();

  useEffect(() => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      const input = document.querySelector(`input[data-grid-index="${row}-${col}"]`) as HTMLInputElement;
      input?.focus();
    }
  }, [selectedCell]);

  return (
    <>
      <table>
        <thead>
          <tr>
            {columnNames.map((name) => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {columnNames.map((_, colIndex) => (
                <td key={colIndex}>
                  <input type="text" style={{width: "60px"}} value={data[rowIndex][colIndex]} onChange={(e) => {
                    const newData = [...data];
                    newData[rowIndex][colIndex] = e.target.value;
                    setData(newData);
                  }}
                  onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                  data-grid-index={`${rowIndex}-${colIndex}`}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <pre>
        {JSON.stringify(changes, null, 2)}
      </pre>
      <pre>
        {data.map(row => row.map(x => `"${x}"`).join(", ")).join("\n")}
      </pre>
    </>
  )
}

interface SetCellAction {
  row: number;
  col: number;
  value: string;
}

function useGridState({rows, columns}:{rows: number, columns: number}) {
  const [data, setData] = useState<string[][]>(Array.from({ length: rows }, () => Array(columns).fill("")));

  function setCells(actions: SetCellAction[]) {
    const newData = [...data];
    actions.forEach(({ row, col, value }) => {
      if (newData[row] && newData[row][col] !== undefined) {
        newData[row][col] = value;
      }
    });
    setData(newData);
  }


  return { data, setData, setCells };
}

function usePasteController(onPaste: (changes: SetCellAction[]) => void) {

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    event.preventDefault();
    const clipboardData = event.clipboardData.getData("text");
    const pastedData = clipboardData.split("\n").map(row => row.split("\t"));
    const changes: SetCellAction[] = [];

    pastedData.forEach((row, i) => {
      row.forEach((cell, j) => {
        changes.push({ row: rowIndex + i, col: colIndex + j, value: cell });
      });
    });

    onPaste(changes);
  };

  return { handlePaste };
}

function useGridKeyboardNavController() {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedCell) return;

    const { key } = event;
    let { row, col } = selectedCell;

    switch (key) {
      case "ArrowUp":
        row = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        row = Math.min(rows - 1, row + 1);
        break;
      case "ArrowLeft":
        col = Math.max(0, col - 1);
        break;
      case "ArrowRight":
        col = Math.min(columnNames.length - 1, col + 1);
        break;
      default:
        return;
    }

    setSelectedCell({ row, col });
  };

  return { selectedCell, setSelectedCell, handleKeyDown };
}

export default App
