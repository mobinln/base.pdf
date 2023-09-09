import PDF from "./logic/pdf";
import { longText } from "./mock/text";

import "./styles/global.css";

function App() {
  const handleDownload = async () => {
    const pdf = new PDF({ cursor: { x: 10, y: 10 } });

    pdf.add_text(longText, { fontSize: 20 });

    pdf.generate();
  };

  return (
    <>
      <button onClick={() => handleDownload()}>download</button>
    </>
  );
}

export default App;
