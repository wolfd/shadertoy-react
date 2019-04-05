//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piCamera
//
//==============================================================================
import * as PiVec from "./pi-vec-types";

export default function piCamera() {
  var mMatrix = PiVec.setIdentity();
  var mMatrixInv = PiVec.setIdentity();

  var mPosition = [0.0, 0.0, 0.0];
  var mXRotation = 0.0;
  var mYRotation = 0.0;

  var mPositionTarget = [0.0, 0.0, 0.0];
  var mXRotationTarget = 0.0;
  var mYRotationTarget = 0.0;

  var me = {};
  /*
    me.Set = function( pos, dir, roll)
             {
                 mMatrix    = setLookat( pos, add(pos,dir), [Math.sin(roll),Math.cos(roll),Math.sin(roll)] );
                 mMatrixInv = invertFast( mMatrix );
             };
*/
  me.SetPos = function(pos) {
    mPosition = pos;
    //mMatrix[ 3] = -(mMatrix[0] * pos[0] + mMatrix[1] * pos[1] + mMatrix[ 2] * pos[2]);
    //mMatrix[ 7] = -(mMatrix[4] * pos[0] + mMatrix[5] * pos[1] + mMatrix[ 6] * pos[2]);
    //mMatrix[11] = -(mMatrix[8] * pos[0] + mMatrix[9] * pos[1] + mMatrix[10] * pos[2]);
  };
  /*
    me.GlobalMove = function(pos)
                    {
                        mMatrix[ 3] -= (mMatrix[0] * pos[0] + mMatrix[1] * pos[1] + mMatrix[ 2] * pos[2]);
                        mMatrix[ 7] -= (mMatrix[4] * pos[0] + mMatrix[5] * pos[1] + mMatrix[ 6] * pos[2]);
                        mMatrix[11] -= (mMatrix[8] * pos[0] + mMatrix[9] * pos[1] + mMatrix[10] * pos[2]);
                        mMatrixInv = invertFast(mMatrix);
                    };
*/
  me.LocalMove = function(dis) {
    dis = PiVec.matMulvec(PiVec.setRotationY(-mYRotation), dis);
    mPositionTarget = PiVec.sub(mPositionTarget, dis);
  };

  me.RotateXY = function(x, y) {
    mXRotationTarget -= x;
    mYRotationTarget -= y;
    mXRotationTarget = Math.min(
      Math.max(mXRotationTarget, -Math.PI / 2),
      Math.PI / 2
    );
  };

  me.CameraExectue = function(dt) {
    // smooth position
    mXRotation += (mXRotationTarget - mXRotation) * 12.0 * dt;
    mYRotation += (mYRotationTarget - mYRotation) * 12.0 * dt;
    mPosition = PiVec.add(mPosition, PiVec.mul(PiVec.sub(mPositionTarget, mPosition), 12.0 * dt));

    // Make Camera matrix
    mMatrix = PiVec.matMul(
      PiVec.matMul(PiVec.setRotationX(mXRotation), PiVec.setRotationY(mYRotation)),
      PiVec.setTranslation(mPosition)
    );
    mMatrixInv = PiVec.invertFast(mMatrix);
  };

  me.GetMatrix = function() {
    return mMatrix;
  };
  me.GetMatrixInverse = function() {
    return mMatrixInv;
  };
  me.SetMatrix = function(mat) {
    mMatrix = mat;
    mMatrixInv = PiVec.invertFast(mMatrix);

    mPosition = PiVec.getXYZ(PiVec.matMulpoint(mat, [0.0, 0.0, 0.0]));
    mPositionTarget = mPosition;
  };

  me.GetPos = function() {
    return PiVec.getXYZ(PiVec.matMulpoint(mMatrixInv, [0.0, 0.0, 0.0]));
  };
  me.GetDir = function() {
    return PiVec.getXYZ(PiVec.normalize(PiVec.matMulvec(mMatrixInv, [0.0, 0.0, -1.0])));
  };

  return me;
}
