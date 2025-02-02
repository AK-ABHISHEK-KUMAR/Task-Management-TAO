import { u as useAuthStore, a as auth } from "./assets/authStore-Cmpea110.js";
import { jsxs, jsx } from "react/jsx-runtime";
import ReactDOM from "react-dom/client";
import { useNavigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
import { FirebaseError } from "@firebase/util";
import "@firebase/app";
import "@firebase/storage";
import "firebase/firestore";
import "zustand";
const Login = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const handleGoogleSignIn = async () => {
    var _a;
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });
      console.log("Initiating Google Sign In...");
      const result = await signInWithPopup(auth, provider);
      console.log("Sign in successful:", result.user.email);
      console.log("Authenticated User UID:", result.user.uid);
      setUser(result.user);
      navigate("/");
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Detailed sign-in error:", {
          code: error.code,
          message: error.message,
          credential: (_a = error.customData) == null ? void 0 : _a.credential
        });
        if (error.code === "auth/popup-blocked") {
          alert("Please enable popups for this website to sign in with Google");
        } else if (error.code === "auth/cancelled-popup-request") {
          console.log("Sign-in cancelled by user");
        } else {
          alert("Error signing in. Please try again.");
        }
      } else {
        console.error("Unknown error:", error);
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsx("div", { className: "w-1/2 flex items-center justify-center bg-white p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center mb-8", children: /* @__PURE__ */ jsxs("div", { className: "text-4xl font-bold text-purple-600 flex items-center", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 mr-2", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H5v-2h6v2zm8-4H5v-2h14v2zm0-4H5V7h14v2z" }) }),
          "TaskBuddy"
        ] }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl text-gray-600 mb-8", children: "Streamline your workflow and track progress effortlessly with our all-in-one task management app." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleGoogleSignIn,
          className: "w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                className: "w-6 h-6 mr-2",
                src: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
                alt: "Google logo"
              }
            ),
            "Continue with Google"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "w-1/2 bg-gray-50 p-8 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl w-full bg-white rounded-lg shadow-lg p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: "TaskBuddy" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-purple-100 p-3 rounded-md", children: /* @__PURE__ */ jsx("div", { className: "font-medium text-purple-800", children: "Todo (3)" }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-blue-100 p-3 rounded-md", children: /* @__PURE__ */ jsx("div", { className: "font-medium text-blue-800", children: "In Progress (3)" }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-green-100 p-3 rounded-md", children: /* @__PURE__ */ jsx("div", { className: "font-medium text-green-800", children: "Completed (3)" }) })
      ] })
    ] }) })
  ] });
};
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsx(BrowserRouter, { children: /* @__PURE__ */ jsx(Routes, { children: /* @__PURE__ */ jsx(Route, { path: "/login", element: /* @__PURE__ */ jsx(Login, {}) }) }) })
);
