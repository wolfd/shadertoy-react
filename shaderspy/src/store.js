import { createStore } from "redux";
import * as actionware from "actionware";

export function setEditorContents(fileIndex, text) {
  return {
    fileIndex, text
  };
}

const initialState = {
  files: []
};

const rootReducer = actionware.createReducer(initialState)
  .on(setEditorContents,
    (state, editorContents) => {
      if (state.files.length < editorContents.fileIndex) {
        // we need to add to files
        return {
          ...state,
          files: [...state.files, {
            name: `${editorContents.fileIndex}.glsl`,
            text: editorContents.text
          }]
        };
      } else {
        // we can just set the file contents directly
        const newFiles = [...state.files];

        newFiles[editorContents.fileIndex] = {
          name: `${editorContents.fileIndex}.glsl`,
          text: editorContents.text
        };
        return {
          ...state,
          files: newFiles,
        }
      }
    });

export const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

actionware.setup({
  store,
});
