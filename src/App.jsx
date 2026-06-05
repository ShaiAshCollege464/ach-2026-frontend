import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./Login.jsx";
import Dashboard, {BACKEND_URL} from "./Dashboard.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import TeamDetails from "./TeamDetails.jsx";
import GetQrPage from "./GetQrPage.jsx";

function App() {
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
        axios.defaults.withCredentials = true;
        axios.get(BACKEND_URL + "/me").then((response) => {
            setSignedIn(response.data.success)
        })
    }, []);

    const handleLogout = () => {
        // מחיקת העוגייה (כפי שהמרצה הגדיר)
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // עדכון הסטייט המרכזי (במקום רענון קשיח של הדף)
        setSignedIn(false);
    };

    return (
        <div className="app-container">
            <BrowserRouter>
                {
                    signedIn && (
                        <button
                            className="secondary-button"
                            onClick={handleLogout}
                            style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }}
                        >
                            Logout
                        </button>
                    )
                }
                <Routes>
                    {
                        signedIn ?
                            <Route path="/" element={<Dashboard/>}/>
                            :
                            <Route path="/" element={<Login onLoginSuccess={() => setSignedIn(true)}/>}/>
                    }
                    <Route path={"team/:id"} element={<TeamDetails/>}/>
                    <Route path={"temp"} element={<GetQrPage/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;