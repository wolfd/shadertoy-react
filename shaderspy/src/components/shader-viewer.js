import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withActions, isBusy, getError } from 'actionware';

import * as PiWeb from '../piLibsJS/pi-web-utils';
import piRenderer from '../piLibsJS/pi-renderer';

const actions = { };

const mapStateToProps = ({ files }) => ({
  files,
});

class ShaderViewer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.canvasRef = React.createRef();

    this.created = false;
    this.xRes = null;
    this.yRes = null;
    this.ratio = null;

    this.gl = null;
    this.renderer = null;
  }

  componentDidMount() {
    if (!this.canvasRef.current) {
      console.warn("what? where is my canvas?");
    }

    const canvas = this.canvasRef.current;

    this.xRes = canvas.offsetWidth;
    this.yRes = canvas.offsetHeight;
    this.ratio = this.xRes / this.yRes;

    // maybe set the dimensions of the canvas, probably can
    // do that in a more react way

    this.gl = PiWeb.piCreateGlContext(canvas);

    if (this.gl === null) {
      return;
    }

    console.log(`Rendering at ${this.xRes} x ${this.yRes}`);

    this.renderer = new piRenderer();

    if (!this.renderer.Initialize(this.gl)) {
      return;
    }
    if (!this.init()) {
      return;
    }
  }

  init() {
    return;
  }

  render() {
    return (
      <div>
        <canvas
          id="shader-canvas"
          ref={this.canvasRef}
          width={640}
          height={360}
        />
      </div>
    );
  }
}

ShaderViewer.propTypes = {
};

export default connect(mapStateToProps)(withActions(actions)(ShaderViewer));
