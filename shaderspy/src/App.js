import React, { Component } from 'react';
import './App.css';

import ShaderEditor from './components/shader-editor';
import ShaderViewer from './components/shader-viewer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ShaderEditor fileIndex={0} />
        <ShaderViewer />
      </div>
    );
  }
}

export default App;
