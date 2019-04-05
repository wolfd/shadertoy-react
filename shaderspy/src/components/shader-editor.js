import React from 'react';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withActions, isBusy, getError } from 'actionware';
import { setEditorContents } from "../store";


import { convertToAst } from '../glsl-parser';

// Import a Mode (language)
import 'brace/mode/glsl';

// Import a Theme (okadia, github, xcode etc)
import 'brace/theme/github';

const actions = { setEditorContents };

const mapStateToProps = () => ({
  loading: isBusy(setEditorContents),
  error: getError(setEditorContents)
});

export class ShaderEditor extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.defaultEditorString = 'float z  = abs(1.0-mod(z,2.0));';

    this.onChange = this.onChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);

    this.aceRef = React.createRef();

    const src = 'abs(1.0-mod(z,2.0));';

    convertToAst(src);
  }

  onChange(newValue) {
    this.props.setEditorContents(this.props.fileIndex, newValue);
  }

  onSelectionChange(selection, event) {
    const text = selection.doc.getTextRange(selection.getRange());
    console.log(text);
  }

  render() {
    return (
      <div>
        <AceEditor
          mode="glsl"
          theme="github"
          defaultValue={this.defaultEditorString}
          onChange={this.onChange}
          onSelectionChange={this.onSelectionChange}
          ref={this.aceRef}
          name={`ace-editor-${this.props.fileIndex}`}
          editorProps={{
            $blockScrolling: true
          }}
        />
      </div>
    );
  }
}

ShaderEditor.propTypes = {
  fileIndex: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(withActions(actions)(ShaderEditor));
