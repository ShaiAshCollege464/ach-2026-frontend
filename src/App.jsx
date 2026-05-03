import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx"; // הרכיב שיכיל את כל טבלת העובדים

function App() {
    return (
        <div className="app-container">
            <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/Login" element={<Login />} />

            </Routes>
                </BrowserRouter>
        </div>
    );
}

export default App;