import * as actionTypes from "../actions/actionTypes";
import React from "react";
import { topicToField, fieldsIntToString } from "../../util/utility";
import {
  processProjectsData,
  processClusterData,
  processCategories,
  processCollections,
  processInfrastructures,
  processFormats
} from "./data-transforms";
import FilterPanel from "../../components/FilterPanel/filter-panel";

export const initialState = {
  filters: {
    forschungsgebiet: {
      name: "Forschungsgebiet",
      filterKey: "forschungsbereichstr",
      type: "string",
      uniqueVals: [],
      value: []
    },
    hauptthema: {
      name: "Hauptthema",
      filterKey: "hauptthema",
      type: "string",
      uniqueVals: [],
      value: []
    },
    geldgeber: {
      name: "Geldgeber",
      filterKey: "geldgeber",
      type: "string",
      uniqueVals: [],
      value: []
    },
    time: {
      name: "Zeitraum",
      filterKey: "timeframe",
      type: "timeframe",
      uniqueVals: [],
      value: []
    },
    collections: {
      name: "Sammlungen",
      filterKey: "collections",
      type: "array",
      uniqueVals: [],
      value: []
    },
    infrastructures: {
      name: "Laborgeräte",
      filterKey: "infrastructure",
      type: "array",
      uniqueVals: [],
      value: []
    },
    targetgroups: {
      name: "Zielgruppen",
      filterKey: "targetgroups",
      type: "array",
      uniqueVals: [],
      value: []
    },
    formats: {
      name: "Formate",
      filterKey: "formats",
      type: "array",
      uniqueVals: [],
      value: []
    }
  },
  graph: "0",
  projects: [],
  filteredProjects: [],
  filteredCategories: [],
  filteredCollections: [],
  filteredInfrastructures: [],
  institutions: [],
  ktas: [],
  ktaMapping: [],
  categories: [],
  infrastructures: [],
  collections: [],
  clusterData: undefined,
  selectedProject: null,
  selectedInfra: null,
  selectedCat: null,
  selectedKta: null,
  isDataLoaded: {
    projects: false,
    institutions: false,
    cluster: false,
    ktas: false,
    targetgroups: false,
    ktaMapping: false,
    collections: false,
    infrastructures: false
  },
  isDataProcessed: false,
  sideBarComponent: <FilterPanel />
};

// Keep the reducer switch lean by outsourcing the actual code below
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.CHANGE_GRAPH:
      return {
        ...state,
        graph: action.value,
        filteredProjects: applyFilters(state.projects, state.filters)
      };

    case actionTypes.CHECKBOX_FILTER_CHANGE:
      return changeCheckboxFilter(state, action);

    case actionTypes.TIMERANGE_FILTER_CHANGE:
      return changeTimeRangeFilter(state, action);

    case actionTypes.DEACTIVATE_POPOVER:
      return deactivatePopover(state);

    case actionTypes.UPDATE_CLUSTER_DATA:
      return updateClusterData(state, action);

    case actionTypes.UPDATE_INSTITUTIONS_DATA:
      return updateInstitutionsData(state, action);

    case actionTypes.UPDATE_PROJECTS_DATA:
      return updateProjectsData(state, action);

    case actionTypes.UPDATE_KTA_DATA:
      return updateKtaData(state, action);

    case actionTypes.UPDATE_TARGETGROUPS_DATA:
      return updateTargetGroupsData(state, action);

    case actionTypes.UPDATE_COLLECTIONS_DATA:
      return updateCollectionsData(state, action);

    case actionTypes.UPDATE_INFRASTRUCTURE_DATA:
      return updateInfrastructureData(state, action);

    case actionTypes.UPDATE_KTA_MAPPING_DATA:
      return updateKtaMappingData(state, action);

    case actionTypes.PROCESS_DATA_IF_READY:
      return processDataWhenReady(state);

    case actionTypes.SET_SIDE_BAR_COMPONENT:
      return setSideBarComponent(state, action);

    case actionTypes.SET_SELECTED_PROJECT:
      return setSelectedProject(state, action);

    case actionTypes.RESET_SELECTED_PROJECT:
      return resetSelectedProject(state);

    case actionTypes.SET_SELECTED_CAT:
      return setSelectedCat(state, action);

    case actionTypes.SET_SELECTED_INFRA:
      return setSelectedInfra(state, action);

    case actionTypes.SET_SELECTED_KTA:
      return setSelectedKta(state, action);

    case actionTypes.DESELECT_ITEMS:
      return deselectItems(state);

    default:
      return state;
  }
};

export const isAllDataLoaded = state =>
  Object.values(state.isDataLoaded).every(loaded => loaded);

const processDataWhenReady = state =>
  isAllDataLoaded(state) ? processAllData(state) : state;

