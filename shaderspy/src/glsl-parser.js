import TokenString from 'glsl-tokenizer/string';
import ParseTokens from 'glsl-parser/direct';

export function convertToAst(src) {
  const tokens = TokenString(src);
  const ast = ParseTokens(tokens);

  return ast;
}
