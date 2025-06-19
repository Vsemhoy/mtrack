import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Храним дерево и открытые документы по проектам
  projects: {
    // Пример:
    // 'p_1': {
    //   tree: [...], 
    //   tabbedNodes: { 't_123': {...} }, 
    //   activeDocument: { [sectionId]: 's_113', [taskId]: 't_123' }
    // }
  },
  loading: false,
  error: null
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Загрузка дерева проекта
    loadTree: (state, action) => {
      const { projectId, tree } = action.payload;
      if (!state.projects[projectId]) {
        state.projects[projectId] = {
          tree: [],
          tabbedNodes: {},
          activeDocument: {}
        };
      }
      state.projects[projectId].tree = tree;
    },

    // Добавление таба с задачей/секцией
    addTabbedNode: (state, action) => {
      const { projectId, node } = action.payload;
      if (!state.projects[projectId]) return;

      // Добавляем в tabbedNodes
      state.projects[projectId].tabbedNodes[node.key] = node;
    },

    // Удаление таба
    removeTabbedNode: (state, action) => {
      const { projectId, key } = action.payload;
      const tabbed = state.projects[projectId]?.tabbedNodes || {};
      delete tabbed[key];
      state.projects[projectId].tabbedNodes = { ...tabbed };
    },

    // Установка активного документа с привязкой к разделу (tree/kanban)
    setActiveDocument: (state, action) => {
      const { projectId, sectionId, taskId, tab } = action.payload;

      if (!state.projects[projectId]) return;

      // Устанавливаем активный документ по текущему разделу (tab)
      state.projects[projectId].activeDocument[tab] = {
        section: sectionId || null,
        task: taskId || null
      };
    },

    // Обновление конкретного узла дерева
    updateTreeNode: (state, action) => {
      const { projectId, key, changes } = action.payload;
      const project = state.projects[projectId];
      if (!project) return;

      // Рекурсивно обновляем узел в дереве
      const updateNode = (nodes) => {
        return nodes.map(node => {
          if (node.key === key) {
            return { ...node, ...changes };
          }
          if (node.ch) {
            return { ...node, ch: updateNode(node.ch) };
          }
          return node;
        });
      };

      project.tree = updateNode(project.tree);
    },

    // Установка дочерних узлов для конкретного узла
    setNodeChildren: (state, action) => {
      const { projectId, key, children } = action.payload;
      const project = state.projects[projectId];
      if (!project) return;

      const findAndSetChildren = (nodes) => {
        return nodes.map(node => {
          if (node.key === key) {
            return { ...node, ch: children };
          }
          if (node.ch) {
            return { ...node, ch: findAndSetChildren(node.ch) };
          }
          return node;
        });
      };

      project.tree = findAndSetChildren(project.tree);
    },

    // Очистка данных проекта (например, при смене проекта)
    clearProjectData: (state, action) => {
      const projectId = action.payload;
      if (state.projects[projectId]) {
        state.projects[projectId] = {
          tree: [],
          tabbedNodes: {},
          activeDocument: {}
        };
      }
    }
  }
});

export const {
  loadTree,
  addTabbedNode,
  removeTabbedNode,
  setActiveDocument,
  updateTreeNode,
  setNodeChildren,
  clearProjectData
} = taskSlice.actions;

export default taskSlice.reducer;