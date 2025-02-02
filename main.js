import { u as useAuthStore, d as db, a as auth } from "./assets/authStore-Cmpea110.js";
import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, memo, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { signOut, onAuthStateChanged } from "@firebase/auth";
import { create } from "zustand";
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { FaSearch, FaTimes } from "react-icons/fa";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "@firebase/app";
import "@firebase/storage";
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/login" });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
};
const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filter: "all",
  viewMode: "list",
  searchQuery: "",
  unsubscribe: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query2) => set({ searchQuery: query2 }),
  fetchTasks: async (userId) => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ loading: true, error: null });
    console.log("Fetching tasks for user ID:", userId);
    try {
      const tasksRef = collection(db, "tasks");
      const q = query(
        tasksRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(100)
        // Limit initial load to 100 tasks
      );
      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const tasks = snapshot.docs.map((doc2) => ({
            id: doc2.id,
            ...doc2.data()
          }));
          set({ tasks, loading: false });
        },
        (error) => {
          console.error("Error fetching tasks:", error);
          set({
            error: `Failed to fetch tasks: ${error instanceof Error ? error.message : String(error)}`,
            loading: false
          });
        }
      );
      set({ unsubscribe: unsubscribeSnapshot });
    } catch (error) {
      console.error("Error setting up task listener:", error);
      set({
        error: `Failed to set up task listener: ${error instanceof Error ? error.message : String(error)}`,
        loading: false
      });
    }
  },
  addTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const tasksRef = collection(db, "tasks");
      const newTask = {
        ...taskData,
        createdAt: now,
        updatedAt: now,
        activities: []
      };
      await addDoc(tasksRef, newTask);
      set({ loading: false });
    } catch (error) {
      console.error("Error adding task:", error);
      set({
        error: `Failed to add task: ${error instanceof Error ? error.message : String(error)}`,
        loading: false
      });
    }
  },
  updateTask: async (taskId, updates) => {
    set({ loading: true, error: null });
    try {
      const taskRef = doc(db, "tasks", taskId);
      const updatedTask = {
        ...updates,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await updateDoc(taskRef, updatedTask);
      set({ loading: false });
    } catch (error) {
      console.error("Error updating task:", error);
      set({
        error: `Failed to update task: ${error instanceof Error ? error.message : String(error)}`,
        loading: false
      });
    }
  },
  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const taskRef = doc(db, "tasks", taskId);
      await deleteDoc(taskRef);
      set({ loading: false });
    } catch (error) {
      console.error("Error deleting task:", error);
      set({
        error: `Failed to delete task: ${error instanceof Error ? error.message : String(error)}`,
        loading: false
      });
    }
  },
  moveTask: async (taskId, newCategory) => {
    const { updateTask } = get();
    await updateTask(taskId, { category: newCategory });
  },
  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  }
}));
const Header = () => {
  const user = useAuthStore((state) => state.user);
  const { viewMode, setViewMode, searchQuery, setSearchQuery } = useTaskStore();
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return /* @__PURE__ */ jsx("header", { className: "bg-white shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "header-container", children: /* @__PURE__ */ jsxs("div", { className: "flex-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-purple-600", children: "TaskBuddy" }),
      /* @__PURE__ */ jsxs("div", { className: "header-nav", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setViewMode("list"),
            className: `px-3 py-2 rounded-md text-sm font-medium ${viewMode === "list" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:text-gray-900"}`,
            children: "List View"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setViewMode("board"),
            className: `px-3 py-2 rounded-md text-sm font-medium ${viewMode === "board" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:text-gray-900"}`,
            children: "Board View"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
      /* @__PURE__ */ jsx("div", { className: "search-container", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx(FaSearch, { className: "h-4 w-4 text-gray-400" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search tasks...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "search-input"
          }
        )
      ] }) }),
      user && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 sm:space-x-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm sm:text-base text-gray-700", children: user.email }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSignOut,
            className: "btn btn-secondary",
            children: "Sign Out"
          }
        )
      ] })
    ] })
  ] }) }) });
};
const BoardView = ({ tasks, onTaskMove, onTaskEdit, onTaskDelete }) => {
  const categories = ["Todo", "In-Progress", "Completed"];
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status).filter(
      (task) => {
        var _a;
        return searchQuery ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) || (((_a = task.description) == null ? void 0 : _a.toLowerCase()) || "").includes(searchQuery.toLowerCase()) : true;
      }
    );
  };
  return /* @__PURE__ */ jsx(DragDropContext, { onDragEnd: onTaskMove, children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: categories.map((category) => /* @__PURE__ */ jsx(Droppable, { droppableId: category, children: (provided, snapshot) => /* @__PURE__ */ jsxs(
    "div",
    {
      ref: provided.innerRef,
      ...provided.droppableProps,
      className: `bg-white rounded-lg shadow p-4 ${snapshot.isDraggingOver ? "bg-gray-50" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("h3", { className: `text-lg font-semibold mb-4 ${category === "Todo" ? "text-purple-600" : category === "In-Progress" ? "text-blue-600" : "text-green-600"}`, children: [
          category,
          " (",
          getTasksByStatus(category).length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          getTasksByStatus(category).map((task, index) => /* @__PURE__ */ jsx(
            Draggable,
            {
              draggableId: task.id,
              index,
              children: (provided2, snapshot2) => /* @__PURE__ */ jsx(
                "div",
                {
                  ref: provided2.innerRef,
                  ...provided2.draggableProps,
                  ...provided2.dragHandleProps,
                  className: `bg-white rounded-md shadow p-4 ${snapshot2.isDragging ? "shadow-lg" : ""}`,
                  children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
                      /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-900", children: task.title }),
                      /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => onTaskEdit(task.id),
                            className: "text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded",
                            children: "Edit"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            onClick: () => onTaskDelete(task.id),
                            className: "text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded",
                            children: "Delete"
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500", children: [
                      /* @__PURE__ */ jsxs("p", { children: [
                        "Due: ",
                        format(new Date(task.dueDate), "MMM dd, yyyy")
                      ] }),
                      /* @__PURE__ */ jsxs("p", { children: [
                        "Category: ",
                        task.category
                      ] })
                    ] })
                  ] })
                }
              )
            },
            task.id
          )),
          provided.placeholder
        ] })
      ]
    }
  ) }, category)) }) });
};
const TaskEditModal = ({ task, onSave, onClose }) => {
  var _a;
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState(task.description || "");
  const [attachment, setAttachment] = useState(null);
  useEffect(() => {
    try {
      const date = new Date(task.dueDate);
      setDueDate(format(date, "yyyy-MM-dd"));
    } catch (error) {
      console.error("Error parsing date:", error);
      setDueDate("");
    }
  }, [task.dueDate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(task.id, {
      title,
      category,
      status,
      description,
      dueDate: format(new Date(dueDate), "dd MMM, yyyy"),
      attachments: attachment ? [attachment.name] : void 0
    });
    onClose();
  };
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg w-full max-w-3xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-4 border-b", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "View/Edit Task" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700", children: /* @__PURE__ */ jsx(FaTimes, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Task Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: title,
              onChange: (e) => setTitle(e.target.value),
              className: "w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }),
          /* @__PURE__ */ jsxs("div", { className: "border rounded-md", children: [
            /* @__PURE__ */ jsxs("div", { className: "border-b p-2 flex gap-2", children: [
              /* @__PURE__ */ jsx("button", { type: "button", className: "p-1 hover:bg-gray-100 rounded", children: "B" }),
              /* @__PURE__ */ jsx("button", { type: "button", className: "p-1 hover:bg-gray-100 rounded italic", children: "I" }),
              /* @__PURE__ */ jsx("button", { type: "button", className: "p-1 hover:bg-gray-100 rounded", children: "S" }),
              /* @__PURE__ */ jsx("button", { type: "button", className: "p-1 hover:bg-gray-100 rounded", children: "•" }),
              /* @__PURE__ */ jsx("button", { type: "button", className: "p-1 hover:bg-gray-100 rounded", children: "1." })
            ] }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: description,
                onChange: (e) => {
                  if (e.target.value.length <= 300) {
                    setDescription(e.target.value);
                  }
                },
                maxLength: 300,
                className: "w-full px-3 py-2 focus:ring-purple-500 focus:border-purple-500 border-none",
                rows: 4,
                placeholder: "Enter task description"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "p-2 text-sm text-gray-500 text-right", children: [
              description.length,
              "/300 characters"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Task Category" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setCategory("Work"),
                  className: `flex-1 py-2 px-4 rounded ${category === "Work" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`,
                  children: "Work"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setCategory("Personal"),
                  className: `flex-1 py-2 px-4 rounded ${category === "Personal" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`,
                  children: "Personal"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Due Date" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: dueDate,
                onChange: (e) => setDueDate(e.target.value),
                className: "w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Task Status" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: status,
                onChange: (e) => setStatus(e.target.value),
                className: "w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500",
                required: true,
                children: [
                  /* @__PURE__ */ jsx("option", { value: "Todo", children: "Todo" }),
                  /* @__PURE__ */ jsx("option", { value: "In-Progress", children: "In Progress" }),
                  /* @__PURE__ */ jsx("option", { value: "Completed", children: "Completed" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Attachment" }),
          /* @__PURE__ */ jsxs("div", { className: "border-2 border-dashed rounded-md p-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                onChange: handleFileUpload,
                className: "w-full"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Drop your files here to Upload" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Activity" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: (_a = task.activities) == null ? void 0 : _a.map((activity, index) => /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
            activity.action,
            " - ",
            format(new Date(activity.timestamp), "MMM dd, yyyy HH:mm")
          ] }, index)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 mt-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700",
            children: "Update"
          }
        )
      ] })
    ] })
  ] }) });
};
const TaskTable = memo(({
  tasks,
  onEdit,
  onDelete,
  selectedTasks,
  onTaskSelect,
  onSelectAll,
  sectionType
}) => {
  const allSelected = tasks.length > 0 && tasks.every((task) => selectedTasks.has(task.id));
  const getSectionColor = (type) => {
    switch (type) {
      case "Todo":
        return "bg-blue-50";
      case "In-Progress":
        return "bg-yellow-50";
      case "Completed":
        return "bg-green-50";
      default:
        return "bg-white";
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "bg-green-100";
      case "Medium":
        return "bg-yellow-100";
      case "High":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "task-table-container", children: /* @__PURE__ */ jsx("div", { className: "min-w-full inline-block align-middle", children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
    /* @__PURE__ */ jsx("thead", { className: `${getSectionColor(sectionType)}`, children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { scope: "col", className: "task-cell", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: allSelected,
          onChange: (e) => onSelectAll(e.target.checked),
          className: "rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        }
      ) }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "task-cell text-left font-medium text-gray-500", children: "Title" }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "task-cell text-left font-medium text-gray-500", children: "Priority" }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "task-cell text-left font-medium text-gray-500", children: "Due Date" }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "task-cell text-left font-medium text-gray-500", children: "Category" }),
      /* @__PURE__ */ jsx("th", { scope: "col", className: "task-cell text-right font-medium text-gray-500", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: tasks.map((task) => /* @__PURE__ */ jsxs("tr", { className: "task-row", children: [
      /* @__PURE__ */ jsx("td", { className: "task-cell", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: selectedTasks.has(task.id),
          onChange: (e) => onTaskSelect(task.id, e.target.checked),
          className: "rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        }
      ) }),
      /* @__PURE__ */ jsx("td", { className: "task-cell", children: /* @__PURE__ */ jsx("div", { className: "text-truncate max-w-xs", children: task.title }) }),
      /* @__PURE__ */ jsx("td", { className: "task-cell", children: /* @__PURE__ */ jsx("span", { className: `status-badge ${getPriorityColor(task.priority)}`, children: task.priority }) }),
      /* @__PURE__ */ jsx("td", { className: "task-cell text-gray-500", children: format(new Date(task.dueDate), "MMM d, yyyy") }),
      /* @__PURE__ */ jsx("td", { className: "task-cell", children: /* @__PURE__ */ jsx("span", { className: "status-badge bg-gray-100 text-gray-800", children: task.category }) }),
      /* @__PURE__ */ jsx("td", { className: "task-cell text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onEdit(task),
            className: "text-indigo-600 hover:text-indigo-900",
            children: "Edit"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onDelete(task.id),
            className: "text-red-600 hover:text-red-900",
            children: "Delete"
          }
        )
      ] }) })
    ] }, task.id)) })
  ] }) }) }) });
});
const TaskView = () => {
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    Todo: true,
    "In-Progress": true,
    Completed: true
  });
  const [editingTask, setEditingTask] = useState(null);
  const user = useAuthStore((state) => state.user);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
    category: "Work",
    status: "Todo",
    priority: "Medium",
    activities: [],
    createdBy: (user == null ? void 0 : user.uid) || "",
    userId: (user == null ? void 0 : user.uid) || "",
    // Make sure this is set correctly
    attachment: null
  });
  useEffect(() => {
    if (user) {
      console.log("Current user UID:", user.uid);
      setNewTask((prev) => ({
        ...prev,
        userId: user.uid,
        createdBy: user.uid
      }));
    }
  }, [user]);
  const {
    tasks,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    cleanup
  } = useTaskStore();
  const filteredTasks = tasks.filter(
    (task) => {
      var _a;
      return searchQuery ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) || (((_a = task.description) == null ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase())) ?? false) : true;
    }
  );
  useEffect(() => {
    if (user == null ? void 0 : user.uid) {
      fetchTasks(user.uid);
    }
    return () => cleanup();
  }, [user == null ? void 0 : user.uid, fetchTasks, cleanup]);
  const handleAddTask = useCallback(async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addTask({
        ...newTask,
        userId: user.uid,
        createdBy: user.uid
      });
      setShowAddTaskForm(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
        category: "Work",
        status: "Todo",
        priority: "Medium",
        activities: [],
        createdBy: user.uid,
        userId: user.uid,
        attachment: null
      });
    } catch (error2) {
      console.error("Error adding task:", error2);
    }
  }, [newTask, user, addTask]);
  const handleDelete = useCallback((taskId) => {
    deleteTask(taskId);
  }, [deleteTask]);
  const handleTaskMove = useCallback((result) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTask(task.id, {
        ...task,
        status: newStatus
      });
    }
  }, [tasks, updateTask]);
  const handleEditTask = (task) => {
    setEditingTask(task);
  };
  const handleSaveEdit = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      setEditingTask(null);
    } catch (error2) {
      console.error("Error updating task:", error2);
    }
  };
  const handleCloseEdit = () => {
    setEditingTask(null);
  };
  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  const [selectedTasks, setSelectedTasks] = useState(/* @__PURE__ */ new Set());
  const handleTaskSelect = (taskId, selected) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };
  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedTasks(new Set(filteredTasks.map((task) => task.id)));
    } else {
      setSelectedTasks(/* @__PURE__ */ new Set());
    }
  };
  const handleBulkDelete = async () => {
    const tasksToDelete = Array.from(selectedTasks);
    for (const taskId of tasksToDelete) {
      await handleDelete(taskId);
    }
    setSelectedTasks(/* @__PURE__ */ new Set());
  };
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "text-red-600 p-4", children: error });
  }
  const todoTasks = filteredTasks.filter((task) => task.status === "Todo");
  const inProgressTasks = filteredTasks.filter((task) => task.status === "In-Progress");
  const completedTasks = filteredTasks.filter((task) => task.status === "Completed");
  return /* @__PURE__ */ jsxs("div", { className: "max-w-full overflow-x-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4 p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowAddTaskForm(true),
            className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base",
            children: "Add Task"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setViewMode("list"),
              className: `px-3 py-1.5 rounded-lg text-sm sm:text-base ${viewMode === "list" ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:bg-gray-100"}`,
              children: "List View"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setViewMode("board"),
              className: `px-3 py-1.5 rounded-lg text-sm sm:text-base ${viewMode === "board" ? "bg-gray-200 text-gray-800" : "text-gray-600 hover:bg-gray-100"}`,
              children: "Board View"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full sm:w-auto", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Search tasks...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        }
      ) })
    ] }),
    showAddTaskForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleAddTask, className: "mt-4 bg-white p-4 rounded-lg shadow mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", children: "Task Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: newTask.title,
            onChange: (e) => setNewTask({ ...newTask, title: e.target.value }),
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: newTask.description,
            onChange: (e) => {
              if (e.target.value.length <= 300) {
                setNewTask({ ...newTask, description: e.target.value });
              }
            },
            maxLength: 300,
            rows: 4,
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            placeholder: "Enter task description (max 300 characters)"
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [
          newTask.description.length,
          "/300 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", children: "Due Date" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: newTask.dueDate,
            onChange: (e) => setNewTask({ ...newTask, dueDate: e.target.value }),
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", children: "Task Status" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: newTask.status,
            onChange: (e) => setNewTask({ ...newTask, status: e.target.value }),
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            required: true,
            children: [
              /* @__PURE__ */ jsx("option", { value: "Todo", children: "Todo" }),
              /* @__PURE__ */ jsx("option", { value: "In-Progress", children: "In Progress" }),
              /* @__PURE__ */ jsx("option", { value: "Completed", children: "Completed" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", children: "Task Category" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: newTask.category,
            onChange: (e) => setNewTask({ ...newTask, category: e.target.value }),
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
            required: true,
            children: [
              /* @__PURE__ */ jsx("option", { value: "Work", children: "Work" }),
              /* @__PURE__ */ jsx("option", { value: "Personal", children: "Personal" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-gray-700 text-sm font-bold mb-2", children: "Attachment" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            onChange: (e) => {
              var _a;
              return setNewTask({ ...newTask, attachment: ((_a = e.target.files) == null ? void 0 : _a[0]) || null });
            },
            className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowAddTaskForm(false),
            className: "mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
            children: "Add Task"
          }
        )
      ] })
    ] }),
    editingTask && /* @__PURE__ */ jsx(
      TaskEditModal,
      {
        task: editingTask,
        onSave: handleSaveEdit,
        onClose: handleCloseEdit
      }
    ),
    viewMode === "list" ? /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-2 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen", children: [
      selectedTasks.size > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-4 p-3 bg-white rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 border border-gray-200", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-gray-700 font-medium text-sm sm:text-base", children: [
          selectedTasks.size,
          " task",
          selectedTasks.size !== 1 ? "s" : "",
          " selected"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleBulkDelete,
            className: "w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm sm:text-base",
            children: [
              "Delete Selected (",
              selectedTasks.size,
              ")"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "p-4 flex justify-between items-center cursor-pointer bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-colors",
              onClick: () => toggleSection("Todo"),
              children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "Todo" }),
                expandedSections.Todo ? /* @__PURE__ */ jsx(ChevronUpIcon, { className: "h-5 w-5 text-gray-600" }) : /* @__PURE__ */ jsx(ChevronDownIcon, { className: "h-5 w-5 text-gray-600" })
              ]
            }
          ),
          expandedSections.Todo && /* @__PURE__ */ jsx("div", { className: "border-t border-gray-200", children: /* @__PURE__ */ jsx(
            TaskTable,
            {
              tasks: todoTasks,
              onEdit: handleEditTask,
              onDelete: handleDelete,
              selectedTasks,
              onTaskSelect: handleTaskSelect,
              onSelectAll: handleSelectAll,
              sectionType: "Todo"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "p-4 flex justify-between items-center cursor-pointer bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-150 transition-colors",
              onClick: () => toggleSection("In-Progress"),
              children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "In Progress" }),
                expandedSections["In-Progress"] ? /* @__PURE__ */ jsx(ChevronUpIcon, { className: "h-5 w-5 text-gray-600" }) : /* @__PURE__ */ jsx(ChevronDownIcon, { className: "h-5 w-5 text-gray-600" })
              ]
            }
          ),
          expandedSections["In-Progress"] && /* @__PURE__ */ jsx("div", { className: "border-t border-gray-200", children: /* @__PURE__ */ jsx(
            TaskTable,
            {
              tasks: inProgressTasks,
              onEdit: handleEditTask,
              onDelete: handleDelete,
              selectedTasks,
              onTaskSelect: handleTaskSelect,
              onSelectAll: handleSelectAll,
              sectionType: "In-Progress"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "p-4 flex justify-between items-center cursor-pointer bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-150 transition-colors",
              onClick: () => toggleSection("Completed"),
              children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "Completed" }),
                expandedSections.Completed ? /* @__PURE__ */ jsx(ChevronUpIcon, { className: "h-5 w-5 text-gray-600" }) : /* @__PURE__ */ jsx(ChevronDownIcon, { className: "h-5 w-5 text-gray-600" })
              ]
            }
          ),
          expandedSections.Completed && /* @__PURE__ */ jsx("div", { className: "border-t border-gray-200", children: /* @__PURE__ */ jsx(
            TaskTable,
            {
              tasks: completedTasks,
              onEdit: handleEditTask,
              onDelete: handleDelete,
              selectedTasks,
              onTaskSelect: handleTaskSelect,
              onSelectAll: handleSelectAll,
              sectionType: "Completed"
            }
          ) })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx(
      BoardView,
      {
        tasks: filteredTasks,
        onTaskMove: handleTaskMove,
        onTaskEdit: (taskId) => {
          const task = filteredTasks.find((t) => t.id === taskId);
          if (task) handleEditTask(task);
        },
        onTaskDelete: handleDelete
      }
    )
  ] });
};
function App() {
  const { setUser, setLoading } = useAuthStore();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);
  return /* @__PURE__ */ jsx(BrowserRouter, { children: /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50", children: /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/",
        element: /* @__PURE__ */ jsx(PrivateRoute, { children: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Header, {}),
          /* @__PURE__ */ jsx(TaskView, {})
        ] }) })
      }
    ),
    /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true }) })
  ] }) }) });
}
const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsx(React.StrictMode, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(App, {}) }) })
);
