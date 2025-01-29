import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { Login } from "./components/auth/Login";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { Header } from "./components/layout/Header";
import { TaskView } from "./components/tasks/TaskView";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <TaskView />
                </>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
