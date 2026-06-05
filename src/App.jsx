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
        fetch(BACKEND_URL + "Logout", {
            method: "POST",
            credentials: "include", // Critical: ensures cookies are sent and Set-Cookie response is processed
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(() => {
                setSignedIn(false);
            })
            .catch((error) => {
                console.error("Logout failed:", error);
                setSignedIn(false); // Logout on client side even if request fails
            });
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