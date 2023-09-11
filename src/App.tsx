import { useRef } from "react";
import PDF from "./logic/pdf";
import { shortText } from "./mock/text";

import "./styles/global.css";

function App() {
  const tableRef = useRef<HTMLTableElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = async () => {
    if (tableRef.current && listRef.current) {
      const pdf = new PDF({ cursor: { x: 10, y: 10 } });

      pdf.add_text(shortText, { fontSize: 20 });
      pdf.add_image("https://fakeimg.pl/300/", "image/png", 100, 100);
      pdf.add_table({
        html: tableRef.current,
        marginTop: 10,
      });
      await pdf.add_list(listRef.current.children);

      pdf.generate();
    }
  };

  return (
    <>
      <button onClick={() => handleDownload()}>download</button>
      <table ref={tableRef}>
        <thead>
          <tr>
            <th>Col 1</th>
            <th>Col 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data 1</td>
            <td>Data 2</td>
          </tr>
          <tr>
            <td>Data 1</td>
            <td>Data 2</td>
          </tr>
          <tr>
            <td>Data 1</td>
            <td>Data 2</td>
          </tr>
        </tbody>
      </table>
      <div ref={listRef} style={{ marginTop: 8 }}>
        {[...Array(20).keys()].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, width: "20cm" }}>
            <img src="https://fakeimg.pl/80/" alt="fake" width="80" height="80" />
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias vitae optio molestiae, ratione, ipsam
              omnis odit sequi dolore nemo aliquid deserunt culpa debitis. Quos aliquid alias quae, iusto ea omnis!
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
