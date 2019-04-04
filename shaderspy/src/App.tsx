import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import brace from 'brace';
import AceEditor from 'react-ace';

// Import a Mode (language)
import 'brace/mode/glsl';

// Import a Theme (okadia, github, xcode etc)
import 'brace/theme/github';

export class ShaderSnippetEditor extends React.Component {

  constructor(props: {}, context: any) {
    super(props, context);

    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue: any) {
    console.log('change', newValue);
  }

  render() {
    return (
      <div>
        <AceEditor
          mode="java"
          theme="github"
          onChange={this.onChange}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{
            $blockScrolling: true
          }}
        />
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <ShaderSnippetEditor />
      </div>
    );
  }
}

export default App;
