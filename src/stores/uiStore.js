import { create } from 'zustand'

export const useUiStore = create((set) => ({
  collapsedCategories: [],
  sidebarLeft: true,
  sidebarRight: true,

  toggleCategory: (categoryId) => set(state => ({
    collapsedCategories: state.collapsedCategories.includes(categoryId)
      ? state.collapsedCategories.filter(id => id !== categoryId)
      : [...state.collapsedCategories, categoryId]
  })),

  setSidebar: (side, value) => set(state => ({
    [`sidebar${side.charAt(0).toUpperCase() + side.slice(1)}`]: value
  })),

  isCategoryCollapsed: (categoryId) => {
    // This is a getter, called from components using get()
    return false // components will use the state directly
  },
}))
