import "./App.css";
import {Routes,Route} from "react-router-dom"

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
      APP
    </div>

  );
}

export default App;
