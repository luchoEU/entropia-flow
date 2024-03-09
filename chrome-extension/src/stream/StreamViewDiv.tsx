import React from 'react';
import { getIcon } from './background';

function getDeltaData(delta: number | undefined) {
  let deltaBackColor: string
  let deltaWord: string
  if (delta === undefined || Math.abs(delta) < 0.005)
      delta = 0
  if (delta > 0) {
      deltaBackColor = 'green'
      deltaWord = 'Profit'
  } else if (delta < 0) {
      deltaBackColor = 'red'
      deltaWord = 'Loss'
  } else {
      deltaBackColor = 'black'
      deltaWord = ''
  }
  return {
      deltaText: delta.toFixed(2),
      deltaBackColor,
      deltaWord
  }
}

const StreamViewDiv = (d: {
  background: number,
  delta: number | undefined,
  message: string | undefined
}) => {
  const { deltaText, deltaBackColor, deltaWord } = getDeltaData(d.delta)
  return (
    <div id='stream' style={{ width: '494px', height: '150px' }}>
      <div style={{ margin: '50px', position: 'absolute' }}>
        <img style={{ width: '50px', position: 'absolute', top: '0px', left: '0px' }} src={getIcon(d.background)} alt="Logo"></img>
        <div style={{ fontSize: '20px', fontWeight: 'bold', position: 'absolute', top: '0px', left: '60px', width: '200px' }}>
          Entropia Flow
        </div>
        <div style={{ fontSize: '14px', position: 'absolute', top: '26px', left: '69px', width: '200px' }}>
          Chrome Extension
        </div>
        <div style={{ fontSize: '14px', width: '170px', padding: '8px', borderRadius: '8px', textAlign: 'center', position: 'absolute', top: '0px', left: '208px', backgroundColor: deltaBackColor, color: 'white' }}>
          {deltaText} PED {deltaWord}
        </div>
        <div style={{ fontSize: '12px', width: '170px', textAlign: 'center', position: 'absolute', top: '36px', left: '208px' }}>
          {d.message ?? ''}
        </div>
      </div>
    </div>
  );
};

export default StreamViewDiv