const processAllData = state => {
  const newState = {
    projects: processProjectsData(state),
    ktas: processFormats(state),
    categories: processCategories(state),
    infrastructures: processInfrastructures(state),
    collections: processCollections(state),
    clusterData: processClusterData(state)
  };

  const uniqueFields = [];
  const uniqueTopics = [];
  const uniqueSponsors = [];
  const uniqueInfrastructures = [];
  const uniqueCollections = [];
  const maxDateRange = [5000, 0];

  Object.values(newState.projects).forEach(project => {
    Object.keys(project).forEach(property => {
      const value = project[property];
      if (property === "forschungsbereichstr") {
        if (!uniqueFields.some(e => e === value)) uniqueFields.push(value);
      } else if (property === "hauptthema") {
        if (!uniqueTopics.some(e => e === value)) uniqueTopics.push(value);
      } else if (property === "geldgeber") {
        if (!uniqueSponsors.some(e => e === value)) uniqueSponsors.push(value);
      } else if (property === "timeframe") {
        maxDateRange[0] =
          maxDateRange[0] < value[0] ? maxDateRange[0] : value[0];
        maxDateRange[1] =
          maxDateRange[1] > value[1] ? maxDateRange[1] : value[1];
      } else if (property === "collections") {
        for (const sammlung of Object.values(value))
          if (!uniqueCollections.some(e => e === sammlung))
            uniqueCollections.push(sammlung);
      } else if (property === "infrastructures") {
        for (const infrastruktur of Object.values(value))
          if (!uniqueInfrastructures.some(e => e === infrastruktur))
            uniqueInfrastructures.push(infrastruktur);
      }
    });
  });

  const newFilters = {
    forschungsgebiet: {
      ...state.filters.forschungsgebiet,
      uniqueVals: uniqueFields.sort(compare),
      value:
        state.filters.forschungsgebiet.value.length > 0
          ? state.filters.forschungsgebiet.value
          : uniqueFields
    },
    hauptthema: {
      ...state.filters.hauptthema,
      uniqueVals: uniqueTopics.sort(compare),
      value:
        state.filters.hauptthema.value.length > 0
          ? state.filters.hauptthema.value
          : uniqueTopics
    },
    geldgeber: {
      ...state.filters.geldgeber,
      uniqueVals: uniqueSponsors.sort(compare),
      value:
        state.filters.geldgeber.value.length > 0
          ? state.filters.geldgeber.value
          : uniqueSponsors
    },
    time: {
      ...state.filters.time,
      uniqueVals: maxDateRange,
      value:
        state.filters.time.value.length > 0
          ? state.filters.time.value
          : maxDateRange
    },
    collections: {
      ...state.filters.collections,
      uniqueVals: uniqueCollections.sort((a, b) => a.localeCompare(b)),
      value:
        state.filters.collections.value.length > 0
          ? state.filters.collections.value
          : uniqueCollections
    },
    formats: {
      ...state.filters.formats,
      uniqueVals: [
        ...new Set(newState.ktas.map(kta => kta.format).filter(f => f != null))
      ],
      value:
        state.filters.formats.value.length > 0
          ? state.filters.formats.value
          : [
              ...new Set(
                newState.ktas.map(kta => kta.format).filter(f => f != null)
              )
            ]
    },
    infrastructures: {
      ...state.filters.infrastructures,
      uniqueVals: uniqueInfrastructures.sort((a, b) => a.localeCompare(b)),
      value:
        state.filters.infrastructures.value.length > 0
          ? state.filters.infrastructures.value
          : uniqueInfrastructures
    },
    targetgroups: {
      ...state.filters.targetgroups,
      uniqueVals: newState.categories.map(t => t.title),
      value:
        state.filters.targetgroups.value.length > 0
          ? state.filters.targetgroups.value
          : newState.categories.map(t => t.title)
    }
  };

  return {
    ...state,
    ...newState,
    filters: newFilters,
    filteredProjects: applyFilters(newState.projects, newFilters),
    filteredCategories: applyCategoryFilters(newState.categories, newFilters),
    filteredCollections: applyInfraFilters(
      newState.collections,
      newFilters.collections
    ),
    filteredInfrastructures: applyInfraFilters(
      newState.infrastructures,
      newFilters.infrastructures
    ),
    isDataProcessed: true
  };
};

const applyFilters = (data, filter) => {
  let filteredData = data;
  Object.values(filter).forEach(f => {
    let newFilteredData = {};
    filteredData = Object.keys(filteredData).forEach(d => {
      if (f.type === "string") {
        if (f.value.some(value => value === filteredData[d][f.filterKey]))
          newFilteredData[d] = filteredData[d];
      } else if (f.type === "timeframe") {
        if (
          f.value[0] <= filteredData[d][f.filterKey][0] &&
          f.value[1] >= filteredData[d][f.filterKey][1]
        ) {
          newFilteredData[d] = filteredData[d];
        }
      } else if (f.type === "array") {
        if (
          !filteredData[d][f.filterKey] ||
          filteredData[d][f.filterKey].length === 0
        ) {
          newFilteredData[d] = filteredData[d];
        } else {
          for (const entry of filteredData[d][f.filterKey]) {
            if (f.value.some(value => value === entry))
              newFilteredData[d] = filteredData[d];
          }
        }
      } else {
        if (filteredData[d][f.filterKey].includes(f.value))
          newFilteredData[d] = filteredData[d];
      }
    });
    filteredData = newFilteredData;
  });
  return Object.values(filteredData);
};

