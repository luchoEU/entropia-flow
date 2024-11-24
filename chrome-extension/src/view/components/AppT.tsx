import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { createStore } from 'redux';

const SIZE = 3;

// ** Redux - Selectors**
const getValues = (s) => s.inputValues
const getValue = (index) => (s) => getValues(s)[index]

// ** Redux - Action Types**
const SET_INPUT_VALUE = 'SET_INPUT_VALUE';

// ** Redux - Action Creators**
const setInputValue = (index, value) => ({
  type: SET_INPUT_VALUE,
  payload: { index, value }
});

// ** Redux - Reducer**
const initialState = {
  inputValues: Array(SIZE).fill(''),  // initialize with 3 empty strings
};

const inputReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_INPUT_VALUE:
      const newValues = [...state.inputValues];
      newValues[action.payload.index] = action.payload.value;
      return { ...state, inputValues: newValues };
    default:
      return state;
  }
};

// ** Redux - Store**
const store = createStore(inputReducer);

// ** Row Component**
const Row = ({ index, style, f }) => {
  // Accessing state and dispatch from Redux store
  const v = useSelector(getValue(index));
  const dispatch = useDispatch();

  return (
    <div style={style} className="row">
      {f(index)} -
      <input
        type="text"
        value={v}
        onChange={e => dispatch(setInputValue(index, e.target.value))}
      />
    </div>
  );
};

const _App = () => {
  const inputValues = useSelector(getValues);

  const f = x => `f${x}`
  const renderRow = useCallback(
    ({ index, style }) => (
      <Row
        index={index}
        style={style}
        f={f}
      />
    ),
    []
  );

  return (
    <div>
      <List
        height={400}
        itemCount={inputValues.length}
        itemSize={35}
        width={300}
      >
        {renderRow}
      </List>
    </div>
  );
};

const App = () =>
  <Provider store={store}>
    <_App />
  </Provider>

export default App
