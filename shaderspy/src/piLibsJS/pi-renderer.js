//==============================================================================
//
// piLibs 2014-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piRenderer
//
//==============================================================================


export default function piRenderer()
{
  // private members

  var mGL = null;
  var mBindedShader = null;
  var mIs20 = false;
  var mFloat32Textures;
  var mFloat32Filter;
  var mFloat16Textures;
  var mDrawBuffers;
  var mDepthTextures;
  var mDerivatives;
  var mFloat32Filter;
  var mFloat16Filter;
  var mShaderTextureLOD;
  var mAnisotropic;
  var mRenderToFloat32F;

  var mVBO_Quad = null;
  var mVBO_Tri = null;
  var mVBO_CubePosNor = null;
  var mVBO_CubePos = null;
  var mShaderHeader = ["",""];
  var mShaderHeaderLines = [0,0];

  // public members
  var me = {};

  me.CLEAR      = { Color: 1, Zbuffer : 2, Stencil : 4 };
  me.TEXFMT     = { C4I8 : 0, C1I8 : 1, C1F16 : 2, C4F16 : 3, C1F32 : 4, C4F32 : 5, Z16 : 6, Z24 : 7, Z32 : 8 };
  me.TEXWRP     = { CLAMP : 0, REPEAT : 1 };
  me.BUFTYPE    = { STATIC : 0, DYNAMIC : 1 };
  me.PRIMTYPE   = { POINTS : 0, LINES : 1, LINE_LOOP : 2, LINE_STRIP : 3, TRIANGLES : 4, TRIANGLE_STRIP : 5 };
  me.RENDSTGATE = { WIREFRAME : 0, FRONT_FACE : 1, CULL_FACE : 2, DEPTH_TEST : 3, ALPHA_TO_COVERAGE : 4 };
  me.TEXTYPE    = { T2D : 0, T3D : 1, CUBEMAP : 2 };
  me.FILTER     = { NONE : 0, LINEAR : 1, MIPMAP : 2, NONE_MIPMAP : 3 };
  me.TYPE       = { UINT8 : 0, UINT16 : 1, UINT32 : 2, FLOAT16: 3, FLOAT32 : 4, FLOAT64: 5 };

  // private functions

  var iFormatPI2GL = function( format )
  {
    if( mIs20 )
    {
      if (format === me.TEXFMT.C4I8)  return { mGLFormat: mGL.RGBA8,           mGLExternal: mGL.RGBA,             mGLType: mGL.UNSIGNED_BYTE }
      else if (format === me.TEXFMT.C1I8)  return { mGLFormat: mGL.R8,              mGLExternal: mGL.RED,              mGLType: mGL.UNSIGNED_BYTE }
      else if (format === me.TEXFMT.C1F16) return { mGLFormat: mGL.R16F,            mGLExternal: mGL.RED,              mGLType: mGL.FLOAT }
      else if (format === me.TEXFMT.C4F16) return { mGLFormat: mGL.RGBA16F,         mGLExternal: mGL.RGBA,             mGLType: mGL.FLOAT }
      else if (format === me.TEXFMT.C1F32) return { mGLFormat: mGL.R32F,            mGLExternal: mGL.RED,              mGLType: mGL.FLOAT }
      else if (format === me.TEXFMT.C4F32) return { mGLFormat: mGL.RGBA32F,         mGLExternal: mGL.RGBA,             mGLType: mGL.FLOAT }
      else if (format === me.TEXFMT.Z16)   return { mGLFormat: mGL.DEPTH_COMPONENT16, mGLExternal: mGL.DEPTH_COMPONENT,  mGLType: mGL.UNSIGNED_SHORT }
      else if (format === me.TEXFMT.Z24)   return { mGLFormat: mGL.DEPTH_COMPONENT24, mGLExternal: mGL.DEPTH_COMPONENT,  mGLType: mGL.UNSIGNED_SHORT }
      else if (format === me.TEXFMT.Z32)   return { mGLFormat: mGL.DEPTH_COMPONENT32F, mGLExternal: mGL.DEPTH_COMPONENT,  mGLType: mGL.UNSIGNED_SHORT }
    }
    else
    {
      if (format === me.TEXFMT.C4I8)  return { mGLFormat: mGL.RGBA,            mGLExternal: mGL.RGBA,            mGLType: mGL.UNSIGNED_BYTE }
      else if (format === me.TEXFMT.C1I8)  return { mGLFormat: mGL.LUMINANCE,       mGLExternal: mGL.LUMINANCE,       mGLType: mGL.UNSIGNED_BYTE }
      else if (format === me.TEXFMT.C1F16) return { mGLFormat: mGL.LUMINANCE,       mGLExternal: mGL.LUMINANCE,       mGLType: mGL.FLOAT }
      else if (format === me.TEXFMT.C4F16) return { mGLFormat: mGL.RGBA,            mGLExternal: mGL.RGBA,            mGLType: mGL.FLOAT }
      else if (format === me.TEXFMT.C1F32) return { mGLFormat: mGL.LUMINANCE,       mGLExternal: mGL.RED,             mGLType: mGL.FLOAT }
      else if (format === me.TEXFMT.C4F32) return { mGLFormat: mGL.RGBA,            mGLExternal: mGL.RGBA,            mGLType: mGL.FLOAT }
      else if (format === me.TEXFMT.Z16)   return { mGLFormat: mGL.DEPTH_COMPONENT, mGLExternal: mGL.DEPTH_COMPONENT, mGLType: mGL.UNSIGNED_SHORT }
    }

    return null;
  }

  // public functions

  me.Initialize = function( gl )
  {
    mGL = gl;

    mIs20 = !(gl instanceof WebGLRenderingContext);

    if( mIs20 )
    {
      mFloat32Textures  = true;
      mFloat32Filter    = mGL.getExtension( 'OES_texture_float_linear');
      mFloat16Textures  = true;
      mFloat16Filter    = mGL.getExtension( 'OES_texture_half_float_linear' );
      mDerivatives      = true;
      mDrawBuffers      = true;
      mDepthTextures    = true;
      mShaderTextureLOD = true;
      mAnisotropic = mGL.getExtension( 'EXT_texture_filter_anisotropic' );
      mRenderToFloat32F = mGL.getExtension( 'EXT_color_buffer_float');
    }
    else
    {
      mFloat32Textures  = mGL.getExtension( 'OES_texture_float' );
      mFloat32Filter    = mGL.getExtension( 'OES_texture_float_linear');
      mFloat16Textures  = mGL.getExtension( 'OES_texture_half_float' );
      mFloat16Filter    = mGL.getExtension( 'OES_texture_half_float_linear' );
      mDerivatives      = mGL.getExtension( 'OES_standard_derivatives' );
      mDrawBuffers      = mGL.getExtension( 'WEBGL_draw_buffers' );
      mDepthTextures    = mGL.getExtension( 'WEBGL_depth_texture' );
      mShaderTextureLOD = mGL.getExtension( 'EXT_shader_texture_lod' );
      mAnisotropic      = mGL.getExtension( 'EXT_texture_filter_anisotropic' );
      mRenderToFloat32F = mFloat32Textures;
    }


    var maxTexSize = mGL.getParameter( mGL.MAX_TEXTURE_SIZE );
    var maxCubeSize = mGL.getParameter( mGL.MAX_CUBE_MAP_TEXTURE_SIZE );
    var maxRenderbufferSize = mGL.getParameter( mGL.MAX_RENDERBUFFER_SIZE );
    var extensions = mGL.getSupportedExtensions();
    var textureUnits = mGL.getParameter( mGL.MAX_TEXTURE_IMAGE_UNITS );
    console.log("WebGL (2.0=" + mIs20 + "):" +
    " F32 Textures: " + ((mFloat32Textures != null) ? "yes" : "no") +
    ", F16 Textures: " + ((mFloat16Textures != null) ? "yes" : "no") +
    ", Depth Textures: " + ((mDepthTextures != null) ? "yes" : "no") +
    ", Anisotropic Textures: " + ((mAnisotropic != null) ? "yes" : "no") +
    ", MRT: " + ((mDrawBuffers != null) ? "yes" : "no") +
    ", Render to 32F: " + ((mRenderToFloat32F != null) ? "yes" : "no") +
    ", Shader Texture LOD: " + ((mShaderTextureLOD != null) ? "yes" : "no") +
    ", Texture Units: " + textureUnits +
    ", Max Texture Size: " + maxTexSize +
    ", Max Render Buffer Size: " + maxRenderbufferSize +
    ", Max Cubemap Size: " + maxCubeSize );//+
    //", Extensions: " + extensions);

    //if( mDerivatives != null) mGL.hint( mDerivatives.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, mGL.NICEST);


    // create a 2D quad Vertex Buffer
    var vertices = new Float32Array( [ -1.0, -1.0,   1.0, -1.0,    -1.0,  1.0,     1.0, -1.0,    1.0,  1.0,    -1.0,  1.0] );
    mVBO_Quad = mGL.createBuffer();
    mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_Quad );
    mGL.bufferData( mGL.ARRAY_BUFFER, vertices, mGL.STATIC_DRAW );
    mGL.bindBuffer( mGL.ARRAY_BUFFER, null );

    // create a 2D triangle Vertex Buffer
    mVBO_Tri = mGL.createBuffer();
    mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_Tri );
    mGL.bufferData( mGL.ARRAY_BUFFER, new Float32Array( [ -1.0, -1.0,   3.0, -1.0,    -1.0,  3.0] ), mGL.STATIC_DRAW );
    mGL.bindBuffer( mGL.ARRAY_BUFFER, null );

    // create a 3D cube Vertex Buffer
    mVBO_CubePosNor = mGL.createBuffer();
    mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_CubePosNor );
    mGL.bufferData(
      mGL.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0, -1.0,  -1.0,  0.0,  0.0,
        -1.0, -1.0,  1.0,  -1.0,  0.0,  0.0,
        -1.0,  1.0, -1.0,  -1.0,  0.0,  0.0,
        -1.0,  1.0,  1.0,  -1.0,  0.0,  0.0,
        1.0,  1.0, -1.0,   1.0,  0.0,  0.0,
        1.0,  1.0,  1.0,   1.0,  0.0,  0.0,
        1.0, -1.0, -1.0,   1.0,  0.0,  0.0,
        1.0, -1.0,  1.0,   1.0,  0.0,  0.0,
        1.0,  1.0,  1.0,   0.0,  1.0,  0.0,
        1.0,  1.0, -1.0,   0.0,  1.0,  0.0,
        -1.0,  1.0,  1.0,   0.0,  1.0,  0.0,
        -1.0,  1.0, -1.0,   0.0,  1.0,  0.0,
        1.0, -1.0, -1.0,   0.0, -1.0,  0.0,
        1.0, -1.0,  1.0,   0.0, -1.0,  0.0,
        -1.0, -1.0, -1.0,   0.0, -1.0,  0.0,
        -1.0, -1.0,  1.0,   0.0, -1.0,  0.0,
        -1.0,  1.0,  1.0,   0.0,  0.0,  1.0,
        -1.0, -1.0,  1.0,   0.0,  0.0,  1.0,
        1.0,  1.0,  1.0,   0.0,  0.0,  1.0,
        1.0, -1.0,  1.0,   0.0,  0.0,  1.0,
        -1.0, -1.0, -1.0,   0.0,  0.0, -1.0,
        -1.0,  1.0, -1.0,   0.0,  0.0, -1.0,
        1.0, -1.0, -1.0,   0.0,  0.0, -1.0,
        1.0,  1.0, -1.0,   0.0,  0.0, -1.0
      ]),
      mGL.STATIC_DRAW
    );
    mGL.bindBuffer( mGL.ARRAY_BUFFER, null );

    // create a 3D cube Vertex Buffer
    mVBO_CubePos = mGL.createBuffer();
    mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_CubePos );
    mGL.bufferData( mGL.ARRAY_BUFFER, new Float32Array( [ -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0,  1.0, -1.0 ] ), mGL.STATIC_DRAW );
    mGL.bindBuffer( mGL.ARRAY_BUFFER, null );

    //-------------------------------------------------------------------

    mShaderHeader[0] = "";
    mShaderHeaderLines[0] = 0;
    if( mIs20 )
    {
      mShaderHeader[0] += "#version 300 es\n" +
      "#ifdef GL_ES\n"+
      "precision highp float;\n" +
      "precision highp int;\n"+
      "precision mediump sampler3D;\n"+
      "#endif\n";
      mShaderHeaderLines[0] += 6;
    }
    else
    {
      mShaderHeader[0] += "#ifdef GL_ES\n"+
      "precision highp float;\n" +
      "precision highp int;\n"+
      "#endif\n"+
      "float round( float x ) { return floor(x+0.5); }\n"+
      "vec2 round(vec2 x) { return floor(x + 0.5); }\n"+
      "vec3 round(vec3 x) { return floor(x + 0.5); }\n"+
      "vec4 round(vec4 x) { return floor(x + 0.5); }\n"+
      "float trunc( float x, float n ) { return floor(x*n)/n; }\n"+
      "mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n"+
      "float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n"+
      "float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n"+
      "mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n"+
      "mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n"+
      "float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n"+
      "float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n"+
      "float tanh(float x)  { return sinh(x)/cosh(x); }\n"+
      "float coth(float x)  { return cosh(x)/sinh(x); }\n"+
      "float sech(float x)  { return 1./cosh(x); }\n"+
      "float csch(float x)  { return 1./sinh(x); }\n"+
      "float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n"+
      "float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n"+
      "float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n"+
      "float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n"+
      "float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n"+
      "float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n";
      mShaderHeaderLines[0] += 26;
    }

    //-------------------------------------------------------

    mShaderHeader[1] = "";
    mShaderHeaderLines[1] = 0;
    if( mIs20 )
    {
      mShaderHeader[1] += "#version 300 es\n"+
      "#ifdef GL_ES\n"+
      "precision highp float;\n"+
      "precision highp int;\n"+
      "precision mediump sampler3D;\n"+
      "#endif\n";
      mShaderHeaderLines[1] += 6;
    }
    else
    {
      if( mDerivatives ) { mShaderHeader[1] += "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n"; mShaderHeaderLines[1]+=3; }
      if( mShaderTextureLOD  ) { mShaderHeader[1] += "#extension GL_EXT_shader_texture_lod : enable\n"; mShaderHeaderLines[1]++; }
      mShaderHeader[1] += "#ifdef GL_ES\n"+
      "precision highp float;\n"+
      "precision highp int;\n"+
      "#endif\n"+
      "vec4 texture(     sampler2D   s, vec2 c)                   { return texture2D(s,c); }\n"+
      "vec4 texture(     sampler2D   s, vec2 c, float b)          { return texture2D(s,c,b); }\n"+
      "vec4 texture(     samplerCube s, vec3 c )                  { return textureCube(s,c); }\n"+
      "vec4 texture(     samplerCube s, vec3 c, float b)          { return textureCube(s,c,b); }\n"+
      "float round( float x ) { return floor(x+0.5); }\n"+
      "vec2 round(vec2 x) { return floor(x + 0.5); }\n"+
      "vec3 round(vec3 x) { return floor(x + 0.5); }\n"+
      "vec4 round(vec4 x) { return floor(x + 0.5); }\n"+
      "float trunc( float x, float n ) { return floor(x*n)/n; }\n"+
      "mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n"+
      "float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n"+
      "float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n"+
      "mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n"+
      "mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n"+
      "float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n"+
      "float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n"+
      "float tanh(float x)  { return sinh(x)/cosh(x); }\n"+
      "float coth(float x)  { return cosh(x)/sinh(x); }\n"+
      "float sech(float x)  { return 1./cosh(x); }\n"+
      "float csch(float x)  { return 1./sinh(x); }\n"+
      "float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n"+
      "float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n"+
      "float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n"+
      "float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n"+
      "float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n"+
      "float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n";
      mShaderHeaderLines[1] += 30;
      if( mShaderTextureLOD )
      {
        mShaderHeader[1] += "vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }\n";
        mShaderHeader[1] += "vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }\n";
        mShaderHeaderLines[1] += 2;
      }
    }

    return true;
  };

  me.GetCaps = function ()
  {
    return {
      mIsGL20 : mIs20,
      mFloat32Textures: mFloat32Textures != null,
      mFloat16Textures: mFloat16Textures != null,
      mDrawBuffers: mDrawBuffers != null,
      mDepthTextures: mDepthTextures != null,
      mDerivatives: mDerivatives != null,
      mShaderTextureLOD: mShaderTextureLOD != null
    };
  };

  me.GetShaderHeaderLines = function (shaderType)
  {
    return mShaderHeaderLines[shaderType];
  };

  me.CheckErrors = function()
  {
    var error = mGL.getError();
    if( error != mGL.NO_ERROR )
    {
      for( var prop in mGL )
      {
        if( typeof mGL[prop] == 'number' )
        {
          if( mGL[prop] == error )
          {
            console.log( "GL Error " + error + ": " + prop );
            break;
          }
        }
      }
    }
  };

  me.Clear =  function( flags, ccolor, cdepth, cstencil )
  {
    var mode = 0;
    if( flags & 1 ) { mode |= mGL.COLOR_BUFFER_BIT;   mGL.clearColor( ccolor[0], ccolor[1], ccolor[2], ccolor[3] ); }
    if( flags & 2 ) { mode |= mGL.DEPTH_BUFFER_BIT;   mGL.clearDepth( cdepth ); }
    if( flags & 4 ) { mode |= mGL.STENCIL_BUFFER_BIT; mGL.clearStencil( cstencil ); }
    mGL.clear( mode );
  };


  me.CreateTexture = function ( type, xres, yres, format, filter, wrap, buffer)
  {
    if( mGL===null ) return null;

    var id = mGL.createTexture();

    var glFoTy = iFormatPI2GL( format );
    var glWrap = mGL.REPEAT; if (wrap === me.TEXWRP.CLAMP) glWrap = mGL.CLAMP_TO_EDGE;

    if( type===me.TEXTYPE.T2D )
    {
      mGL.bindTexture( mGL.TEXTURE_2D, id );
      //if( buffer==null )
      //mGL.texStorage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, xres, yres);
      //else
      mGL.texImage2D( mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
      mGL.texParameteri( mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap );
      mGL.texParameteri( mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap );

      if (filter === me.FILTER.NONE)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
      }
      else if (filter === me.FILTER.LINEAR)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
      }
      else if (filter === me.FILTER.MIPMAP)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_2D);
      }
      else
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_2D);
      }

      mGL.bindTexture( mGL.TEXTURE_2D, null );
    }
    else if( type===me.TEXTYPE.T3D )
    {
      if( mIs20 )
      {
        mGL.bindTexture( mGL.TEXTURE_3D, id );
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_BASE_LEVEL, 0);
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAX_LEVEL, Math.log2(xres));
        if (filter === me.FILTER.NONE)
        {
          mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
          mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
        }
        else if (filter === me.FILTER.LINEAR)
        {
          mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
          mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
        }
        else if (filter === me.FILTER.MIPMAP)
        {
          mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
          mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
        }
        else
        {
          mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
          mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
          mGL.generateMipmap(mGL.TEXTURE_3D);
        }
        mGL.texImage3D( mGL.TEXTURE_3D, 0, glFoTy.mGLFormat, xres, yres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );

        mGL.texParameteri( mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_R, glWrap );
        mGL.texParameteri( mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_S, glWrap );
        mGL.texParameteri( mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_T, glWrap );

        if (filter === me.FILTER.MIPMAP)
        mGL.generateMipmap( mGL.TEXTURE_3D );
        mGL.bindTexture( mGL.TEXTURE_3D, null );
      }
      else
      {
        return null;
      }
    }
    else
    {
      mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, id );

      mGL.texStorage2D( mGL.TEXTURE_CUBE_MAP, 1,glFoTy.mGLFormat, xres, yres );

      if( filter === me.FILTER.NONE)
      {
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
      }
      else if (filter === me.FILTER.LINEAR)
      {
        mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR );
        mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR );
      }
      else if (filter === me.FILTER.MIPMAP)
      {
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
      }

      if (filter === me.FILTER.MIPMAP)
      mGL.generateMipmap( mGL.TEXTURE_CUBE_MAP );

      mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, null );
    }
    return { mObjectID: id, mXres: xres, mYres: yres, mFormat: format, mType: type, mFilter: filter, mWrap: wrap, mVFlip:false };
  };

  me.CreateTextureFromImage = function ( type, image, format, filter, wrap, flipY)
  {
    if( mGL===null ) return null;

    var id = mGL.createTexture();

    var glFoTy = iFormatPI2GL( format );

    var glWrap = mGL.REPEAT; if (wrap === me.TEXWRP.CLAMP) glWrap = mGL.CLAMP_TO_EDGE;

    if( type===me.TEXTYPE.T2D )
    {
      mGL.bindTexture(mGL.TEXTURE_2D, id);

      mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, flipY);
      mGL.pixelStorei(mGL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      if( mIs20 ) mGL.pixelStorei(mGL.UNPACK_COLORSPACE_CONVERSION_WEBGL, mGL.NONE );

      mGL.texImage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);

      mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap);
      mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap);

      if (filter === me.FILTER.NONE)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
      }
      else if (filter === me.FILTER.LINEAR)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
      }
      else if( filter === me.FILTER.MIPMAP)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_2D);
      }
      else
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_2D);
      }

      mGL.bindTexture(mGL.TEXTURE_2D, null);
    }
    else if( type===me.TEXTYPE.T3D )
    {
      return null;
    }
    else
    {
      mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, id );
      mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, flipY);
      //mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR );
      //mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR );

      mGL.activeTexture( mGL.TEXTURE0 );
      mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, id );
      mGL.pixelStorei( mGL.UNPACK_FLIP_Y_WEBGL, flipY);
      mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[0] );
      mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[1] );
      mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, (flipY ? image[3] : image[2]) );
      mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, (flipY ? image[2] : image[3]) );
      mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[4] );
      mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[5] );

      if( filter === me.FILTER.NONE)
      {
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
      }
      else if (filter === me.FILTER.LINEAR)
      {
        mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR );
        mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR );
      }
      else if (filter === me.FILTER.MIPMAP)
      {
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
      }

      if (filter === me.FILTER.MIPMAP)
      mGL.generateMipmap( mGL.TEXTURE_CUBE_MAP );

      mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, null );

      mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, null );
    }
    return { mObjectID: id, mXres: image.width, mYres: image.height, mFormat: format, mType: type, mFilter: filter, mWrap:wrap, mVFlip:flipY };
  };

  me.SetSamplerFilter = function (te, filter)
  {
    if (te.mFilter === filter) return;

    var id = te.mObjectID;

    if (te.mType === me.TEXTYPE.T2D)
    {
      mGL.bindTexture(mGL.TEXTURE_2D, id);

      if (filter === me.FILTER.NONE)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
      }
      else if (filter === me.FILTER.LINEAR)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
      }
      else if (filter === me.FILTER.MIPMAP)
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_2D)
      }
      else
      {
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_2D)
      }

      mGL.bindTexture(mGL.TEXTURE_2D, null);

    }
    else if (te.mType === me.TEXTYPE.T3D)
    {
      mGL.bindTexture(mGL.TEXTURE_3D, id);

      if (filter === me.FILTER.NONE)
      {
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
      }
      else if (filter === me.FILTER.LINEAR)
      {
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
      }
      else if (filter === me.FILTER.MIPMAP)
      {
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_3D)
      }
      else
      {
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_3D)
      }

      mGL.bindTexture(mGL.TEXTURE_3D, null);

    }
    else
    {
      mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, id);

      if (filter === me.FILTER.NONE)
      {
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
      }
      else if (filter === me.FILTER.LINEAR)
      {
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
      }
      else if (filter === me.FILTER.MIPMAP)
      {
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP)
      }
      else
      {
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
        mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP)
      }

      mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
    }


    te.mFilter = filter;
  };

  me.SetSamplerWrap = function (te, wrap)
  {
    if (te.mWrap === wrap) return;

    var glWrap = mGL.REPEAT; if (wrap === me.TEXWRP.CLAMP) glWrap = mGL.CLAMP_TO_EDGE;

    var id = te.mObjectID;

    if (te.mType === me.TEXTYPE.T2D)
    {
      mGL.bindTexture(mGL.TEXTURE_2D, id);
      mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap);
      mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap);
      mGL.bindTexture(mGL.TEXTURE_2D, null);

    }
    else if (te.mType === me.TEXTYPE.T3D)
    {
      mGL.bindTexture(mGL.TEXTURE_3D, id);
      mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_R, glWrap);
      mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_S, glWrap);
      mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_T, glWrap);
      mGL.bindTexture(mGL.TEXTURE_3D, null);
    }

    te.mWrap = wrap;
  };

  me.SetSamplerVFlip = function (te, vflip, image)
  {
    if (te.mVFlip === vflip) return;

    var id = te.mObjectID;

    if (te.mType === me.TEXTYPE.T2D)
    {
      if( image != null)
      {
        mGL.activeTexture( mGL.TEXTURE0 );
        mGL.bindTexture(mGL.TEXTURE_2D, id);
        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, vflip);
        var glFoTy = iFormatPI2GL( te.mFormat );
        mGL.texImage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);
        mGL.bindTexture(mGL.TEXTURE_2D, null);
      }
    }
    else if (te.mType === me.TEXTYPE.CUBEMAP)
    {
      if( image != null)
      {
        var glFoTy = iFormatPI2GL( te.mFormat );
        mGL.activeTexture( mGL.TEXTURE0 );
        mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, id );
        mGL.pixelStorei( mGL.UNPACK_FLIP_Y_WEBGL, vflip);
        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[0] );
        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[1] );
        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, (vflip ? image[3] : image[2]) );
        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, (vflip ? image[2] : image[3]) );
        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[4] );
        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[5] );
        mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, null );
      }

    }

    te.mVFlip = vflip;
  };

  me.CreateMipmaps =  function (te)
  {
    if( te.mType===me.TEXTYPE.T2D )
    {
      mGL.activeTexture(mGL.TEXTURE0);
      mGL.bindTexture(mGL.TEXTURE_2D, te.mObjectID);
      mGL.generateMipmap(mGL.TEXTURE_2D);
      mGL.bindTexture(mGL.TEXTURE_2D, null);
    }
  };

  me.UpdateTexture =  function( tex, x0, y0, xres, yres, buffer )
  {
    var glFoTy = iFormatPI2GL( tex.mFormat );
    if( tex.mType===me.TEXTYPE.T2D )
    {
      mGL.activeTexture( mGL.TEXTURE0);
      mGL.bindTexture( mGL.TEXTURE_2D, tex.mObjectID );
      mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, tex.mVFlip );
      mGL.texSubImage2D( mGL.TEXTURE_2D, 0, x0, y0, xres, yres, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
      mGL.bindTexture( mGL.TEXTURE_2D, null );
    }
  };

  me.UpdateTextureFromImage = function( tex, image )
  {
    var glFoTy = iFormatPI2GL( tex.mFormat );
    if( tex.mType===me.TEXTYPE.T2D )
    {
      mGL.activeTexture( mGL.TEXTURE0 );
      mGL.bindTexture( mGL.TEXTURE_2D, tex.mObjectID );
      mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, tex.mVFlip );
      mGL.texImage2D(  mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image );
      mGL.bindTexture( mGL.TEXTURE_2D, null );
    }
  };

  me.DestroyTexture = function( te )
  {
    mGL.deleteTexture( te.mObjectID );
  };

  me.AttachTextures = function (num, t0, t1, t2, t3)
  {
    if (num > 0 && t0 != null)
    {
      mGL.activeTexture(mGL.TEXTURE0);
      if (t0.mType === me.TEXTYPE.T2D) mGL.bindTexture(mGL.TEXTURE_2D, t0.mObjectID);
      else if (t0.mType === me.TEXTYPE.T3D) mGL.bindTexture(mGL.TEXTURE_3D, t0.mObjectID);
      else if (t0.mType === me.TEXTYPE.CUBEMAP) mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t0.mObjectID);
    }

    if (num > 1 && t1 != null)
    {
      mGL.activeTexture(mGL.TEXTURE1);
      if (t1.mType === me.TEXTYPE.T2D) mGL.bindTexture(mGL.TEXTURE_2D, t1.mObjectID);
      else if (t1.mType === me.TEXTYPE.T3D) mGL.bindTexture(mGL.TEXTURE_3D, t1.mObjectID);
      else if (t1.mType === me.TEXTYPE.CUBEMAP) mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t1.mObjectID);
    }

    if (num > 2 && t2 != null)
    {
      mGL.activeTexture(mGL.TEXTURE2);
      if (t2.mType === me.TEXTYPE.T2D) mGL.bindTexture(mGL.TEXTURE_2D, t2.mObjectID);
      else if (t2.mType === me.TEXTYPE.T3D) mGL.bindTexture(mGL.TEXTURE_3D, t2.mObjectID);
      else if (t2.mType === me.TEXTYPE.CUBEMAP) mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t2.mObjectID);
    }

    if (num > 3 && t3 != null)
    {
      mGL.activeTexture(mGL.TEXTURE3);
      if (t3.mType === me.TEXTYPE.T2D) mGL.bindTexture(mGL.TEXTURE_2D, t3.mObjectID);
      else if (t3.mType === me.TEXTYPE.T3D) mGL.bindTexture(mGL.TEXTURE_3D, t3.mObjectID);
      else if (t3.mType === me.TEXTYPE.CUBEMAP) mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t3.mObjectID);
    }
  };

  me.DettachTextures = function()
  {
    mGL.activeTexture(mGL.TEXTURE0);
    mGL.bindTexture(mGL.TEXTURE_2D, null);
    mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);

    mGL.activeTexture(mGL.TEXTURE1);
    mGL.bindTexture(mGL.TEXTURE_2D, null);
    mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);

    mGL.activeTexture(mGL.TEXTURE2);
    mGL.bindTexture(mGL.TEXTURE_2D, null);
    mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);

    mGL.activeTexture(mGL.TEXTURE3);
    mGL.bindTexture(mGL.TEXTURE_2D, null);
    mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
  };

  me.CreateRenderTarget = function ( color0, color1, color2, color3, depth, wantZbuffer )
  {
    var id =  mGL.createFramebuffer();
    mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);

    if (depth === null)
    {
      if( wantZbuffer===true )
      {
        var zb = mGL.createRenderbuffer();
        mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);
        mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, color0.mXres, color0.mYres);

        mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
      }
    }
    else
    {
      mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.TEXTURE_2D, depth.mObjectID, 0);
    }

    if( color0 !=null ) mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_2D, color0.mObjectID, 0);

    if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) != mGL.FRAMEBUFFER_COMPLETE)
    return null;

    mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
    return { mObjectID: id, mTex0: color0 };
  };

  me.DestroyRenderTarget = function ( tex )
  {
    mGL.deleteFramebuffer(tex.mObjectID);
  };

  me.SetRenderTarget = function (tex)
  {
    if( tex===null ) {
      mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
    } else {
      mGL.bindFramebuffer(mGL.FRAMEBUFFER, tex.mObjectID);
    }
  };

  me.CreateRenderTargetNew = function ( wantColor0, wantZbuffer, xres, yres, samples )
  {
    var id =  mGL.createFramebuffer();
    mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);

    if( wantZbuffer===true )
    {
      var zb = mGL.createRenderbuffer();
      mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);

      if( samples==1 ) {
        mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, xres, yres);
      }
      else {
        mGL.renderbufferStorageMultisample(mGL.RENDERBUFFER, samples, mGL.DEPTH_COMPONENT16, xres, yres);
      }
      mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
    }

    if( wantColor0 )
    {
      var cb = mGL.createRenderbuffer();
      mGL.bindRenderbuffer(mGL.RENDERBUFFER, cb);
      if( samples==1 ) {
        mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.RGBA8, xres, yres);
      } else {
        mGL.renderbufferStorageMultisample(mGL.RENDERBUFFER, samples, mGL.RGBA8, xres, yres);
      }
      mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.RENDERBUFFER, cb);
    }

    if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) != mGL.FRAMEBUFFER_COMPLETE)
    {
      return null;
    }
    mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
    var color0; // TODO: fix this
    return { mObjectID: id, mXres: xres, mYres:yres, mTex0: color0 };
  };

  me.CreateRenderTargetCubeMap = function ( color0, depth, wantZbuffer )
  {
    var id =  mGL.createFramebuffer();
    mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);

    if (depth === null)
    {
      if( wantZbuffer===true )
      {
        var zb = mGL.createRenderbuffer();
        mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);
        mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, color0.mXres, color0.mYres);
        mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
      }
    }
    else
    {
      mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.TEXTURE_2D, depth.mObjectID, 0);
    }

    if( color0 !=null ) mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_CUBE_MAP_POSITIVE_X, color0.mObjectID, 0);

    if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) != mGL.FRAMEBUFFER_COMPLETE) {
      return null;
    }

    mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
    return { mObjectID: id, mTex0: color0 };
  };

  me.SetRenderTargetCubeMap = function (fbo, face)
  {
    if( fbo===null )
    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
    else
    {
      mGL.bindFramebuffer(mGL.FRAMEBUFFER, fbo.mObjectID);
      mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_CUBE_MAP_POSITIVE_X+face, fbo.mTex0.mObjectID, 0);
    }
  };


  me.BlitRenderTarget = function( dst, src )
  {
    mGL.bindFramebuffer(mGL.READ_FRAMEBUFFER, src.mObjectID);
    mGL.bindFramebuffer(mGL.DRAW_FRAMEBUFFER, dst.mObjectID);
    mGL.clearBufferfv(mGL.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
    mGL.blitFramebuffer( 0, 0, src.mXres, src.mYres,
      0, 0, src.mXres, src.mYres,
      mGL.COLOR_BUFFER_BIT, mGL.LINEAR
    );
  };

  me.SetViewport = function( vp )
  {
    mGL.viewport( vp[0], vp[1], vp[2], vp[3] );
  };

  me.SetWriteMask = function( c0, c1, c2, c3, z )
  {
    mGL.depthMask(z);
    mGL.colorMask(c0,c0,c0,c0);
  };

  me.SetState = function( stateName, stateValue )
  {
    if (stateName === me.RENDSTGATE.WIREFRAME)
    {
      if( stateValue ) mGL.polygonMode( mGL.FRONT_AND_BACK, mGL.LINE );
      else             mGL.polygonMode( mGL.FRONT_AND_BACK, mGL.FILL );
    }
    else if (stateName === me.RENDSTGATE.FRONT_FACE)
    {
      if( stateValue ) mGL.cullFace( mGL.BACK );
      else             mGL.cullFace( mGL.FRONT );
    }
    else if (stateName === me.RENDSTGATE.CULL_FACE)
    {
      if( stateValue ) mGL.enable( mGL.CULL_FACE );
      else             mGL.disable( mGL.CULL_FACE );
    }
    else if (stateName === me.RENDSTGATE.DEPTH_TEST)
    {
      if( stateValue ) mGL.enable( mGL.DEPTH_TEST );
      else             mGL.disable( mGL.DEPTH_TEST );
    }
    else if (stateName === me.RENDSTGATE.ALPHA_TO_COVERAGE)
    {
      if( stateValue ) { mGL.enable(  mGL.SAMPLE_ALPHA_TO_COVERAGE ); }
      else             { mGL.disable( mGL.SAMPLE_ALPHA_TO_COVERAGE ); }
    }
  };

  me.SetMultisample = function( v)
  {
    if( v===true )
    {
      mGL.enable(mGL.SAMPLE_COVERAGE);
      mGL.sampleCoverage(1.0, false);
    }
    else
    {
      mGL.disable(mGL.SAMPLE_COVERAGE);
    }
  };


  me.CreateShader = function (vsSource, fsSource)
  {
    if( mGL===null ) return { mProgram: null, mResult: false, mInfo: "No WebGL", mHeaderLines: 0 };

    var te = { mProgram: null, mResult: true, mInfo: "Shader compiled successfully", mHeaderLines: 0, mErrorType: 0 };

    var vs = mGL.createShader( mGL.VERTEX_SHADER   );
    var fs = mGL.createShader( mGL.FRAGMENT_SHADER );

    vsSource = mShaderHeader[0] + vsSource;
    fsSource = mShaderHeader[1] + fsSource;

    mGL.shaderSource(vs, vsSource);
    mGL.shaderSource(fs, fsSource);

    mGL.compileShader(vs);
    mGL.compileShader(fs);

    //-------------

    if (!mGL.getShaderParameter(vs, mGL.COMPILE_STATUS))
    {
      var infoLog = mGL.getShaderInfoLog(vs);
      te.mInfo = infoLog;
      te.mErrorType = 0;
      te.mResult = false;
      return te;
    }

    if (!mGL.getShaderParameter(fs, mGL.COMPILE_STATUS)) {
      var infoLog = mGL.getShaderInfoLog(fs);
      te.mInfo = infoLog;
      te.mErrorType = 1;
      te.mResult = false;
      return te;
    }
    //-------------

    te.mProgram = mGL.createProgram();

    mGL.attachShader(te.mProgram, vs);
    mGL.attachShader(te.mProgram, fs);

    mGL.linkProgram(te.mProgram);

    if (!mGL.getProgramParameter(te.mProgram, mGL.LINK_STATUS))
    {
      var infoLog = mGL.getProgramInfoLog(te.mProgram);
      mGL.deleteProgram(te.mProgram);
      te.mInfo = infoLog;
      te.mErrorType = 2;
      te.mResult = false;
      return te;
    }
    return te;
  };

  me.AttachShader = function( shader )
  {
    if( shader===null )
    {
      mBindedShader = null;
      mGL.useProgram( null );
    }
    else
    {
      mBindedShader = shader;
      mGL.useProgram(shader.mProgram);
    }
  };

  me.DetachShader = function ()
  {
    mGL.useProgram(null);
  };

  me.DestroyShader = function( tex )
  {
    mGL.deleteProgram(tex.mProgram);
  };

  me.GetAttribLocation = function (shader, name)
  {
    return mGL.getAttribLocation(shader.mProgram, name);
  };

  me.SetShaderConstantLocation = function (shader, name)
  {
    return mGL.getUniformLocation(shader.mProgram, name);
  };

  me.SetShaderConstantMat4F = function( uname, params, istranspose )
  {
    var program = mBindedShader;

    var pos = mGL.getUniformLocation( program.mProgram, uname );
    if( pos===null ) {
      return false;
    }

    if( istranspose===false )
    {
      var tmp = new Float32Array( [ params[0], params[4], params[ 8], params[12],
        params[1], params[5], params[ 9], params[13],
        params[2], params[6], params[10], params[14],
        params[3], params[7], params[11], params[15] ] );
        mGL.uniformMatrix4fv(pos,false,tmp);
    } else {
      mGL.uniformMatrix4fv(pos,false,new Float32Array(params) );
    }

    return true;
  };

  me.SetShaderConstant1F_Pos = function(pos, x)
  {
    mGL.uniform1f(pos, x);
    return true;
  };

  me.SetShaderConstant1FV_Pos = function(pos, x)
  {
    mGL.uniform1fv(pos, x);
    return true;
  };

  me.SetShaderConstant1F = function( uname, x )
  {
    var pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
    if (pos === null)
    return false;
    mGL.uniform1f(pos, x);
    return true;
  };

  me.SetShaderConstant1I = function(uname, x)
  {
    var pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
    if (pos === null)
    return false;
    mGL.uniform1i(pos, x);
    return true;
  };

  me.SetShaderConstant2F = function(uname, x)
  {
    var pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
    if (pos === null)
    return false;
    mGL.uniform2fv(pos, x);
    return true;
  };

  me.SetShaderConstant3F = function(uname, x, y, z)
  {
    var pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
    if (pos === null)
    return false;
    mGL.uniform3f(pos, x, y, z);
    return true;
  };

  me.SetShaderConstant1FV = function(uname, x)
  {
    var pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
    if (pos === null)
    return false;
    mGL.uniform1fv(pos, new Float32Array(x));
    return true;
  };

  me.SetShaderConstant3FV = function(uname, x)
  {
    var pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
    if (pos === null) return false;
    mGL.uniform3fv(pos, new Float32Array(x) );
    return true;
  };

  me.SetShaderConstant4FV = function(uname, x)
  {
    var pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
    if (pos === null) return false;
    mGL.uniform4fv(pos, new Float32Array(x) );
    return true;
  };

  me.SetShaderTextureUnit = function( uname, unit )
  {
    var program = mBindedShader;
    var pos = mGL.getUniformLocation(program.mProgram, uname);
    if (pos === null) return false;
    mGL.uniform1i(pos, unit);
    return true;
  };

  me.CreateVertexArray = function( data, mode )
  {
    var id = mGL.createBuffer();
    mGL.bindBuffer(mGL.ARRAY_BUFFER, id);
    if (mode === me.BUFTYPE.STATIC)
    mGL.bufferData(mGL.ARRAY_BUFFER, data, mGL.STATIC_DRAW);
    else
    mGL.bufferData(mGL.ARRAY_BUFFER, data, mGL.DYNAMIC_DRAW);
    return { mObject: id };
  };

  me.CreateIndexArray = function( data, mode )
  {
    var id = mGL.createBuffer();
    mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, id );
    if (mode === me.BUFTYPE.STATIC)
    mGL.bufferData(mGL.ELEMENT_ARRAY_BUFFER, data, mGL.STATIC_DRAW);
    else
    mGL.bufferData(mGL.ELEMENT_ARRAY_BUFFER, data, mGL.DYNAMIC_DRAW);
    return { mObject: id };
  };

  me.DestroyArray = function( tex )
  {
    mGL.destroyBuffer(tex.mObject);
  };

  me.AttachVertexArray = function( tex, attribs, pos )
  {
    var shader = mBindedShader;

    mGL.bindBuffer( mGL.ARRAY_BUFFER, tex.mObject);

    var num = attribs.mChannels.length;
    var stride = attribs.mStride;

    var offset = 0;
    for (var i = 0; i < num; i++)
    {
      var id = pos[i];
      mGL.enableVertexAttribArray(id);
      var dtype = mGL.FLOAT;
      var dsize = 4;
      if( attribs.mChannels[i].mType === me.TYPE.UINT8   ) { dtype = mGL.UNSIGNED_BYTE;  dsize = 1; }
      else if( attribs.mChannels[i].mType === me.TYPE.UINT16  ) { dtype = mGL.UNSIGNED_SHORT; dsize = 2; }
      else if( attribs.mChannels[i].mType === me.TYPE.FLOAT32 ) { dtype = mGL.FLOAT;          dsize = 4; }
      mGL.vertexAttribPointer(id, attribs.mChannels[i].mNumComponents, dtype, attribs.mChannels[i].mNormalize, stride, offset);
      offset += attribs.mChannels[i].mNumComponents * dsize;
    }
  };

  me.AttachIndexArray = function( tex )
  {
    mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, tex.mObject);
  };

  me.DetachVertexArray = function (tex, attribs)
  {
    var num = attribs.mChannels.length;
    for (var i = 0; i < num; i++)
    mGL.disableVertexAttribArray(i);
    mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
  };

  me.DetachIndexArray = function( tex )
  {
    mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, null);
  };

  me.DrawPrimitive = function( typeOfPrimitive, num, useIndexArray, numInstances )
  {
    var glType = mGL.POINTS;
    if( typeOfPrimitive===me.PRIMTYPE.POINTS ) glType = mGL.POINTS;
    if( typeOfPrimitive===me.PRIMTYPE.LINES ) glType = mGL.LINES;
    if( typeOfPrimitive===me.PRIMTYPE.LINE_LOOP ) glType = mGL.LINE_LOOP;
    if( typeOfPrimitive===me.PRIMTYPE.LINE_STRIP ) glType = mGL.LINE_STRIP;
    if( typeOfPrimitive===me.PRIMTYPE.TRIANGLES ) glType = mGL.TRIANGLES;
    if( typeOfPrimitive===me.PRIMTYPE.TRIANGLE_STRIP ) glType = mGL.TRIANGLE_STRIP;

    if( numInstances<=1 )
    {
      if( useIndexArray ) mGL.drawElements( glType, num, mGL.UNSIGNED_SHORT, 0 );
      else                mGL.drawArrays( glType, 0, num );
    }
    else
    {
      mGL.drawArraysInstanced(glType, 0, num, numInstances);
      mGL.drawElementsInstanced( glType, num, mGL.UNSIGNED_SHORT, 0, numInstances);
    }
  };


  me.DrawFullScreenTriangle_XY = function( vpos )
  {
    mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_Tri );
    mGL.vertexAttribPointer( vpos, 2, mGL.FLOAT, false, 0, 0 );
    mGL.enableVertexAttribArray( vpos );
    mGL.drawArrays( mGL.TRIANGLES, 0, 3 );
    mGL.disableVertexAttribArray( vpos );
    mGL.bindBuffer( mGL.ARRAY_BUFFER, null );
  };


  me.DrawUnitQuad_XY = function( vpos )
  {
    mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_Quad );
    mGL.vertexAttribPointer( vpos, 2, mGL.FLOAT, false, 0, 0 );
    mGL.enableVertexAttribArray( vpos );
    mGL.drawArrays( mGL.TRIANGLES, 0, 6 );
    mGL.disableVertexAttribArray( vpos );
    mGL.bindBuffer( mGL.ARRAY_BUFFER, null );
  };

  me.DrawUnitCube_XYZ_NOR = function( vpos )
  {
    mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_CubePosNor );
    mGL.vertexAttribPointer( vpos[0], 3, mGL.FLOAT, false, 0, 0 );
    mGL.vertexAttribPointer( vpos[1], 3, mGL.FLOAT, false, 0, 0 );
    mGL.enableVertexAttribArray( vpos[0] );
    mGL.enableVertexAttribArray( vpos[1] );
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 0, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 4, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 8, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 12, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 16, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 20, 4);
    mGL.disableVertexAttribArray( vpos[0] );
    mGL.disableVertexAttribArray( vpos[1] );
    mGL.bindBuffer( mGL.ARRAY_BUFFER, null );
  }

  me.DrawUnitCube_XYZ = function( vpos )
  {
    mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_CubePos );
    mGL.vertexAttribPointer( vpos, 3, mGL.FLOAT, false, 0, 0 );
    mGL.enableVertexAttribArray( vpos );
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 0, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 4, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 8, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 12, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 16, 4);
    mGL.drawArrays(mGL.TRIANGLE_STRIP, 20, 4);
    mGL.disableVertexAttribArray( vpos );
    mGL.bindBuffer( mGL.ARRAY_BUFFER, null );
  }

  me.SetBlend = function( enabled )
  {
    if( enabled )
    {
      mGL.enable( mGL.BLEND );
      mGL.blendEquationSeparate( mGL.FUNC_ADD, mGL.FUNC_ADD );
      mGL.blendFuncSeparate( mGL.SRC_ALPHA, mGL.ONE_MINUS_SRC_ALPHA, mGL.ONE, mGL.ONE_MINUS_SRC_ALPHA );
    }
    else
    {
      mGL.disable( mGL.BLEND );
    }
  };

  me.GetPixelData = function( data, offset, xres, yres )
  {
    mGL.readPixels(0, 0, xres, yres, mGL.RGBA, mGL.UNSIGNED_BYTE, data, offset);
  };

  return me;
}