const applyCategoryFilters = (categories, filter) => {
  let newCategories = categories;
  return newCategories.filter(cat =>
    filter.targetgroups.value.includes(cat.title)
  );
};

const applyInfraFilters = (infras, filter) => {
  let newInfras = infras;
  return newInfras.filter(infra => filter.value.includes(infra.name));
};

const compare = (a, b) => {
  if (topicToField(a) < topicToField(b)) return -1;
  else return 1;
};

const updateClusterData = (state, action) => ({
  ...state,
  clusterData: action.value,
  isDataLoaded: {
    ...state.isDataLoaded,
    cluster: true
  }
});

const updateInstitutionsData = (state, action) => ({
  ...state,
  institutions: action.value,
  isDataLoaded: {
    ...state.isDataLoaded,
    institutions: true
  }
});

const updateKtaData = (state, action) => ({
  ...state,
  ktas: action.value,
  isDataLoaded: {
    ...state.isDataLoaded,
    ktas: true
  }
});

const updateTargetGroupsData = (state, action) => ({
  ...state,
  categories: action.value,
  isDataLoaded: {
    ...state.isDataLoaded,
    targetgroups: true
  }
});

const updateCollectionsData = (state, action) => ({
  ...state,
  collections: action.value,
  isDataLoaded: {
    ...state.isDataLoaded,
    collections: true
  }
});

const updateInfrastructureData = (state, action) => ({
  ...state,
  infrastructures: action.value,
  isDataLoaded: {
    ...state.isDataLoaded,
    infrastructures: true
  }
});

const updateKtaMappingData = (state, action) => ({
  ...state,
  ktaMapping: action.value,
  isDataLoaded: {
    ...state.isDataLoaded,
    ktaMapping: true
  }
});

const updateProjectsData = (state, action) => ({
  ...state,
  projects: action.value,
  isDataLoaded: {
    ...state.isDataLoaded,
    projects: true
  }
});

const changeCheckboxFilter = (state, action) => {
  const newFilter = state.filters;
  if (state.filters[action.id].value.some(e => e === action.value)) {
    newFilter[action.id].value = state.filters[action.id].value.filter(
      key => key !== action.value
    );
  } else {
    newFilter[action.id].value.push(action.value);
  }
  if (action.id === "forschungsgebiet") {
    newFilter.hauptthema.value = toggleAllFiltersOfField(
      newFilter,
      action.value
    );
  }
  return {
    ...state,
    filteredCategories: applyCategoryFilters(state.categories, newFilter),
    filteredCollections: applyInfraFilters(
      state.collections,
      newFilter.collections
    ),
    filteredInfrastructures: applyInfraFilters(
      state.infrastructures,
      newFilter.infrastructures
    ),
    filters: newFilter,
    filteredProjects: applyFilters(state.projects, newFilter)
  };
};

const changeTimeRangeFilter = (state, action) => {
  const newFilter = {
    ...state.filters,
    time: {
      ...state.filters.time,
      value: action.value
    }
  };
  return {
    ...state,
    filters: newFilter,
    filteredProjects: applyFilters(state.projects, newFilter)
  };
};

const toggleAllFiltersOfField = (filters, fieldValue) => {
  const subjectsOfField = filters.hauptthema.uniqueVals.filter(
    val => fieldsIntToString(topicToField(val)) === fieldValue
  );
  let newValue = filters.hauptthema.value.filter(
    val => !subjectsOfField.includes(val)
  );
  if (filters.forschungsgebiet.value.includes(fieldValue)) {
    newValue = newValue.concat(subjectsOfField);
  }
  return newValue;
};

const setSelectedProject = (state, action) => ({
  ...state,
  selectedProject: action.value
});

const setSelectedCat = (state, action) => ({
  ...state,
  selectedCat: action.value
});

const setSelectedKta = (state, action) => ({
  ...state,
  selectedKta: action.value
});

const setSelectedInfra = (state, action) => ({
  ...state,
  selectedInfra: action.value
});
const deselectItems = state => ({
  ...state,
  selectedProject: null,
  selectedInfra: null,
  selectedCat: null,
  selectedKta: null
});
const resetSelectedProject = state => ({ ...state, setSelectedProject: null });

const deactivatePopover = state => {
  const newState = {
    ...state,
    selectedProject: undefined
  };
  return newState;
};

const setSideBarComponent = (state, action) => ({
  ...state,
  sideBarComponent: action.value
});

export default reducer;
