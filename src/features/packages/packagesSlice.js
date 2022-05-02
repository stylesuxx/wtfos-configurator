import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

const initialState = {
  packages: [],
  filtered: [
    {
      name: "Test 1",
      version: "0.1.0",
      description: "Description",
      installed: false,
    },
  ],
  filter: {
    installed: true,
    search: null,
  },
  fetched: false,
  processing: false,
};

export const removePackage = createAsyncThunk(
  "packages/removePackage",
  async ({
    adb,
    name,
  }) => {
    try {
      const output = await adb.removePackage(name);

      if(output.exitCode === 0) {
        return name;
      }
    } catch(e) {
      console.log(e);
    }
  }
);

export const installPackage = createAsyncThunk(
  "packages/installPackage",
  async ({
    adb,
    name,
  }) => {
    try {
      const output = await adb.installPackage(name);

      if(output.exitCode === 0) {
        return name;
      }
    } catch(e) {
      console.log(e);
    }
  }
);

export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async (adb) => {
    let packages = [];
    try {
      packages = await adb.getPackages();
    } catch(e) {
      console.log(e);
    }

    return packages;
  }
);

function filterPackages(packages, filter) {
  let filtered = packages.filter((item) => {
    if(filter.installed) {
      return item.installed;
    }

    return true;
  });

  if(filter.search) {
    filtered = filtered.filter((item) => {
      return item.name.includes(filter.search) ||
        item.description.includes(filter.search);
    });
  }

  return filtered;
}

export const packagesSlice = createSlice({
  name: "packageManager",
  initialState,
  reducers: {
    page: (state, event) => {
      state.page = event.payload;
    },
    installedFilter: (state, event) => {
      state.filter = {
        ...state.filter,
        installed: event.payload,
      };

      state.filtered = filterPackages(state.packages, state.filter);
    },
    search: (state, event) => {
      state.filter = {
        ...state.filter,
        search: event.payload,
      };
      console.log(state.filter, state.packages);

      state.filtered = filterPackages(state.packages, state.filter);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.packages = action.payload;
        state.filtered = state.packages.filter((item) => item.installed);
        state.fetched = true;
      })
      .addCase(removePackage.pending, (state, action) => {
        state.processing = true;
      })
      .addCase(removePackage.fulfilled, (state, action) => {
        const name = action.payload;
        state.packages = state.packages.map((item) => {
          if(item.name === name) {
            item.installed = false;
          }

          return item;
        });
        state.filtered = filterPackages(state.packages, state.filter);
        state.processing = false;
      })
      .addCase(installPackage.pending, (state, action) => {
        state.processing = true;
      })
      .addCase(installPackage.fulfilled, (state, action) => {
        const name = action.payload;
        state.packages = state.packages.map((item) => {
          if(item.name === name) {
            item.installed = true;
          }

          return item;
        });
        state.filtered = filterPackages(state.packages, state.filter);
        state.processing = false;
      });
  },
});

export const {
  installedFilter,
  search,
} = packagesSlice.actions;

export const selectFetched = (state) => state.packages.fetched;
export const selectFilter = (state) => state.packages.filter;
export const selectFiltered = (state) => state.packages.filtered;
export const selectProcessing = (state) => state.packages.processing;

export default packagesSlice.reducer;